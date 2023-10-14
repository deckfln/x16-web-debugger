"use strict";

let Vera = {
    addr: undefined,
    previous : undefined,

    l0: {
        map_height: 0,
        map_width: 0,
        t256c: 0,
        bitmap: 0,
        color_depth: 0,
        mapbase: 0,
        tilebase: 0,
        tileH: 0,
        tileW: 0,
        scrollH: 0,
        scrollV: 0
    },
    l1: {
        map_height: 0,
        map_width: 0,
        t256c: 0,
        bitmap: 0,
        color_depth: 0,
        mapbase: 0,
        tilebase: 0,
        tileH: 0,
        tileW: 0,
        scrollH: 0,
        scrollV: 0
    }

}

const veralo = 0
const veramid = 1
const verahi = 2
const veradat = 3
const veradat2 = 4
const veractl = 5
const veraien = 6
const veraisr = 7
const verairqlo = 8
// DCSE1 = 0
const veradcvideo = 9
const veradchscale = 10
const veradcvscale = 11
const veradcborder = 12
// DCSE1 = 1
const veradchstart = 9
const veradchstop = 10
const veradcvstart = 11
const veradcvstop = 12
// L0
const veral0config	= 13
const veral0mapbase	= 14
const veral0tilebase	= 15
const VERA_L0_hscrolllo	= 16
const VERA_L0_hscrollhi	= 17
const VERA_L0_vscrolllo	= 18
const VERA_L0_vscrollhi	= 19
// L1
const veral1config	= 20
const veral1mapbase	= 21
const veral1tilebase	= 22
const VERA_L1_hscrolllo	= 23
const VERA_L1_hscrollhi	= 24
const VERA_L1_vscrolllo	= 25
const VERA_L1_vscrollhi	= 26

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
