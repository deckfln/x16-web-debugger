/**
 * create a new dock
 */
function new_dock_files()
{
    dock_new("Files", "dock-files")
    dock_files_jstree()
    files_update()
}

function dock_files_jstree()
{
    // activate jstree of files
    $("#dock-files").jstree({ 
        "plugins": [
            "themes", 
            "html_data", 
            "ui", 
            "crrm", 
            "hotkeys",
            "types"
        ], 
        "core": {
            'check_callback' : true  // allow create_node/delete_node operations
        },
        "themes": {
                "name": 'default-dark',
                "dots" : true,
                "responsive" : true,
                "stripes": false
        },
        "types": {
            'label' : {
                'icon' : false
            },
            'file' : {
                'icon' : "jstree-icon jstree-file"
            }
        }})
    
        $("#dock-files").bind(
            "activate_node.jstree", function(evt, data){
                let id = data.node.id.substr(1)
                // check if we clicked on the file or a symbol in the file
                let sym
                let hash = id.indexOf("#")
                if ( hash > 0) {
                    sym = id.substring(hash +1)
                    id = id.substring(0,hash)
                }
                let fileID = parseInt(id)
    
                // seach only for the file
                source_open(fileID)
    
                // if clicked on a symbol, move the code to the line of the symbol
                if (sym != undefined) {
                    let line = debug_info.files[fileID].symbols[sym]
    
                    source_set(fileID, line)
                }
          });       
}

/**
 *  create the list of source files in the PRG 
 */
function files_update()
{
    // clear the tree
    let jstree = $('#dock-files').jstree(true)
    let root = jstree.get_node("#")
    jstree.delete_node(root.children)

    for (let fileID in debug_info.files) {
        let file = debug_info.files[fileID] 
        let node = jstree.create_node(root, {
            text: file.name,
            id: 'f' + fileID,
            type: "file"
        })

        for (let symbol in file.symbols) {
            if (symbol.substring(0,1) != '@') {
                let sym = jstree.create_node(node, {
                    text: symbol,
                    id: "f" + fileID + "#" + symbol,
                    type: "label"
                })
            }
        }
    }
}

/**
 * load all files in memory and refresh displayed source code
 * @returns 
 */
function load_allFiles()
{
    let promises = [];
    for (let id in debug_info.files) {
        let local = "/code/" + Config.sources + "/" + debug_info.files[id].name;
        let promise = fetch(local)
        .then( response => response.text())
        .then( text => {
            debug_info.files[id].text = text.replaceAll("\r","").split("\n");

            // refresh source on screen if needed
            if (dock_exists("file"+id)) {
                source_display(id)
            }
            return "ok"
        })   

        promises.push(promise);
    }

    let p = new Promise(resolve => {
        Promise.all(promises).then(fileContents => {
           resolve("OK")
        });   
    })

    return p
}
