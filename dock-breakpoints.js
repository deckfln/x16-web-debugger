let Breakpoints={};

function toggleBreapoint(row, addr, bank)
{
    let remote = "http://localhost:9009/breakpoint/0/"+addr;
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
            dock_breakpoints(dock_disam_refresh);
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

let aBreakpoints = [];

function dock_breakpoints(callback)
{
    let remote = "http://localhost:9009/breakpoint";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        Breakpoints = {}
        aBreakpoints.length = 0;
        for (i in json) {
            Breakpoints[json[i].addr] = json[i].bank;
            aBreakpoints.push(json[i]);
        }
        if ($("#tablebreakpoints").length == 0) {
            let source = {
                localData:aBreakpoints,
                dataType: "array",
                dataFields:
                [
                    { name: 'addr', type: 'hexadecimal' },
                    { name: 'bank', type: 'number' }
                ]
            };
            var dataAdapter = new $.jqx.dataAdapter(source);
            $("#breakpoints").jqxDataTable(
            {
                width: '100%',
                source: dataAdapter,
                columnsResize: true,
                columns: [
                    {
                        width: 16,
                        text: 'B', columnType: 'none', editable: false, sortable: false, dataField: null, cellsRenderer: function (row, column, value) {
                            // render custom column.
                            let addr = aBreakpoints[row].addr;
                            return "<img id='brk" + addr + "' src='images/breakpoint/on.png' onClick='toggleBreapoint(" + row + "," + addr + ",0);'>"
                        }
                    },
                    { text: 'addr', dataField: 'addr', width: 100,cellsRenderer: function (row, column, value) {
                        // render custom column.
                        let addr = snprintf(aBreakpoints[row].addr,"%04X");
                        return addr;
                    } },
                    { text: 'bank', dataField: 'bank'},
                ]
            });
        }
        else {
            $("#breakpoints").jqxDataTable('updateBoundData');;
        }

        if (callback) {
            callback();
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}
