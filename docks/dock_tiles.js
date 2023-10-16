"use strict";

/**
 * create a new dock
 */
function new_dock_tiles(prevNode, direction, size)
{
    let html = "<table><tr>"
    for (let i=0; i < 16; i++) {
        html += '<td height="64" width="64"><img id="' + 'tile' + i + '" style="transform-origin: top left; transform: scale(4);"></td>'
    }
    html += "</tr></table>"

    let dock = dock_new("Tiles", "dock-tiles", prevNode, direction, size)
    let node = $('#dock-tiles')
    node.html(html)

    tiles_update()
    
    return dock
}

/**
 * display the dock
 */
function tiles_update()
{
    vera_get()
    .then (response => {
        for (let i=0; i < 16; i++) {
            tiles_get(i)
            .then (image => {
                let b = $("#tile"+i)
                b.attr("src", image.src)
            }) 

        }
    })
}