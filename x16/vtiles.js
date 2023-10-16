"use strict";

/**
 * depth: 1 - monochrome
 *        4 - 4-bit grayscale
 *        8 - 8-bit grayscale
 *       16 - 16-bit colour
 *       32 - 32-bit colour
 **/
function tiles_drawArray(arr, start, h, w, depth) {
    var image;

    function conv(size) {
        return String.fromCharCode(size&0xff, (size>>8)&0xff, (size>>16)&0xff, (size>>24)&0xff);
    }

    function ulong(i, size) {
        bmp[i] = size&0xff
        bmp[i+1] = (size>>8)&0xff
        bmp[i+2] = (size>>16)&0xff
        bmp[i+3] = (size>>24)&0xff
    }
    function uword(i, size) {
        bmp[i] = size&0xff
        bmp[i+1] = (size>>8)&0xff
    }

    let offset = depth <= 8 ? 54 + Math.pow(2, depth)*4 : 54;
    let size = h * w

    //BMP Header
    let bmp = new Uint8Array( offset + size)

    bmp[0] = 66                     // ID field
    bmp[1] = 77 
    ulong(2, offset + size)         // BMP size
    ulong(10, offset)               // pixel data offset

    //DIB Header
    ulong(14, 40)                   // DIB header length
    ulong(18, w)                    // image height
    ulong(22, h)                    // image width
    uword(26, 1)                    // colour panes
    uword(28, depth)                // bits per pixel
    ulong(30, 0)                    // compression method
    ulong(34, size)                 // size of the raw data
    ulong(38, 2835)                 // horizontal print resolution
    ulong(42, 2835)                 // vertical print resolution
    ulong(46, 0)                    // colour palette, 0 == 2^n
    ulong(50, 0)                    // important colours

    //Grayscale tables for bit depths <= 8
    if (depth <= 8) {
        for (let s = Math.floor(255/(Math.pow(2, depth)-1)), i = s, palette = 54 + s*4; i < 256; i += s)  {
            ulong(palette, i + i*256 + i*65536)
            palette += 4
        }
    }

    // copy data
    for (let i = 1; i < (size * 2); i+=2)  {
        bmp[offset++] = arr[start + i]
    }

    //Image element
    image = document.createElement('img');

    image.src = 'data:image/bmp;base64,' + btoa(String.fromCharCode.apply(null,bmp));

    return image;
}

/**
 * download and convert tiles
 */

function tiles_get(index)
{
    let size = Vera.l0.tileH * Vera.l0.tileW
    let address = Vera.l0.tilebase + size * index
    let remote = "http://localhost:9009/vera/dump/" + address + "/" + size;
    let premise = fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer )
        Vera.tiles[index] = tiles_drawArray(bytes, 0, Vera.l0.tileW, Vera.l0.tileH, 8)
        return Vera.tiles[index]
    })
    return premise
}