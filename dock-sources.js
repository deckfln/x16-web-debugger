let SourceFile = ""

function load_source(fileID)
{
    if (dbg_files[fileID] == undefined) {
        console.log("unknwon file ID" + fileID);
        return
    }
    let local = "/code/" + Config.sources + "/" + dbg_files[fileID].name;
    fetch(local)
    .then( response => response.text())
    .then( text => {
        SourceFile = text;
        display_source(fileID, SourceFile);
    })
}

function display_source(fileID, txt)
{
    txt = txt.replaceAll("\r","");
    let lines = txt.split("\n");

    let table=$('<table>');
    for (i=0; i<lines.length; i++) {
        let $tr=$('<tr>');

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
            img = "<img id='src"+fileID+dbg_pc+"' src='"+src+"'/ onClick='toggleBreapoint(" + i + "," + dbg_pc + ",0);'>"
            addr = snprintf(dbg_pc,"%04X")
        }

        $tr.append("<td>"+img+"</td><td>"+addr+"</td><td>"+lines[i]+"</td>");
        table.append($tr);
    }
    $('#source')[0].innerHTML = table[0].outerHTML;

}

let prev_source_pc = undefined;

function update_source()
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
        }
   
        // move the scroll position
        let scrollY = $('source').scrollY;
        console.log(scrollY);
    }
}