function debug_run()
{
    let remote = "http://localhost:9009/run/" + debug_info.start
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
    let remote = "http://localhost:9009/debug/continue";
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

function debug_stepinto()
{
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