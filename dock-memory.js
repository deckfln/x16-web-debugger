function memory_dump(event)
{
    if (event.key == "Enter") {
        let goto = $('#dump').val();
        goto = parseInt(goto, 16);
        dock_memory(0, goto);
    }
}

let memory = {
    'current' : {
        'bank': 0,
        'addr': 0
    },
    'prev' : {
        'bank':0,
        'addr': 0,
        'bytes': undefined
    },
}
function memory_update()
{
    dock_memory(memory.current.bank, memory.current.addr);
}

function memory_toggleWatch(address, bank)
{
    let remote = "http://localhost:9009/watch/"+bank+"/"+address;
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
            load_breakpoints(dock_disam_refresh);
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function dock_memory(bank, address)
{
    let remote = "http://localhost:9009/dump/" + bank + "/" + address;
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );
    
        let table=$('<table>');
        let addr = address;
        let i = 0;
        let prev = (bank == memory.current.bank && address == memory.current.addr && memory.prev.bytes != undefined)
        let clss = undefined

        for (y=0; y<16; y++) {
            let tr=$('<tr>');
            tr.append("<td class=\"pc\">" + snprintf(addr,"%04X") + "</td>");

            for (x=0; x<16; x++) {
                clss = "class=memory"
                if (prev && memory.prev.bytes[i] != bytes[i]) {
                    clss = "class=memory-changed"
                }
                tr.append( "<td " + clss + " onclick=\"memory_toggleWatch(" + (addr + i) + ", 0);\">" + snprintf(bytes[i],"%02X") + "</td>");
                i++;
            }
            addr += 16;
            table.append(tr);
        }
        $('#memory')[0].innerHTML = table[0].outerHTML;

        memory.prev.bank = memory.current.bank
        memory.prev.addr = memory.current.addr
        memory.prev.bytes = bytes
         
        memory.current.bank = bank
        memory.current.addr = address
    })
}