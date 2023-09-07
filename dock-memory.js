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
    'start': 0
}

function memory_dump(event)
{
    if (event.key == "Enter") {
        let goto = $('#dump').val();
        goto = parseInt(goto, 16);
        dock_memory(0, goto);
    }
}

function memory_update()
{
    dock_memory(memory.current.bank, memory.current.addr);
}

function memory_toggleWatch(address, bank, len, upload)
{
    let remote = "http://localhost:9009/watch/"+bank+"/"+address
    if (len != undefined) {
        remote += ("/" + len)
    } 

    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok" && upload != undefined) {
            load_breakpoints(dock_disam_update);
            memory_update()
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
        let counter = 0

        for (y=0; y<16; y++) {
            let tr=$('<tr>');
            tr.append("<td class=\"pc\">" + snprintf(addr,"%04X") + "</td>");

            for (x=0; x<16; x++) {
                clss = "brk_memory"
                if (prev && memory.prev.bytes[i] != bytes[i]) {
                    clss += " memory-changed"
                }
                if (Breakpoints[address + i] != undefined ) {
                    counter = Breakpoints[address + i].len
                }

                if (counter > 0) {
                    clss += " memory-monitor"
                    counter--
                }
                
                tr.append( "<td id=\"mem_" + (address + i) + "\" class=\"" + clss + "\">"  + snprintf(bytes[i],"%02X") + "</td>");
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