/**
 * monitor the emulator
 */
let Emulator = {
    'monitor': undefined,
    'pid': -1,
    'status': undefined,
    'inBasic': true
}

function emulator_run()
{
    if (Emulator.timer == undefined) {
        Emulator.timer = setInterval(emulator_check, 100)    
    }
}

function emulator_check()
{
    let remote = "http://localhost:9009/emulator";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        switch (Emulator.status) {
            case undefined:
            case "disconnected":
                Emulator.status = "connected"
                Emulator.inBasic = json.inBasic
                cpu_run()
                debug_activate()
                break
        }

        if (Emulator.pid < 0) {
            // we are just starting, download breakpoints from the emulator
            Emulator.pid = json.pid
            breakpoints_load()
            dock_disasm(0, 0)           // reload the asm code
        }
        else if (json.pid != Emulator.pid) {
            // we are speaking to a new emulator, prabably the user closed the emulator
            Emulator.pid = json.pid        
            dock_disasm(cpu.currentBank, cpu.pc)           // reload the asm code
            breakpoints_upload()    // upload breakpoints to a new emulator
            if (Emulator.inBasic) {
                debug_run()         // and restart the prg
            }
        }
    })
    .catch (error => { 
        console.log(error)

        // suspend all components when the emulator is unavailable
        if (Emulator.status != "disconnected") {
            Emulator.status = "disconnected"
            cpu_pause()         // suspend cpu monitoring
            debug_deactivate()  // deactivate all features on the debugbar
        }
    })
}