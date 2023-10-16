"use strict";

/**
 * cached data
 */
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
    },
    tiles : {}              // cached tile images
}

/**
 * vera indexes
 */
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
 * Decode a layer
 */
function vera_decode_layer(bytes, layeridx, pLayer)
{
    // config
    pLayer.map_height = (bytes[layeridx] & 0b11000000) >> 6
    pLayer.map_width = (bytes[layeridx] & 0b00110000) >> 4
    pLayer.t256c = (bytes[layeridx] & 0b00001000) >> 3
    pLayer.bitmap = (bytes[layeridx] & 0b00000100) >> 2
    pLayer.color_depth = (bytes[layeridx] & 0b00000011)

    // map base
    pLayer.mapbase = bytes[layeridx + 1] << 9
    pLayer.tilebase = (bytes[layeridx + 2] & 0b11111100) << 9

    // tile size
    pLayer.tileH = 8 << ((bytes[layeridx + 2] & 0b00000010) >> 1)
    pLayer.tileW = 8 << (bytes[layeridx + 2] & 0b00000001)

    // scroll
    pLayer.scrollH = bytes[layeridx + 3] + ((bytes[layeridx + 4] & 0b00001111) <<8)
    pLayer.scrollV = bytes[layeridx + 5] + ((bytes[layeridx + 6] & 0b00001111) <<8)
}

/**
 * Display vera registers
 */
function vera_get()
{
    let remote = "http://localhost:9009/dump/0/0x9f20/32";
    let premise = fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );
        Vera.addr = bytes[veralo] + (bytes[veramid] << 8) + (bytes[verahi] << 16)

        // Layers
        vera_decode_layer(bytes, veral0config, Vera.l0)
        vera_decode_layer(bytes, veral1config, Vera.l1)
        // record current values
        Vera.previous = bytes

        return "OK"
    })
    .catch (error => { 
        console.log(error);
    })

    return premise
}
