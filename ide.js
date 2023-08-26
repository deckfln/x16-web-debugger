window.onload = () => {
    let divDockContainer = document.getElementById('dock_div');
    let divDockManager = document.getElementById('my_dock_manager');
    let dockManager = new DockSpawnTS.DockManager(divDockManager);
    dockManager.initialize();
    window.onresize = () => dockManager.resize(divDockContainer.clientWidth, divDockContainer.clientHeight);
    window.onresize(null);
    let d_disasm = new DockSpawnTS.PanelContainer(document.getElementById("dock-disam"), dockManager, null, "document");
    let d_source = new DockSpawnTS.PanelContainer(document.getElementById("dock-source"), dockManager, null, "document");
    let d_sprite = new DockSpawnTS.PanelContainer(document.getElementById("dock-sprite"), dockManager, null, "document");
    let d_cpu = new DockSpawnTS.PanelContainer(document.getElementById("dock-cpu"), dockManager);
    let d_breakpoints = new DockSpawnTS.PanelContainer(document.getElementById("dock-breakpoint"), dockManager);
    let d_files = new DockSpawnTS.PanelContainer(document.getElementById("dock-files"), dockManager);
    let d_dump = new DockSpawnTS.PanelContainer(document.getElementById("dock-memory"), dockManager);

    let documentNode = dockManager.context.model.documentManagerNode;
    let outputNode = dockManager.dockLeft(documentNode, d_cpu);
        dockManager.dockFill(outputNode, d_cpu);
        dockManager.dockDown(outputNode, d_breakpoints);
    dockManager.dockFill(documentNode, d_disasm);
    dockManager.dockFill(documentNode, d_source);
    let divNode = dockManager.dockRight(documentNode, d_files);
        dockManager.dockFill(divNode, d_files);
        dockManager.dockDown(divNode, d_dump);
    dockManager.dockDown(documentNode, d_sprite);

    function init1()
    {
        load_symbols(Config.symbols, init2);

        // activate context menus
        $(function() {
            $.contextMenu({
                selector: '.watch', 
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
                    "ubyte": {name: "watch as unsigned byte"},
                    "byte": {name: "watch as signed byte"},
                    "uword": {name: "watch as unsigned word"},
                    "word": {name: "watch as word"},
                    "ulong": {name: "watch as unsigned long"},
                    "long": {name: "watch as long"}
                }
            });
        });
    }

    function init2()
    {
        dock_sprite("http://localhost:9009/vera/sprite/0")
        load_breakpoints(load_source);
        dock_disasm(0, 0);
        check_cpu();    // start CPU monitoring
    }

    fetch("config.json")
    .then ( response => response.json())
    .then ( json => {
        Config = json;
        load_debuginfo(Config.debuginfo, init1);
    })
            
};