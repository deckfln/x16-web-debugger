"use strict";

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
