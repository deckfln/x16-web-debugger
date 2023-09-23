Vera = {
    addr: undefined,
    previous : undefined
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
function vera_layer_decode(bytes, table, layer)
{
    // config
    let l0_map_height = (bytes[layer] & 0b11000000) >> 6
    let l0_map_width = (bytes[layer] & 0b00110000) >> 4
    let l0_t256c = (bytes[layer] & 0b00001000) >> 3
    let l0_bitmap = (bytes[layer] & 0b00000100) >> 2
    let l0_color_depth = (bytes[layer] & 0b00000011)

    let l0
    let mode = "map"
    if (l0_bitmap) {
        l0 = l0_map_width + "x" + l0_map_height + "/" + l0_color_depth
        mode = "bitmap"
    }
    else {
        l0 = (32 << l0_map_width) + "x" + (32 << l0_map_height) + "/" + (1 << l0_color_depth) + "bpp"
    }

    // map base
    let base = bytes[layer + 1] << 9
    let tiles = (bytes[layer + 2] & 0b11111100) << 9

    // tile size
    let tileH = 8 << ((bytes[layer + 2] & 0b00000010) >> 1)
    let tileW = 8 << (bytes[layer + 2] & 0b00000001)

    // scroll
    let scrollH = bytes[layer + 3] + ((bytes[layer + 4] & 0b00001111) <<8)
    let scrollV = bytes[layer + 5] + ((bytes[layer + 6] & 0b00001111) <<8)

    // display
    vera_add_row(table, mode, l0)
    vera_add_row(table, "Tile", tileW + "x" + tileH)
    vera_add_row(table, "Base", snprintf(base, "%05X"))
    vera_add_row(table, "Tiles", snprintf(tiles, "%05X"))
    vera_add_row(table, "Scroll", scrollH + "x" + scrollV)
}

/**
 * Display vera registers
 */
function dock_vera()
{
    let remote = "http://localhost:9009/dump/0/0x9f20/32";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );

        let table=$('<table>');

        // vera addr0
        let addr = bytes[veralo] + (bytes[veramid] << 8) + (bytes[verahi] << 16)
        let clss = ''

        if (Vera.addr != addr) {
            clss = ' class="updated"'
            cpu.addr = addr
        }

        let tr=$('<tr>');
        tr.append("<td>addr</td><td" + clss + ">" + snprintf(addr,"%05X") + "</td>")
        table.append(tr);

        // Layers
        vera_add_row(table, "Layer0")
        vera_layer_decode(bytes, table, veral0config)

        vera_add_row(table, "Layer1")
        vera_layer_decode(bytes, table, veral1config)

        $('#dock-vera')[0].innerHTML = table[0].outerHTML

        // record current values
        Vera.previous = bytes
    })
    .catch (error => { 
        console.log(error);
    })       
}
