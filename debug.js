function debug_run()
{
    cpu_run()
    let remote = "http://localhost:9009/run"
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
            $("#run").addClass("disabled-link")
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function debug_restart()
{
    cpu_run()
    let remote = "http://localhost:9009/restart"
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function debug_continue()
{
    cpu_run()
    let remote = "http://localhost:9009/debug/continue";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
            source_removePC()       // erase the current PC pointer
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function debug_stepinto()
{
    cpu_run()
    let remote = "http://localhost:9009/debug/stepinto";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function debug_stepover()
{
    cpu_run()
    let remote = "http://localhost:9009/debug/stepover";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function debug_stepout()
{
    cpu_run()
    let remote = "http://localhost:9009/debug/stepout";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}