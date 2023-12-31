"use strict";

// list of open panels
let Panels = {
}

window.onload = () => {
    let divDockContainer = document.getElementById('dock_div');
    let divDockManager = document.getElementById('my_dock_manager');
    let dockManager = new DockSpawnTS.DockManager(divDockManager);
    dockManager.initialize();

    // record panels that are closed
    dockManager.addLayoutListener({
        onClosePanel: (dockManager, panel) => {
            const id = panel.elementContent.id
            menu_uncheck(id)
            delete Panels[id]
        },
    })

    Panels["dockManager"] = dockManager
    Panels["divDockManager"] = divDockManager

    window.onresize = () => dockManager.resize(divDockContainer.clientWidth, divDockContainer.clientHeight);
    window.onresize(null);
    let d_disasm = new DockSpawnTS.PanelContainer(document.getElementById("dock-disam"), dockManager);
    let d_sprite = new DockSpawnTS.PanelContainer(document.getElementById("dock-sprite"), dockManager);
    let d_cpu = new DockSpawnTS.PanelContainer(document.getElementById("dock-cpu"), dockManager);
    let d_breakpoints = new DockSpawnTS.PanelContainer(document.getElementById("dock-breakpoint"), dockManager);
    let d_files = new DockSpawnTS.PanelContainer(document.getElementById("dock-files"), dockManager);
    let d_dump = new DockSpawnTS.PanelContainer(document.getElementById("dock-memory"), dockManager);
    let d_watch = new DockSpawnTS.PanelContainer(document.getElementById("dock-watch"), dockManager);
    let d_vera = new DockSpawnTS.PanelContainer(document.getElementById("dock-vera"), dockManager);

    let documentNode = dockManager.context.model.documentManagerNode;
    let outputNode = dockManager.dockLeft(documentNode, d_cpu, 0.1);
        dockManager.dockDown(outputNode, d_vera, 0.2);
        dockManager.dockDown(outputNode, d_breakpoints, 0.2);
    dockManager.dockFill(documentNode, d_disasm);
    let divNode = dockManager.dockRight(documentNode, d_files, 0.2);
        dockManager.dockDown(divNode, d_dump,0.4);
    dockManager.dockDown(documentNode, d_sprite, 0.12);

    let d_tiles = new_dock_tiles(documentNode, "down", 0.1)

    dockManager.dockRight(documentNode, d_watch);

    $('#watch_root').jstree({
        'core' : {
            'check_callback' : true // allow create_node/delete_node operations
        }
    })

    Panels["dock-disam"] = d_disasm
    Panels["dock-sprite"] = d_sprite
    Panels["dock-cpu"] = d_cpu
    Panels["dock-breakpoint"] = d_breakpoints
    Panels["dock-files"] = d_files
    Panels["dock-memory"] = d_dump
    Panels["dock-watch"] = d_watch

    let promises = [];

    // activate jstree for files
    dock_files_jstree()

    let p = fetch("config.json")
    .then ( response => response.json())
    .then ( json => {
        Config = json;
        emulator_run()      // monitor the emulator, it will kick start the cpu monitor if needed
        binary_monitor()    // monitor the PRG file        
        ide_restart()
    })

    // activate context menus
    $(function() {
        $.contextMenu({
            selector: '.brk_memory', 
            callback: function(key, options) {
                let addr = parseInt($(this).attr('id').substring(4))
                switch (key) {
                    case 'ubyte':
                    case 'byte':
                        memory_toggleWatch(addr, 0, 1)
                        break;
                    case 'uword':
                    case 'word':
                        memory_toggleWatch(addr, 0, 2)
                        break;
                    case 'ulong':
                    case 'long':
                        memory_toggleWatch(addr, 0, 4)
                        break;
                }
            },
            items: {
                "ubyte": {name: "Monitor as byte"},
                "uword": {name: "Monitor as word"},
                "ulong": {name: "Monitor as long"},
            }
        });

        $.contextMenu({
            selector: '.source-instr', 
            items: {
                "brk": {name: "Toggle breakpoint"},
                "cursor": {name: "Run ro cursor"},
            }
        })
        
    });

};

/**
 * load the debug info file, process source files and kickstart the pulling loops
 */
let first_init = true

function ide_restart()
{
    debuginfo_load(Config.debuginfo)
    .then (ok => {
        // load all files & prepare structure mapping
        load_allFiles()
        .then(ok => {
            structures_map()
            watch_bindStructures()
            let p = symbols_load(Config.symbols)
            // TODO dock_sprite("http://localhost:9009/vera/sprite/0")
            return "ok"
        })
        return "OK"
    });
}

/**
 * Docks functions
 * @param {*} title 
 * @param {*} id 
 * @returns 
 */
function dock_new(title, id, prevNode, direction, size)
{
    let dockManager = Panels.dockManager
    let divDockManager = Panels.divDockManager
    let documentNode = dockManager.context.model.documentManagerNode;

    let panel = document.createElement('div');
    panel.id = id;
    panel.style = "overflow:scroll;"
    panel.setAttribute("data-panel-caption", title)
    divDockManager.appendChild(panel)
    let d_panel = new DockSpawnTS.PanelContainer(panel, dockManager)

    if (prevNode == undefined) {
        dockManager.dockFill(documentNode, d_panel)
    }
    else {
        switch (direction) {
            case "fill": 
                dockManager.dockFill(prevNode, d_panel)
                break
            case "down": 
                dockManager.dockDown(prevNode, d_panel, size)
                break
            case "right": 
                dockManager.dockRight(prevNode, d_panel, size)
                break
            case "left": 
                dockManager.dockLeft(prevNode, d_panel, size)
                break
        }
    }

    Panels[id] = d_panel

    return d_panel
}

function dock_delete(id)
{
    Panels[id].close()
    delete Panels[id]
}

function dock_exists(id)
{
    return Panels[id] != undefined
}

function dock_setActive(id)
{
    let panel = Panels[id]
    if (panel == undefined) {
        return
    }
    
    if (panel.tabPage) {
        // if the target dock is currently tabed , force the active tab
        panel.tabPage.host.setActiveTab(panel);
    }
    panel.dockManager.activePanel = panel;
}