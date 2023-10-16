"use strict";

let currentStatus = undefined;
let currentBank = undefined;

let cpu = {
    'pid': -1,                      // emulator pid
    'status': 1,
    'previous_pc': undefined,
    'pc': undefined,
    'a': undefined,
    'x': undefined,
    'y': undefined,
    'timer': undefined,
    'registers': Array(5)
}

/**
 * Emulator is running, so monitor
 */
function cpu_run()
{
    if (cpu.timer == undefined) {
        $("#emu").html("Running")
        cpu.timer = setInterval(cpu_check, 100)    
    }
}

/**
 * Emulator is paused, stop monitoring
 */
function cpu_pause()
{
    $("#emu").html("Paused")
    clearInterval(cpu.timer)
    cpu.timer = undefined
}

/**
 * create a new dock
 */
function new_dock_cpu()
{
    const cpuHTML='<table><tr><td>Emu</td><td id="emu">Disconnected</td></tr><tr><td>PC</td><td id="pc"></td></tr><tr><td>SP</td><td id="sp"></td></tr><tr><td>A</td><td id="a"></td></tr><tr><td>X</td><td id="x"></td></tr><tr><td>Y</td><td id="y"></td></tr><tr><td>Flags</td><td id="status"></td></tr></table><div id="registers"></div><div id="vera"></div>'

    dock_new("Cpu", "dock-cpu")
    let div = $("#dock-cpu")
    div.html(cpuHTML)
}

/**
 * check the status of the emulator
 */
function cpu_check()
{
    let remote = "http://localhost:9009/cpu";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {

        // reactive run & restart after a network disconnection
        if (cpu.status < 0) {
            $("#run").removeClass("disabled-link")
            $("#restart").removeClass("disabled-link")
        }

        if (cpu.pid < 0) {
            // we are just starting, download breakpoints from the emulator
            cpu.pid = json.pid
            breakpoints_load()
        }
        else if (json.pid != cpu.pid) {
            // we are speaking to a new emulator, prabably the user closed the emulator
            cpu.pid = json.pid
            breakpoints_upload()    //upload breakpoints to a new emulator
            debug_restart()         //and restart the prg
        }

        $('#pc').html(snprintf(json.pc,"%04X"));
        $('#sp').html(snprintf(json.sp,"%02X"));

        if (json.a != cpu.a) {
            $('#a').html(snprintf(json.a,"%02X"));
            $('#a').addClass("updated")
            cpu.a = json.a
        }
        else {
            $('#a').removeClass("updated")
        }
        if (json.x != cpu.x) {
            $('#x').html(snprintf(json.x,"%02X"));
            $('#x').addClass("updated")
            cpu.x = json.x
        }
        else {
            $('#x').removeClass("updated")
        }
        if (json.y != cpu.y) {
            $('#y').html(snprintf(json.y,"%02X"));
            $('#y').addClass("updated")
            cpu.y = json.y
        }
        else {
            $('#y').removeClass("updated")
        }

        let n = (json.flags & 0x80) ? "N" : "-";
        let v = (json.flags & 0x40) ? "V" : "-";
        let b = (json.flags & 0x10) ? "B" : "-";
        let d = (json.flags & 0x08) ? "D" : "-";
        let i = (json.flags & 0x04) ? "I" : "-";
        let c = (json.flags & 0x02) ? "Z" : "-";
        let z = (json.flags & 0x01) ? "C" : "-";

        $('#status').html(n+v+"-"+b+d+i+c+z);

        if (json.myStatus == 0) {
            // the emulator entered suspended mode
            cpu_pause()
        }

        if (json.myStatus != cpu.status) {
            if (json.myStatus == 0) {
                // debug buttons are visible
                $("#continue").removeClass("disabled-link")
                $("#stepinto").removeClass("disabled-link")
                $("#stepover").removeClass("disabled-link")
                $("#stepout").removeClass("disabled-link")   

                // intercept debug keys
                document.onkeydown = function(evt) {
                    switch (evt.key) {
                        case 'F5':
                            debug_continue()
                            return false;
                        case 'F10':
                            debug_stepover()
                            return false;
                        case 'F11':
                            debug_stepinto()
                            return false;
                    }
                };        
            }
            else {
                // debug buttons are hidden
                $("#continue").addClass("disabled-link")
                $("#stepinto").addClass("disabled-link")
                $("#stepover").addClass("disabled-link")
                $("#stepout").addClass("disabled-link")

                // release debug keys
                document.onkeydown = undefined
            }

            cpu.status = json.mystatus
        }

        if (json.myStatus == 0) {            
            currentBank = json.bank;
            cpu.pc = json.pc;

            let found = $('#brk' + cpu.pc);   // PC is on screen ?
            if (found.length == 0) {
                // jumped page
                dock_disasm(currentBank, cpu.pc);
            }
            else {
                // move PC on screen
                dock_disam_update();
            }
            source_update_pc()
            memory_update()
            dock_registers()
            dock_vera()
            watches_update()
            tiles_update()
        }
    })
    .catch (error => { 
        $("#run").addClass("disabled-link")
        $("#restart").addClass("disabled-link")
        $("#continue").addClass("disabled-link")
        $("#stepinto").addClass("disabled-link")
        $("#stepover").addClass("disabled-link")
        $("#stepout").addClass("disabled-link")
        $("#emu").html("Disconnected")
        cpu.status = -1
    })
}

function clickPress(event)
{
    if (event.key == "Enter") {
        let goto = $('#goto').val();
        goto = parseInt(goto, 16);
        dock_disasm(0, goto);
    }
}