let sources = {
    'update': undefined,
    'previous_pc': undefined
}

function load_source(fileID, callback)
{
    if (fileID == undefined) {
        fileID = 0;
    }

    if (debug_info.files[fileID] == undefined) {
        console.log("unknwon file ID" + fileID);
        return
    }
    let local = "/code/" + Config.sources + "/" + debug_info.files[fileID].name;
    fetch(local)
    .then( response => response.text())
    .then( text => {
        debug_info.files[fileID].text = text
        display_source(fileID, text);
        if (callback) {
            callback()
        }
    })
}

function display_source(fileID, txt)
{
    txt = txt.replaceAll("\r","");
    let lines = txt.split("\n");

    let table=$('<table>');
    SourceFile_lines = {};
    for (let i=0; i<lines.length; i++) {
        let tr=$('<tr>');

        let img = "&nbsp;"
        let addr = ""
        let src = img_brk_off;
        let dbg_line = debug_info.files[fileID].lines[i+1];    // in source code lines start at 1
        if (dbg_line != undefined) {
            let dbg_pc = dbg_line.start;
            if (dbg_pc == currentPC) {
                if (Breakpoints[dbg_pc] != undefined) {
                    src = img_brk_pc;
                }
                else {
                    src = img_pc;
                }
                sources.update = dbg_pc
            }
            else if (Breakpoints[dbg_pc] != undefined) {
                src = img_brk_on;
            }    

            img = "<img id='src"+fileID+dbg_pc+"' src='"+src+"'/ onClick='toggleBreapoint(" + dbg_pc + ",0);'>"
            addr = snprintf(dbg_pc,"%04X")
        }

        tr.append("<td>"+img+"</td><td class=\"pc\">"+addr+"</td><td class=\"source-instr\">"+source_theme(lines[i])+"</td>");
        tr.attr("class", "line-number");
        table.append(tr);
    }

    if (sources.update) {
        sources.previous_pc = $("#src"+fileID+sources.update)
        sources.update = false
    }

    // use an existing panel or create a new one
    if (panels[debug_info.files[fileID].name] == undefined) {
        let dockManager = panels.dockManager
        let divDockManager = panels.divDockManager
        let documentNode = dockManager.context.model.documentManagerNode;

        let panel = document.createElement('div');
        panel.id = "file"+fileID;
        panel.style = "overflow:scroll;"
        panel.setAttribute("data-panel-caption", debug_info.files[fileID].name)
        divDockManager.appendChild(panel)
        let d_panel = new DockSpawnTS.PanelContainer(panel, dockManager)
        dockManager.dockFill(documentNode, d_panel)

        panels[debug_info.files[fileID].name] = d_panel
    }

    $('#file'+fileID)[0].innerHTML = table[0].outerHTML;
}

function source_update(brk)
{
    let fileLine = debug_info.address[currentPC];
    if (fileLine == undefined) {
        return
    }

    // clean previous pointer
    if (sources.previous_pc != undefined) {
        let src = sources.previous_pc.attr('src');
        switch (src) {
            case img_pc:
                src = img_brk_off;
                break;
            case img_brk_pc:
                src = img_brk_on;
                break;
        }                    
        sources.previous_pc.attr('src', src);
        sources.previous_pc = undefined
    }

    // load source if needed
    let fileID = fileLine.file;
    let id = '#src'+fileID+currentPC;
    let found = $(id);   // PC is on screen ?
    if (found.length == 0) {
        // load the new source and come back later
        load_source(fileID, source_update);
        return
    }

    // activate new pointer
    let src = found.attr('src');
    switch (src) {
        case img_brk_on:
            src = img_brk_pc;
            break;
        case img_brk_off:
            src = img_pc;
            break;
    }
    found.attr('src', src);
    sources.previous_pc = found;

    // move the current file on front of files tab
    let panel = panels[debug_info.files[fileID].name]
    panel.tabPage.host.setActiveTab(panel);
    panel.dockManager.activePanel = panel;

    // get line number from the memory
    if (fileLine != undefined) {
        // move the scroll position
        let item = document.getElementById("file"+fileID);
        let top = item.scrollTop;
        let height = item.clientHeight;
        let bottom = top + height;
        let pos = 30 * (fileLine.line-1);
        if (pos > bottom) {
            item.scrollTop = pos;
        }
        else if (pos < top) {
            item.scrollTop = pos;
        }
    }
}

function source_toggleBreakpoint(brk)
{
    if (brk != undefined && SourceFile_lines[brk] != undefined) {
        // toggle a breakpoint
        let id = '#src' + SourceFileID + brk;
        let item = $(id);
        let current = item.attr('src');
        let new_src = undefined;
        switch (current) {
            case img_brk_off:
                new_src = img_brk_on;
                break;
            case img_brk_on:
                new_src = img_brk_off;
                break;
            case img_brk_pc:
                new_src = img_pc;
                break;
            case img_pc:
                new_src = img_brk_pc;
                break;
            }
        item.attr('src', new_src);
        return;
    }
}

function source_theme(line)
{
    let icomment = line.search(";")
    if (icomment >= 0) {
        line = line.replace(";", "<span class=\"comment\">;")
        line += "</span>"
    }
    else {
        icomment = line.length
    }

    // find the 3 first letters at the beginning of the line
    let start = -1
    for (let i=0; i<icomment; i++) {
        if (line.substr(i, 1) != " " && line.substr(i, 1) != "\t") {
            start = i
            break
        }
    }
    if (start >= 0) {
        let op = line.substr(start, 3)
        for (let i in mnemonics) {
            let m = mnemonics[i]
            if (op == m) {
                line = line.substr(0, start)+ "<span class=\"mnemonics\">" + m + "</span>" + line.substr(start+3, icomment-start-3)
                break
            }
        }
    }

    return line
}