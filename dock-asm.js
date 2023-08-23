let aDisasm = [];

function dock_disasm(bank, address)
{
    let remote = "http://localhost:9009/dump/" + bank + "/" + address;
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );
        let pc = 0
        let asm = {
            pc: 0,
            start: address,
            txt: "",
            symbol: undefined,
            next: 0
        }
        let brk=false;
        let i = 0;
        let newMap = aDisasm.length == 0;

        while (asm.next < 253) {
            // ignore the last 3 bytes, as the instruction my go over buffer
            disam_line(bytes, asm, 0);
            brk=false;
            if (Breakpoints[asm.pc + asm.start] != undefined) {
                brk = true;
            }

            if (i >= aDisasm.length) {
                aDisasm.push({
                    'addr':asm.pc + asm.start,
                    'instr':asm.txt,
                    'symbol': asm.symbol
                })
            }
            else {
                aDisasm[i].addr = asm.pc + asm.start;
                aDisasm[i].instr = asm.txt;
                aDisasm[i].symbol = asm.symbol;
            }
            asm.pc = asm.next;
            i++;
        }
        dock_disam_refresh();
    })
    .catch (error => { 
        console.log(error);
    })       
}

function dock_disam_refresh()
{
    let table=$('<table>');
    for (i=0; i<32; i++) {
        let $tr=$('<tr>');

        let src = "images/breakpoint/off.png";
        let addr = aDisasm[i].addr;
        let symbol = aDisasm[i].symbol; if (symbol == undefined) symbol = "";
        if (addr == currentPC) {
            if (Breakpoints[addr] != undefined) {
                src = "images/breakpoint/brk_pc.png"
            }
            else {
                src = "images/breakpoint/pc.png"
            }                                
        }
        else if (Breakpoints[addr] != undefined) {
            src = "images/breakpoint/on.png"
        }
        let img = "<img id='brk"+addr+"' src='"+src+"'/ onClick='toggleBreapoint(" + i + "," + addr + ",0);'>"

        $tr.append("<td>"+symbol+"</td><td>"+img+"</td><td>"+snprintf(aDisasm[i].addr,"%04X")+"</td><td>"+aDisasm[i].instr)+"</td>";
        table.append($tr);
    }
    $('#disam')[0].innerHTML = table[0].outerHTML;
}