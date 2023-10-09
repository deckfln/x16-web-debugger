/****************************
 * Monitor if the binary got rebuild and reload everything in the debugger and in the emulator
 */
"use strict";

let Binary = {
    lastModified: 0
}

function binary_monitor()
{
    setInterval(binary_check, 1000);
}

function binary_check()
{
    let p = fetch("/code/" + Config.binary, { method: "HEAD" })
    .then(response => {
        let lastModified = Date.parse(response.headers.get("last-modified"))
        if (Binary.lastModified >0 && lastModified > Binary.lastModified) {
            Binary.lastModified = lastModified
            const reload = confirm("New build of the PRG detected, shall we reload eveything ?");
            if (reload) {
                debug_restart()
                ide_restart()
            }
        }
        else if (Binary.lastModified == 0) {
            Binary.lastModified = lastModified
        }
    })
    .catch(error => {
        console.log(error)
    })
    return p
}
