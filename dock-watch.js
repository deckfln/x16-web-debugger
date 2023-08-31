function display_struct(memory, struct, index, table)
{
    let structure = debug_info.structures[struct]

    for( let i in structure.attributes ) {
        let attr = structure.attributes[i]
        let type = attr.size.toLowerCase()
        let v

        table.html += "<li id='"+ struct + "_" + attr.name + "'>"
        switch (type) {
            case ".byte":
                table.html += attr.name + "=" + parseInt(memory[index++])
                break
            case ".word":
            case ".addr":
                v = (memory[index++] & 0xFF) | ((memory[index++] & 0xFF) << 8);
                table.html += attr.name + "=" + parseInt(v)
                break
            case ".res":
                table.html += attr.name + "= .RES"
                console.log("not implemented .RES")
                break
            default:
                table.html += attr.name
                table.html += "<ul>"
                index = display_struct(memory, type, index, table)
                table.html += "</ul>"
            }
        table.html +=  "</li>"
    }

    return index
}

function add_watch(bank, address, struct, bytes)
{
    let table = {
        "html": "<ul><li  id='watch_"+address+"'>" + address + "<ul>"
    }
    display_struct(bytes, struct, 0, table)
    let dock=document.getElementById("watch");
    table.html += "</ul></li></ul>"
    dock.innerHTML = table.html;
    //dock.innerHTML = '<ul><li>Root node 1<ul><li>Child node 1</li><li><a href="#">Child node 2</a></li></ul></li></ul>'
    $("#watch").jstree()
}

function update_watch(index, struct, memory)
{
    const structure = debug_info.structures[struct]

    for( let i in structure.attributes ) {
        const attr = structure.attributes[i]
        const type = attr.size.toLowerCase()
        const id = struct + "_" + attr.name

        let dom = $('#watch').jstree(true).get_node(id)
        switch (type) {
            case ".byte":
                dom.text = attr.name + "=" + parseInt(memory[index++])
                break
            case ".word":
            case ".addr":
                v = (memory[index++] & 0xFF) | ((memory[index++] & 0xFF) << 8);
                dom.text = attr.name + "=" + parseInt(v)
                break
            case ".res":
                dom.text = attr.name + "= .RES"
                break
            default:
                index = update_watch(index, type, memory)
            }
    }

    return index
}

function display_watch(bank, address, struct)
{
    let remote = "http://localhost:9009/dump/" + bank + "/" + address + "/" + debug_info.structures[struct].size
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );

        let watch = $('#watch_'+address)
        if (watch.length == 0) {
            add_watch(bank, address, struct, bytes)
        }
        else {
            update_watch(0, struct, bytes)
            $('#watch').jstree(true).redraw(true)
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

function watches_update()
{
    display_watch(0, "0x500", "player")
}