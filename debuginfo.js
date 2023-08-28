let debug_info = {
    start: 0,
    structures: {},
    files: {},
    address: {},     // map memory addresses to fileID/lineNumber
}


function load_debuginfo(file, callback)
{
    let remote = "/code/" + file;
    let f = fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.text())
    .then ( text => {
        let dbg_spans = {}
        let dbg_lines = {};
        
        text = text.replaceAll("\r","");
        let lines = text.split("\n");
        for (let i in lines) {
            let cols = lines[i].split("\t");
            if (cols.length < 2) {
                continue;
            }
            let type = cols[0];
            let kattrs = cols[1].split(",");
            let attrs = {}
            for (let j in kattrs) {
                let kv = kattrs[j].split("=");
                attrs[kv[0]]=kv[1];
            }
            switch (type) {
                case "line":
                    if (attrs.span != undefined) {
                        attrs['id']=parseInt(attrs.id);
                        attrs['span']=parseInt(attrs.span);
                        attrs["line"]=parseInt(attrs.line);
                        attrs["file"]=parseInt(attrs.file);
    
                        if (dbg_lines[attrs.span] == undefined) {
                            dbg_lines[attrs.span] = attrs;
                        }
                    }
                    break;
                case "span":
                    attrs['id']=parseInt(attrs.id);
                    attrs['seg']=parseInt(attrs.seg);
                    attrs['size']=parseInt(attrs.size);
                    attrs.start = parseInt(attrs.start);
                    dbg_spans[attrs.id] = attrs;
                    break;
                case "file":
                    attrs['id']=parseInt(attrs.id);
                    attrs.name = attrs.name.replaceAll("\"","")
                    debug_info.files[attrs.id] = { "name":attrs.name, "lines":{}};
                    break;
                case "seg":
                    if (attrs.name=="\"CODE\"") {
                        // entry point of the code
                        let hex = attrs.start.substring(2);
                        debug_info.start = parseInt(hex, 16);
                    }
                    break;
                case 'sym':
                    let addr = attrs.val
                    if (addr.substring(1,2) == '0x') {
                        addr = parseInt(addr.substring(3), 16)
                    }
                    else {
                        addr = parseInt(addr)
                    }
                    hSymbols[addr] = attrs.name.replaceAll("\"","")
                    break
                case "scope":
                    if (attrs.type == 'structure') {
                        debug_info.structures[attrs.name.replaceAll("\"","")] = { 
                            'size': parseInt(attrs.size)
                        }
                    }
                    break;
            }
        }

        // bind memory addresses to source file/line number
        for (let id in dbg_spans) {
            let span = dbg_spans[id];
            span.start += debug_info.start
            let line = dbg_lines[span.id];
            if (line != undefined && debug_info.address[span.start] == undefined) {
                debug_info.address[span.start] = line;
                debug_info.files[line.file].lines[line.line] = span;
            }
        }

        files_update();

        if (callback) {
            callback();
        }
    })
    .catch (error => {
        console.log(error);
    })
}