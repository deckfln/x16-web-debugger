let currentStatus = undefined;
let currentBank = undefined;

let cpu = {
    'status': 1,
    'previous_pc': undefined,
    'pc': undefined
}

function check_cpu()
{
    setInterval(dock_cpu, 100);
}

function dock_cpu()
{
    let remote = "http://localhost:9009/cpu";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        $('#pc').html(snprintf(json.pc,"%04X"));
        $('#sp').html(snprintf(json.sp,"%02X"));
        $('#a').html(snprintf(json.a,"%02X"));
        $('#x').html(snprintf(json.x,"%02X"));
        $('#y').html(snprintf(json.y,"%02X"));

        let n = (json.flags & 0x80) ? "N" : "-";
        let v = (json.flags & 0x40) ? "V" : "-";
        let b = (json.flags & 0x10) ? "B" : "-";
        let d = (json.flags & 0x08) ? "D" : "-";
        let i = (json.flags & 0x04) ? "I" : "-";
        let c = (json.flags & 0x02) ? "C" : "-";
        let z = (json.flags & 0x01) ? "Z" : "-";

        $('#status').html(n+v+"-"+b+d+i+c+z);

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

        if (json.myStatus == 0 && (cpu.pc != json.pc || currentBank != json.bank)) {            
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
            source_update();
            memory_update();
            dock_registers();
            watches_update()
        }
    })
    .catch (error => { 
        console.log(error);
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