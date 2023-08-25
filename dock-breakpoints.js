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
        source_toggleBreakpoint(addr);
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
        for (i in json) {
            let addr = parseInt(json[i].addr);
            let bank = parseInt(json[i].bank);
            Breakpoints[addr] = bank;
        }

        let remote = "http://localhost:9009/watch";
        fetch (remote, {
            method: 'GET',
            mode: "cors"
        })
        .then ( response => response.json())
        .then ( json => {
            for (i in json) {
                let addr = parseInt(json[i].addr);
                let bank = parseInt(json[i].bank);
                Breakpoints[addr] = bank;
            }
    
            breakpoints_refresh();
            if (callback) {
                callback();
            }
        })
    })
    .catch (error => { 
        console.log(error);
    })       
}

function breakpoints_refresh()
{
    let table=$('<table>');
    for (let addr in Breakpoints) {
        let tr=$('<tr>');

        let src = "images/breakpoint/on.png";
        let img = "<img id='brk"+addr+"' src='"+src+"'/ onClick='toggleBreapoint(" + i + "," + addr + ",0);'>"

        tr.append("<td>"+img+"</td><td>"+snprintf(addr,"%04X")+"</td><td>"+Breakpoints[addr])+"</td>";
        table.append(tr);
    }
    document.getElementById("dock-breakpoint").innerHTML = table[0].outerHTML;
}