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
            load_breakpoints(dock_disam_refresh);
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

let aBreakpoints = [];

function load_breakpoints(callback)
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
        breakpoints_refresh();

        if (callback) {
            callback();
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function breakpoints_refresh()
{
    let table=$('<table>');
    for (i=0; i < Breakpoints.length; i++) {
        let $tr=$('<tr>');

        let src = "images/breakpoint/off.png";
        let addr = Breakpoints[i].addr;
        let symbols = "";
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

        $tr.append("<td>"+img+"</td><td>"+snprintf(Breakpoints[i].addr,"%04X")+"</td><td>"+symbol+"</td><td>"+Breakpoints[i].bank)+"</td>";
        table.append($tr);
    }
    $('#dock_breakpoint')[0].innerHTML = table[0].outerHTML;
}