let Watches = [
    {
        bank: 0,
        address: 0x500,
        type: "player",
    }
]

/**
 * Display a memory watch was a new structure
 * @param {*} this 
 * @param {*} key 
 */
function watch_changeStructure(elem, type)
{
    let addr = elem.attr('id').replace("watch_", "")
    for (let i in Watches) {
        if (Watches[i].address == addr) {
            Watches[i].type = type
        }
    }
    console.log(addr)
}

/**
 *bind watch as structure to watches class
 *activate context menus
 */
function watch_bindStructures()
{
    let menu = {}
    for (let i in debug_info.structures) {
        menu[i] = {name: "Watch as " + i}

    }

    $(function() {
        $.contextMenu({
            selector: '.watch', 
            callback: function(key, options) {
                watch_changeStructure(this, key)
            },
            items: menu
        });
    });
}

/**
 * create a jsTree node to show all attributes of the structure
 * @param {*} memory 
 * @param {*} struct 
 * @param {*} index 
 * @param {*} jstree 
 * @param {*} parent 
 * @returns 
 */
function display_struct(memory, struct, index, jstree, parent)
{
    let structure = debug_info.structures[struct]
    let substruct = false

    for( let i in structure.attributes ) {
        let attr = structure.attributes[i]
        let type = attr.size.toLowerCase()
        let text

        switch (type) {
            case ".byte":
                text = attr.name + "=" + parseInt(memory[index++])
                break
            case ".word":
            case ".addr":
                v = (memory[index++] & 0xFF) | ((memory[index++] & 0xFF) << 8);
                text = attr.name + "=" + parseInt(v)
                break
            case ".res":
                text = attr.name + "= .RES"
                console.log("not implemented .RES")
                break
            default:            
                text = attr.name
                substruct = true   // defere creation of the sub-structure
            }

        let node = jstree.create_node(parent, {
            text: text,
            id: struct + "_" + attr.name
        })

        if (substruct) {
            substruct = false
            index = display_struct(memory, type, index, jstree, node)
        }
    }

    return index
}

/**
 * Add a memory watch to the list
 * @param {*} bank 
 * @param {*} address 
 * @param {*} type 
 * @param {*} bytes 
 */
function add_watch(bank, address, type, bytes)
{
    let jstree = $('#watch_root').jstree(true)
    
    let node = jstree.create_node("#", {
        text: address + " as "+ type, 
        id: 'watch_' + address,
        class:'watch'
    })
    let table = {
        "html": ""
    }
    display_struct(bytes, type, 0, jstree, node)
}

/**
 * Ipdate content of existing variable
 * @param {*} index 
 * @param {*} struct 
 * @param {*} memory 
 * @returns 
 */
function update_watch(index, struct, memory)
{
    const structure = debug_info.structures[struct]

    for( let i in structure.attributes ) {
        const attr = structure.attributes[i]
        const type = attr.size.toLowerCase()
        const id = struct + "_" + attr.name

        let dom = $('#watch_root').jstree(true).get_node(id)
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

/**
 * add or update a watch
 * @param {*} watch 
 */
function display_watch(watch)
{
    let remote = "http://localhost:9009/dump/" + watch.bank + "/" + watch.address + "/" + debug_info.structures[watch.type].size
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );

        let elm = $('#watch_' + watch.address)
        if (elm.length == 0) {
            add_watch(watch.bank, watch.address, watch.type, bytes)
        }
        else {
            update_watch(0, watch.type, bytes)
            $('#watch_root').jstree(true).redraw(true)
        }
    })
    .catch (error => { 
        console.log(error);
    })       
}

/**
 * refresh all watches
 */
function watches_update()
{
    for (let i in Watches) {
        display_watch(Watches[i])
    }
}