let SourceFile = ""
let SourceFileID = undefined
let SourceFile_lines = {};

function load_source(fileID)
{
    if (fileID == undefined) {
        fileID = 0;
    }

    if (dbg_files[fileID] == undefined) {
        console.log("unknwon file ID" + fileID);
        return
    }
    let local = "/code/" + Config.sources + "/" + dbg_files[fileID].name;
    fetch(local)
    .then( response => response.text())
    .then( text => {
        SourceFile = text;
        SourceFileID = fileID;
        display_source(fileID, SourceFile);
    })
}

function display_source(fileID, txt)
{
    txt = txt.replaceAll("\r","");
    let lines = txt.split("\n");

    let table=$('<table>');
    SourceFile_lines = {};
    for (i=0; i<lines.length; i++) {
        let tr=$('<tr>');

        let img = "&nbsp;"
        let addr = ""
        let src = img_brk_off;
        let dbg_line = dbg_files[fileID].lines[i+1];    // in source code lines start at 1
        if (dbg_line != undefined) {
            let dbg_pc = dbg_line.start;
            if (dbg_pc == currentPC) {
                if (Breakpoints[dbg_pc] != undefined) {
                    src = img_brk_pc;
                }
                else {
                    src = img_pc;
                }                                
            }
            else if (Breakpoints[dbg_pc] != undefined) {
                src = img_brk_on;
            }    

            SourceFile_lines[ dbg_pc ] = i + 1;
        
            img = "<img id='src"+fileID+dbg_pc+"' src='"+src+"'/ onClick='toggleBreapoint(" + i + "," + dbg_pc + ",0);'>"
            addr = snprintf(dbg_pc,"%04X")
        }

        tr.append("<td>"+img+"</td><td>"+addr+"</td><td>"+lines[i]+"</td>");
        tr.attr("class", "line-number");
        table.append(tr);
    }
    $('#dock-source')[0].innerHTML = table[0].outerHTML;
}

let prev_source_pc = undefined;

function source_update(brk)
{
    let line = dbg_address[currentPC];
    if (line != undefined) {
        let fileID = line.file;
        let id = '#src'+fileID+currentPC;
        let found = $(id);   // PC is on screen ?
        if (found.length == 0) {
            // jumped page
            load_source(fileID);
        }
        else {
            // clean previous pointer
            if (prev_source_pc != undefined) {
                let src = prev_source_pc.attr('src');
                switch (src) {
                    case img_pc:
                        src = img_brk_off;
                        break;
                    case img_brk_pc:
                        src = img_brk_on;
                        break;
                }                    
                prev_source_pc.attr('src', src);
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
            prev_source_pc = found;

            // get line number from the memory
            let lineNumber = SourceFile_lines[currentPC];
            if (lineNumber != undefined) {
                // move the scroll position
                let item = document.getElementById("dock-source");
                let top = item.scrollTop;
                let height = item.clientHeight;
                let pos = 29 * (lineNumber-1);
                if (pos > top + height) {
                    item.scrollTop = pos;
                }
                else if (pos < top) {
                    item.scrollTop = pos;
                }
            }
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