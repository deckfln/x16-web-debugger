"use strict";

/**
 * create a new dock
 */
function new_dock_vera()
{
    const veraHTML = ''

    dock_new("VERA registers", "dock-vera")
    let div = $("#dock-vera")
    div.html(veraHTML)
}

/**
 * add a row to a table
 */
function vera_add_row(table, title, value)
{
    let tr = $('<tr>');
    if (value != undefined) {
        tr.append("<td>" + title + "</td><td>" + value + "</td>")
    }
    else {
        tr.append("<td>" + title + "</td>")
    }
    table.append(tr);
}

/**
 * Decode a layer
 */
function vera_layer_decode(table, pLayer)
{
    let l0
    let mode = "map"
    if (pLayer.bitmap) {
        l0 = pLayer.map_width + "x" + pLayer.map_height + "/" + pLayer.color_depth
        mode = "bitmap"
    }
    else {
        l0 = (32 << pLayer.map_width) + "x" + (32 << pLayer.map_height) + "/" + (1 << pLayer.color_depth) + "bpp"
    }

    // display
    vera_add_row(table, mode, l0)
    vera_add_row(table, "Tile", pLayer.tileW + "x" + pLayer.tileH)
    vera_add_row(table, "Base", snprintf(pLayer.mapbase, "%05X"))
    vera_add_row(table, "Tiles", snprintf(pLayer.tilebase, "%05X"))
    vera_add_row(table, "Scroll", pLayer.scrollH + "x" + pLayer.scrollV)
}

/**
 * Display vera registers
 */
function dock_vera()
{
    vera_get()
    .then( response => {
        let table=$('<table>');
        // vera addr0
        let addr = Vera.addr
        let clss = ''
        if (Vera.addr != addr) {
            clss = ' class="updated"'
            Vera.addr = addr
        }
        let tr=$('<tr>');
        tr.append("<td>addr</td><td" + clss + ">" + snprintf(addr,"%05X") + "</td>")
        table.append(tr);

        // Layers
        vera_add_row(table, "Layer0")
        vera_layer_decode(table, Vera.l0)
        vera_add_row(table, "Layer1")
        vera_layer_decode(table, Vera.l1)

        $('#dock-vera')[0].innerHTML = table[0].outerHTML
    })
    .catch (error => { 
        console.log(error);
    })       
}
