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

    let documentNode = dockManager.context.model.documentManagerNode;
    let outputNode = dockManager.dockLeft(documentNode, d_cpu, 0.2);
        dockManager.dockFill(outputNode, d_cpu);
        dockManager.dockDown(outputNode, d_breakpoints, 0.5);
    dockManager.dockFill(documentNode, d_disasm);
    dockManager.dockFill(documentNode, d_source);
    dockManager.dockRight(documentNode, d_sprite, 0.2);

    function init1()
    {
        load_symbols(Config.symbols, init2);
    }

    function init2()
    {
        dock_sprite("http://localhost:9009/vera/sprite/0")
        load_breakpoints();
        dock_disasm(0, 0);
        load_source(0);
        check_cpu();    // start CPU monitoring
    }

    fetch("config.json")
    .then ( response => response.json())
    .then ( json => {
        Config = json;
        load_debuginfo(Config.debuginfo, init1);
    })
            
};