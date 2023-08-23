let dbg_files = {};
let dbg_address = {};

function load_debuginfo(file, callback)
{
    let remote = "/code/" + file;
    let f = fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.text())
    .then ( text => {
        let dbg_entry;
        let dbg_spans = {}
        let dbg_lines = {};
        
        text = text.replaceAll("\r","");
        let lines = text.split("\n");
        for (i in lines) {
            let cols = lines[i].split("\t");
            if (cols.length < 2) {
                console.log("oops");
                continue;
            }
            let type = cols[0];
            let kattrs = cols[1].split(",");
            let attrs = {}
            for (i in kattrs) {
                let kv = kattrs[i].split("=");
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
                        else {
                            console.log("wazup");
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
                    dbg_files[attrs.id] = attrs['name'];
                    break;
                case "seg":
                    if (attrs.name=="\"CODE\"") {
                        // entry point of the code
                        let hex = attrs.start.substring(2);
                        dbg_entry = parseInt(hex, 16);
                    }
                    break;
            }
        }

        // bind memory addresses to source file/line number
        for (id in dbg_spans) {
            let span = dbg_spans[id];
            let line = dbg_lines[span.id];
            if (line != undefined && dbg_address[span.start + dbg_entry] == undefined) {
                dbg_address[span.start + dbg_entry] = line;
            }
        }
        if (callback) {
            callback();
        }
    })
    .catch (error => {
        console.log(error);
    })
}