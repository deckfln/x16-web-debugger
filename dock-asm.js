function dock_disasm(remote)
{
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let container = $("#disam");
        let table = $("<table>");
        let tbody = $("<tbody>");
    
        let bytes = new Uint8Array( buffer );
        let pc = 0
        let asm = {
            pc: 0,
            start: 0x80d,
            txt: "",
            next: 0
        }
        while (asm.next < 256) {
            disam_line(bytes, asm, 0);
    
            let tr = $("<tr>");
            let adr = $("<td>");
            adr.text(snprintf(asm.pc + asm.start, "%04X"));
            let txt = $("<td>");
            txt.text(asm.txt);
    
            tr.append(adr);
            tr.append(txt);
    
            tbody.append(tr);
            asm.pc = asm.next;
        }
        table.append(tbody);
        container.append(table);
    })
    .catch (error => { 
        console.log(error);
    })       
}
