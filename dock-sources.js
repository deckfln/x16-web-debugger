let sources = {
    'update': undefined,
    'previous_pc': undefined
}

const line_height = 20

function display_source(fileID)
{
    const id = "file"+fileID
    const name = debug_info.files[fileID].name

    if (dock_exists(id)) {
        // source is already displayed
        return true
    }

    let lines = debug_info.files[fileID].text
    if (lines == undefined) {
        // source code is not yet loaded
        return false
    }

    let table=$('<table>');
    for (let i=0; i<lines.length; i++) {
        let tr=$('<tr>');

        let img = "&nbsp;"
        let addr = ""
        let src = img_brk_off;
        let dbg_line = debug_info.files[fileID].lines[i+1];    // in source code lines start at 1
        if (dbg_line != undefined) {
            let dbg_pc = dbg_line.start;
            if (Breakpoints[dbg_pc] != undefined) {
                src = img_brk_on;
            }    

            img = "<img id='src"+fileID+dbg_pc+"' src='"+src+"'/ onClick='toggleBreapoint(" + dbg_pc + ",0);'>"
            addr = snprintf(dbg_pc,"%04X")
        }

        tr.append("<td>"+img+"</td><td class=\"pc\">"+addr+"</td><td class=\"source-instr\">" + ca65_syntax(lines[i]) + "</td>");
        table.append(tr);
    }
    table.attr("class", "code");

    if (sources.update) {
        sources.previous_pc = $("#src"+fileID+sources.update)
        sources.update = false
    }

    dock_new(name, id)
    $("#"+id)[0].innerHTML = table[0].outerHTML;

    return true
}

/**
 * remove the PC pointer from the previous address
 */
function source_removePC()
{
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
}

/**
 * set the PC pointer
 */
function source_setPC(node)
{
    let src = node.attr('src');
    switch (src) {
        case img_brk_on:
            src = img_brk_pc;
            break;
        case img_brk_off:
            src = img_pc;
            break;
    }
    node.attr('src', src);
    sources.previous_pc = node;
}

/**
 * Move the code to s specific line
 */
function source_set(fileID, line)
{
    let item = document.getElementById("file"+fileID);
    let top = item.scrollTop;
    let height = item.clientHeight;
    let bottom = top + height;
    let pos = line_height * (line-1);
    if (pos > bottom) {
        item.scrollTop = pos;
    }
    else if (pos < top) {
        item.scrollTop = pos;
    }    
}

/**
 * 
 * @param {*} brk 
 * @returns 
 */
function source_update(brk)
{
    let fileLine = debug_info.address[cpu.pc];
    if (fileLine == undefined) {
        return
    }

    // clean previous pointer
    source_removePC()

    // load source if needed
    let fileID = fileLine.file;
    let id = '#src'+fileID+cpu.pc;
    let line = $(id);   // PC is on screen ?
    if (line.length == 0) {
        // display the new source 
        if (!display_source(fileID)) {
            // not yet loaded
            return
        }
        line = $(id);   // PC is on screen ?
    }

    // move the current file on front of files tab
    const fid = "file"+fileID
    dock_setActive(fid)

    // activate new pointer
    source_setPC(line)

    // get line number from the memory
    if (fileLine != undefined) {
        // move the scroll position
        let item = document.getElementById("file"+fileID);
        let top = item.scrollTop;
        let height = item.clientHeight;
        let bottom = top + height;
        let pos = line_height * (fileLine.line-1);
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
    if (brk == undefined) {
        return
    }
    let addr = debug_info.address[brk]
    let fileID = addr.file
    let lineNumber = addr.line

    if (debug_info.files[fileID].lines[lineNumber] != undefined) {
        // toggle a breakpoint
        let id = '#src' + fileID + brk;
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
