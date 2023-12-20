"use strict";

function debug_run()
{
    let remote = "http://localhost:9009/run"
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
            cpu_run()
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function debug_restart()
{
    let remote = "http://localhost:9009/restart"
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.json())
    .then ( json => {
        if (json.status == "ok") {
            source_removePC()  // clean previous pointer
            run() // unlock the emulator
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
            source_removePC()       // erase the current PC pointer
            cpu_run()
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
            cpu_run()
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
            cpu_run()
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
            cpu_run()
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

// deactivate the debugbar
function debug_deactivate()
{
    $("#run").addClass("disabled-link")
    $("#restart").addClass("disabled-link")
    $("#continue").addClass("disabled-link")
    $("#stepinto").addClass("disabled-link")
    $("#stepover").addClass("disabled-link")
    $("#stepout").addClass("disabled-link")   
}

// deactivate the debugbar
function debug_activate()
{
    if (!Emulator.inBasic) {
        $("#run").removeClass("disabled-link")
    }
    $("#restart").removeClass("disabled-link")
}