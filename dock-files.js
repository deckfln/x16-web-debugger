/**
 *  create the list of source files in the PRG 
 */
function files_update()
{
    let ul=$('<ul>');
    for (i in debug_info.files) {
        let li=$('<li>');
        li.append(debug_info.files[i].name);
        ul.append(li);
    }
    let dock=document.getElementById("dock-files");
    dock.innerHTML = ul[0].outerHTML;
    $("#dock-files").jstree({ "plugins": ["themes", "html_data", "ui", "crrm", "hotkeys"], "core": {} })

    $("#dock-files").bind(
        "select_node.jstree", function(evt, data){
            let file = data.node.text;
            let found = undefined;
            for (let id in debug_info.files) {
                if (debug_info.files[id].name == file) {
                    found = id;
                    break;
                }
            }
            if (found != undefined) {
                display_source(found)
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
        })   

        promises.push(promise);
    }
    Promise.all(promises).then(fileContents => {
        callback()
    });
}
