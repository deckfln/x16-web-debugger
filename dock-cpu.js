let currentPC = undefined;
let currentStatus = undefined;
let currentBank = undefined;

function check_cpu()
{
    setInterval(dock_cpu, 250);
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
        $('#pc').html("PC : " + snprintf(json.pc,"%04X"));
        $('#sp').html("sp : " + snprintf(json.sp,"%02X"));
        $('#a').html("A : " + snprintf(json.a,"%02X"));
        $('#x').html("X : " + snprintf(json.x,"%02X"));
        $('#y').html("Y : " + snprintf(json.y,"%02X"));

        let n = (json.flags & 0x80) ? "N" : "-";
        let v = (json.flags & 0x40) ? "V" : "-";
        let b = (json.flags & 0x10) ? "B" : "-";
        let d = (json.flags & 0x08) ? "D" : "-";
        let i = (json.flags & 0x04) ? "I" : "-";
        let c = (json.flags & 0x02) ? "C" : "-";
        let z = (json.flags & 0x01) ? "Z" : "-";

        $('#status').html("Flags : " + n+v+"-"+b+d+i+c+z);

        if (json.myStatus == 0 && (currentPC != json.pc || currentBank != json.bank)) {            
            currentBank = json.bank;
            currentPC = json.pc;

            let found = $('#brk'+currentPC);   // PC is on screen ?
            if (found.length == 0) {
                // jumped page
                dock_disasm(currentBank, currentPC);
            }
            else {
                // move PC on screen
                dock_disam_refresh();
            }
            source_update();
            memory_update();
            dock_registers();
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