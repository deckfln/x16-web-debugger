Vera = {
    addr: undefined
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

        let addr = bytes[veralo] + (bytes[veramid] << 8) + (bytes[verahi] << 16)
        let clss = ''

        if (Vera.addr != addr) {
            clss = ' class="updated"'
            cpu.addr = addr
        }

        let html = "vera : <span " + clss + ">" + snprintf(addr,"%05X") + "</span>"

        $('#vera')[0].innerHTML = html
    })
    .catch (error => { 
        console.log(error);
    })       
}
