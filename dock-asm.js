function dock_disasm(remote, callback)
{
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let table = [];
        let bytes = new Uint8Array( buffer );
        let pc = 0
        let asm = {
            pc: 0,
            start: 0x80d,
            txt: "",
            next: 0
        }
        let brk=false;
        while (asm.next < 256) {
            disam_line(bytes, asm, 0);
            brk=false;
            if (Breakpoints[asm.pc + asm.start] != undefined) {
                brk = true;
            }
            table.push({
                'breakpoint':brk,
                'addr':asm.pc + asm.start,
                'instr':asm.txt
            })
            asm.pc = asm.next;
        }
        return table
    })
    .then (table => {
        let source = {
            localData:table,
            dataType: "array",
            dataFields:
            [
                { name: 'breakpoint', type: 'boolean' },
                { name: 'addr', type: 'string' },
                { name: 'instr', type: 'string' }
            ]
        };
        
        var dataAdapter = new $.jqx.dataAdapter(source);
        $("#disam").jqxDataTable(
        {
            width: '100%',
            pageable: false,
            source: dataAdapter,
            columnsResize: false,
            columns: [
                {
                    width: 16,
                    text: 'B', columnType: 'none', editable: false, sortable: false, dataField: 'breakpoint', cellsRenderer: function (row, column, value) {
                        // render custom column.
                        let src = "images/breakpoint/off.png";
                        if (value) {
                            src = "images/breakpoint/on.png"
                        }
                        let addr = table[row].addr;
                        return "<img id='brk"+addr+"' src='"+src+"'/ onClick='toggleBreapoint(" + row + "," + addr + ",0);'>"
                    }
                },
                { text: 'addr', dataField: 'addr', width: 100 },
                { text: 'instr', dataField: 'instr'},
            ]
        });
    })
    .catch (error => { 
        console.log(error);
    })       
}
