/**
 *  create the list of source files in the PRG 
 */
function files_update()
{
    let ul=$('<ul>');
    for (let fileID in debug_info.files) {
        let file = debug_info.files[fileID] 
        let li=$('<li id="f' + fileID + '">');
        li.append(file.name);
            let ul1=$('<ul>');
            for (let symbol in file.symbols) {
                if (symbol.substring(0,1) != '@') {
                    let li1=$('<li id="f' + fileID + '#' + symbol + '">');
                    li1.append(symbol);
                    ul1.append(li1);    
                }
            }
        li.append(ul1)
        ul.append(li);
    }
    let dock=document.getElementById("dock-files");
    dock.innerHTML = ul[0].outerHTML;
    $("#dock-files").jstree({ "plugins": ["themes", "html_data", "ui", "crrm", "hotkeys"], "core": {} })

    $("#dock-files").bind(
        "select_node.jstree", function(evt, data){
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
            display_source(fileID)

            // if clicked on a symbol, move the code to the line of the symbol
            if (sym != undefined) {
                let line = debug_info.files[fileID].symbols[sym]

                source_set(fileID, line)
            }
      });    
}

function load_allFiles(callback)
{
    let promises = [];
    for (let id in debug_info.files) {
        let local = "/code/" + Config.sources + "/" + debug_info.files[id].name;
        let promise = fetch(local)
        .then( response => response.text())
        .then( text => {
            debug_info.files[id].text = text.replaceAll("\r","").split("\n");
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
