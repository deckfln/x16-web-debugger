"use strict";

let aDisasm = [];

/**
 * create a new dock
 */
function new_dock_disam()
{
    const html='<div class="disam-menu"><div id="jump"><input type="text" id="goto" name="goto" required minlength="4" maxlength="4" size="10" onkeypress="clickPress(event)"/></div></div><div id="disam"></div>'
    dock_new("Disassembler", "dock-disam")
    let node = $('#dock-disam')
    node.html(html)
    dock_disam_display()
}

/**
 * download and disassemble a memory block 
 * @param {*} bank 
 * @param {*} address 
 * @returns 
 */
function dock_disasm(bank, address)
{
    let remote = "http://localhost:9009/dump/" + bank + "/" + address;
    let p = fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let bytes = new Uint8Array( buffer );
        let pc = 0
        let asm = {
            pc: 0,
            start: address,
            txt: "",
            symbol: undefined,
            next: 0
        }
        let brk=false;
        let i = 0;
        let newMap = aDisasm.length == 0;

        while (asm.next < 253) {
            // ignore the last 3 bytes, as the instruction my go over buffer
            disam_line(bytes, asm, 0);
            brk=false;
            if (Breakpoints[asm.pc + asm.start] != undefined) {
                brk = true;
            }

            if (i >= aDisasm.length) {
                aDisasm.push({
                    'addr':asm.pc + asm.start,
                    'instr':asm.txt,
                    'symbol': asm.symbol
                })
            }
            else {
                aDisasm[i].addr = asm.pc + asm.start;
                aDisasm[i].instr = asm.txt;
                aDisasm[i].symbol = asm.symbol;
            }
            asm.pc = asm.next;
            i++;
        }
        dock_disam_display();

        return "ok"
    })
    .catch (error => { 
        console.log(error);
    })      
    return p 
}

/**
 * disassemble the memory block
 */
function dock_disam_display()
{
    let table=$('<table>');
    for (let i=0; i<32; i++) {
        let tr=$('<tr>');

        let clss = "nobrk";
        let addr = aDisasm[i].addr;
        let symbol = aDisasm[i].symbol; if (symbol == undefined) symbol = "";
        if (addr == cpu.pc) {
            if (Breakpoints[addr] != undefined) {
                clss = "exec-breakpoint"
            }
            else {
                clss = "exec"
            }
            cpu.update = aDisasm[i].addr
        }
        else if (Breakpoints[addr] != undefined) {
            clss = "breakpoint"
        }
        let onclick = "onClick='toggleBreapoint(" + addr + ",0);'"

        tr.append("<td class=\""+ clss + "\" " + onclick + ">&nbsp;</td><td class=\"addr\">"+snprintf(aDisasm[i].addr,"%04X")+"</td><td class=\"source-instr\">"+symbol+"</td><td>"+aDisasm[i].instr)+"</td>";
        tr.attr("id", "brk" + addr)
        table.append(tr);
    }
    table.attr("class", "code")
    $('#disam')[0].innerHTML = table[0].outerHTML;

    if (cpu.update) {
        cpu.previous_pc = $("#brk" + cpu.update)
        cpu.update = false
    }
}

/**
 * update PC during debugging
 * @returns 
 */
function dock_disam_update()
{
    let id = '#brk'+cpu.pc;
    let found = $(id);   // PC is on screen ?
    if (found.length == 0) {
        // jumped page
        dock_disasm(0, cpu.pc);
        return
    }

    // clean previous pointer
    if (cpu.previous_pc != undefined) {
        cpu.previous_pc.removeClass("pc")

        let td = cpu.previous_pc.find("td:first-child")
        let clss = td.attr("class")
        switch (clss) {
            case "exec":
                td.removeClass(clss);
                td.addClass("nobrk");
                break;
            case "exec-breakpoint":
                td.removeClass(clss);
                td.addClass("breakpoint");
                break;
        }                    
    }

    // activate new pointer
    let td = found.find("td:first-child")
    let clss = td.attr("class")
    switch (clss) {
        case "breakpoint":
            td.removeClass(clss);
            td.addClass("exec-breakpoint");
        break;
        case "nobrk":
            td.removeClass(clss);
            td.addClass("exec");
            break;
    }
    found.addClass("pc")
    cpu.previous_pc = found;
}

/**
 * Toggle the breakpoint
 * @param {*} brk 
 */
function disasm_toggleBreakpoint(addr)
{
    let id = '#brk' + addr;
    let found = $(id);   // PC is on screen ?
    if (found.length == 0) {
        return
    }

    let td = found.find("td:first-child")
    let clss = td.attr("class")
    switch (clss) {
        case "breakpoint":
            td.removeClass(clss);
            td.addClass("nobrk");
        break;
        case "nobrk":
            td.removeClass(clss);
            td.addClass("breakpoint");
            break;
    }
}