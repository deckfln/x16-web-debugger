let Watches = []

/**
 * create a new dock
 */
function new_dock_watch()
{
    const html='<div class="disam-menu"><input type="text" id="gowatch" name="godmp" required minlength="4" maxlength="8" size="10"/><button class="addwatch">Add</button></div><div id="watch_root" style="overflow:scroll;"></div>'
    dock_new("Watch", "dock-watch")
    let node = $('#dock-watch')
    node.html(html)
    $('#watch_root').jstree({
        'core' : {
            'check_callback' : true // allow create_node/delete_node operations
        }
    })
    watches_update()
}

/**
 * Add a new watch from the menu
 */
function watch_new(key, options)
{
    let addr = $('#gowatch').val() 
    let access

    // check if indirect memory
    if (addr.substring(0, 1) == "(") {
        const re = /\((.*)\)/
        const matches = addr.match(re)
        if (matches.length > 0) {
            access = "indirect"
            addr = matches[1]
            let f=addr.substring(0,1)
            if (f != "r") {
                // hexa memory based
                addr = parseInt(addr, 16)
            }
        }
        else {
            alert("Incorrect expression")
            return    
        }
    }
    else {
        access = "direct"
        addr = parseInt(addr, 16)
    }


    // check if the watch has already been added
    let found = false
    for (let i in Watches) {
        if (Watches[i].address == addr) {
            found = true
            alert("Watch already on the list")
            break
        }
    }

    if (!found) {
        Watches.push({
            bank: 0,
            address: addr,
            type: key,
            access: access
        })
        display_watch(Watches[Watches.length - 1])    
    }
}

/**
 * Display a memory watch was a new structure
 * @param {*} this 
 * @param {*} key 
 */
function watch_change(elem, type)
{
    let addr = elem.attr('id').replace("watch_", "")
    let found = -1
    for (let i in Watches) {
        if (Watches[i].address == addr) {
            found = i
            break
        }
    }
    if (found < 0) {
        alert("Missing watch "+addr)
        return
    }

    // whatever delete the node
    let jstree = $('#watch_root').jstree(true)
    let node = jstree.get_node(elem.attr('id'))
    jstree.delete_node(node)  

    if (type == "remove") {
        Watches.splice(found, 1)
    }
    else {
        Watches[i].type = type
        display_watch(Watches[i])
    }
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
            selector: '.addwatch', 
            trigger: 'left',
            callback: watch_new,
            items: menu
        });
    });

    $(function() {
        menu['remove'] = {name: "Remove"}
        $.contextMenu({
            selector: '.watch', 
            callback: function(key, options) {
                watch_change(this, key)
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
function add_watch(watch, bytes)
{
    let jstree = $('#watch_root').jstree(true)
    let text
    
    if (watch.access == "indirect")  {
        text = "(" + watch.address + ") as "+ watch.type
    }
    else {
        text = "$" + watch.address.toString(16) + " as "+ watch.type
    }
    let node = jstree.create_node("#", {
        text: text, 
        id: 'watch_' + watch.address,
        li_attr: { class: 'watch'}
    })
    display_struct(bytes, watch.type, 0, jstree, node)
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
        let text

        let dom = $('#watch_root').jstree(true).get_node(id)
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
                dom.text = attr.name + "= .RES"
                break
            default:
                index = update_watch(index, type, memory)
            }

        if (text != undefined) {
            if (dom.text != text) {
                dom.text = text
                dom.li_attr.class = "watch_changed"
            }
            else {
                dom.li_attr.class = "watch_unchanged"
            }
        }
    }

    return index
}

/**
 *
 */
function _display_memory(watch, realaddress)
{
    let remote = "http://localhost:9009/dump/" + watch.bank + "/" + realaddress + "/" + debug_info.structures[watch.type].size
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );

        let elm = $('#watch_' + watch.address)
        if (elm.length == 0) {
            add_watch(watch, bytes)
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
 * add or update a watch
 * @param {*} watch 
 */
function display_watch(watch)
{
    if (watch.access == 'indirect') {
        // extrat the index from the emulator
        let index = watch.address   // memory based index ?

        if (typeof index === 'string' ) {
            // register based
            index = watch.address.substring(1,2)   // register index (starting at 0)
            index = index*2 + 2                     // register memory address
        }
            
        let remote = "http://localhost:9009/dump/0/" + index + "/2"
        fetch (remote, {
            method: 'GET',
            mode: "cors"
        })
        .then ( response => response.arrayBuffer())
        .then ( buffer => {
            let words = new Uint16Array( buffer )
            _display_memory(watch, words[0])    // get memory from the address hosted in the index
        })
    }
    else {
        _display_memory(watch, watch.address)    // get the direct memory
    }
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

