let Breakpoints={};

/**
 * create a new dock
 */
function new_dock_breakpoints()
{
    dock_new("Breakpoints", "dock-breakpoint")
    load_breakpoints()
}

function toggleBreapoint(addr, bank, upload)
{
    let remote = "http://localhost:9009/breakpoint/0/"+addr;
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok" && upload == undefined) {
            source_toggleBreakpoint(addr);
            disasm_toggleBreakpoint(addr);
            breakpoints_load();
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

/**
 * Load both CPU breakpoints and memory watches and VRAM breakpoint
 * @param {*} callback 
 */
function breakpoints_load(callback)
{
    let remote = "http://localhost:9009/breakpoint";
    let p = fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        Breakpoints = {}
        for (let i in json) {
            let addr = parseInt(json[i].addr);
            let bank = parseInt(json[i].bank);
            Breakpoints[addr] = { 'type': 'brk', 'bank': bank };
        }

        let remote = "http://localhost:9009/watch";
        fetch (remote, {
            method: 'GET',
            mode: "cors"
        })
        .then ( response => response.json())
        .then ( json => {
            for (let i in json) {
                let addr = parseInt(json[i].addr);
                let bank = parseInt(json[i].bank);
                let len = parseInt(json[i].len);
                let status = parseInt(json[i].status);

                if ((status & 0x80) == 0x80) {
                    // VRAM break
                    Breakpoints[addr] = { 'type': 'vwatch', 'len': len, 'bank': bank };
                }
                else {
                    // RAM break
                    Breakpoints[addr] = { 'type': 'watch', 'len': len, 'bank': bank };
                }
            }
    
            breakpoints_update();
            if (callback) {
                callback();
            }

            return "ok"
        })
    })
    .catch (error => { 
        console.log(error);
    })

    return p
}

function breakpoints_update()
{
    const watchAs = {
        1: 'byte',
        2: 'word',
        4: 'long'
    }
    let table=$('<table>');
    let type=undefined
    let toggle=undefined
    let clss=undefined
    for (let addr in Breakpoints) {
        let tr=$('<tr>');
        let adr
        switch (Breakpoints[addr].type) {
            case "brk":
                type = "break"
                toggle="toggleBreapoint"
                clss="brk_cpu"
                // mark the bank
                adr = Breakpoints[addr].bank + ":" + snprintf(addr,"%04X")
                break
            case "watch":
                type="monitor as " + watchAs[Breakpoints[addr].len]
                toggle="memory_toggleWatch"
                clss="brk_memory"
                // mark the bank
                adr = Breakpoints[addr].bank + ":" + snprintf(addr,"%04X")
                break
            case "vwatch":
                type="monitor as " + watchAs[Breakpoints[addr].len]
                toggle="vram_toggleWatch"
                clss="brk_vmemory"
                // display VRAM as a single block
                adr = Breakpoints[addr].bank + snprintf(addr,"%04X")
                break
            }
        let onclick = "onClick='"+toggle+"(" + addr + ",0);'"

        tr.append('<td class="breakpoint"' + onclick + '></td><td>' + adr + "</td><td>" + type + "</td><td>"+"</td>")
        tr.attr('class', clss)
        tr.attr('id', "brk_"+addr)
        table.append(tr);
    }
    table.attr("class", "code")
    document.getElementById("dock-breakpoint").innerHTML = table[0].outerHTML;
}

/**
 * upload the breakpoints to the emulator
 */
function breakpoints_upload()
{
    for (let addr in Breakpoints) {
        if (Breakpoints[addr].type == 'brk') {
            toggleBreapoint(addr, Breakpoints[addr].bank, "upload")
        }
        else {
            memory_toggleWatch(addr, Breakpoints[addr].bank, Breakpoints[addr].len, "upload")
        }
    } 
}