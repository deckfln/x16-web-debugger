let Vram = {
    'addr' : 0,
    'prev' : {
        'addr': 0,
        'bytes': undefined
    },
    'start': 0
}

$(function() {
    $.contextMenu({
        selector: '.brk_vram', 
        callback: function(key, options) {
            let id = $(this).attr('id').substring(5)
            let addr = parseInt(id)
            switch (key) {
                case 'ubyte':
                case 'byte':
                    vram_toggleWatch(addr, 1)
                    break;
                case 'uword':
                case 'word':
                    vram_toggleWatch(addr, 2)
                    break;
                case 'ulong':
                case 'long':
                    vram_toggleWatch(addr, 4)
                    break;
            }
        },
        items: {
            "ubyte": {name: "Monitor as byte"},
            "uword": {name: "Monitor as word"},
            "ulong": {name: "Monitor as long"},
        }
    });
});

/**
 * create a new dock
 */
function new_dock_vram()
{
    const html='<div class="vram-menu"><input type="text" id="vdump" name="dmp" required minlength="4" maxlength="4" size="10" onkeypress="vram_dump(event)"/></div><div id="vram" style="overflow:scroll;"></div>'
    dock_new("VRAM", "dock-vram")
    let node = $('#dock-vram')
    node.html(html)
    vram_update()
}

/**
 * Display a new vram location
 * @param {*} event 
 */
function vram_dump(event)
{
    if (event.key == "Enter") {
        let goto = $('#vdump').val();
        goto = parseInt(goto, 16);
        dock_vram(goto);
    }
}

/**
 * 
 */
function vram_update()
{
    dock_vram(Vram.addr);
}

/**
 * 
 * @param {*} address 
 * @param {*} bank 
 * @param {*} len 
 * @param {*} upload 
 */
function vram_toggleWatch(address, len, upload)
{
    let bank = (address & 0x10000) >> 16
    let addr = (address & 0x0ffff)
    let remote = "http://localhost:9009/vwatch/" + bank + "/" + addr
    if (len != undefined) {
        remote += ("/" + len)
    } 

    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok" && upload == undefined) {
            // only download the breakpointIF we are not uploading the current breakpoint
            load_breakpoints();
            vram_update()
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

/**
 * Download 256 bytes from vram
 * @param {*} bank 
 * @param {*} address 
 */
function dock_vram(address)
{
    let remote = "http://localhost:9009/vera/dump/" + address;
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer )
    
        let table=$('<table>');
        let i = 0;
        let prev = (address == Vram.addr && Vram.prev.bytes != undefined)
        let clss = undefined
        let counter = 0

        for (y=0; y<16; y++) {
            let tr=$('<tr>');
            tr.append("<td class=\"addr\">" + snprintf(address,"%05X") + "</td>");

            for (x=0; x<16; x++) {
                let type = bytes[i]
                let byte = bytes[i + 1]
                clss = "brk_vram"

                if (prev && Vram.prev.bytes[i+1] != bytes[i+1]) {
                    clss += " updated"
                }
                if (Breakpoints[address] != undefined && Breakpoints[address].type == "vwatch") {
                    counter = Breakpoints[address].len
                }

                if (counter > 0) {
                    clss += " memory-monitor"
                    counter--
                }
                
                tr.append( "<td id=\"vmem_" + address + "\" class=\"" + clss + "\">"  + snprintf(byte,"%02X") + "</td>");
                i += 2
                address++
            }
            table.append(tr);
        }
        $('#vram')[0].innerHTML = table[0].outerHTML;

        Vram.prev.addr = Vram.addr
        Vram.prev.bytes = bytes
         
        Vram.addr = address
    })
}