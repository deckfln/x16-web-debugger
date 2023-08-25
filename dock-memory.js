function memory_dump(event)
{
    if (event.key == "Enter") {
        let goto = $('#dump').val();
        goto = parseInt(goto, 16);
        dock_memory(0, goto);
    }
}

let memory_current = {'bank':0, 'addr': 0}
let memory_prev = {'bank':0, 'addr':0, 'bytes':undefined};

function memory_update()
{
    dock_memory(memory_current.bank, memory_current.addr);
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
        let prev = (bank == memory_current.bank && address == memory_current.addr && memory_prev.bytes != undefined)
        let clss = undefined

        for (y=0; y<16; y++) {
            let tr=$('<tr>');
            tr.append("<td class=\"pc\">" + snprintf(addr,"%04X") + "</td>");

            for (x=0; x<16; x++) {
                clss = "class=memory"
                if (prev && memory_prev.bytes[i] != bytes[i]) {
                    clss = "class=memory-changed"
                }
                tr.append( "<td " + clss + ">" + snprintf(bytes[i],"%02X") + "</td>");
                i++;
            }
            addr += 16;
            table.append(tr);
        }
        $('#memory')[0].innerHTML = table[0].outerHTML;

        memory_prev.bank = memory_current.bank
        memory_prev.addr = memory_current.addr
        memory_prev.bytes = bytes
         
        memory_current.bank = bank
        memory_current.addr = address
    })
}