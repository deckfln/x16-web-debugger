"use strict";

const _controls = [
    "INTERRUPTOR",
    "FORCEIMPORT",
    "CONSTRUCTOR",
    "DESTRUCTOR",
    "AUTOIMPORT",
    "PAGELENGTH",
    "EXITMACRO",
    "BANKBYTES",
    "DEBUGINFO",
    "ENDREPEAT",
    "ENDSTRUCT",
    "LOCALCHAR",
    "LISTBYTES",
    "ENDMACRO",
    "ENDSCOPE",
    "IFNBLANK",
    "ZEROPAGE",
    "EXPORTZP",
    "GLOBALZP",
    "IMPORTZP",
    "LINECONT",
    "SEGMENT",
    "CHARMAP",
    "DEFINED",
    "ENDENUM",
    "ENDPROC",
    "EXITMAC",
    "FARADDR",
    "FEATURE",
    "FILEOPT",
    "HIBYTES",
    "IFBLANK",
    "IFCONST",
    "IFPSC02",
    "INCLUDE",
    "LOBYTES",
    "MACPACK",
    "PAGELEN",
    "PUSHSEG",
    "SUNPLUS",
    "WARNING",
    "ASCIIZ",
    "ASSERT",
    "CONDES",
    "DEFINE",
    "ELSEIF",
    "ENDMAC",
    "ENDREP",
    "EXPORT",
    "GLOBAL",
    "IFNDEF",
    "IFNREF",
    "IFP816",
    "IFPC02",
    "IMPORT",
    "INCBIN",
    "POPSEG",
    "REPEAT",
    "RODATA",
    "SETCPU",
    "STRUCT",
    "MACRO",
    "ALIGN",
    "DWORD",
    "ENDIF",
    "ERROR",
    "IFDEF",
    "IFP02",
    "IFREF",
    "LOCAL",
    "PSC02",
    "RELOC",
    "SCOPE",
    "SMART",
    "ADDR",
    "BYTE",
    "CASE",
    "CODE",
    "DATA",
    "DBYT",
    "ELSE",
    "ENUM",
    "FOPT",
    "LIST",
    "P816",
    "PC02",
    "PROC",
    "WORD",
    "A16",
    "BSS",
    "BYT",
    "DEF",
    "END",
    "I16",
    "MAC",
    "ORG",
    "OUT",
    "P02",
    "RES",
    "TAG",
    "A8",
    "I8",
    "IF"
]

const _pseudof = [
    "REFERENCED",
    "BANKBYTE",
    "SPRINTF",
    "CONCAT",
    "HIBYTE",
    "HIWORD",
    "LOBYTE",
    "LOWORD",
    "SIZEOF",
    "STRING",
    "STRLEN",
    "TCOUNT",
    "XMATCH",
    "BLANK",
    "CONST",
    "IDENT",
    "MATCH",
    "RIGHT",
    "STRAT",
    "LEFT",
    "MID",
    "REF"
]

/**
 * Syntax highlighting by line
 * @param {*} line 
 * @returns 
 */
function ca65_syntax(line)
{
    // escape special characters to HTML, but forget the ; (comment in ca65)
    line = line.replace(/&/g, "&amp")
        .replace(/</g, "&lt")
        .replace(/>/g, "&gt")
        .replace(/"/g, "&quot")
        .replace(/'/g, "&#39");  

    let icomment = line.indexOf(";")
    if (icomment >= 0) {
        line = line.replace(";", "<span class=\"comment\">;")
        line += "</span>"
    }
    else {
        icomment = line.length
    }

    // find the 3 first letters at the beginning of the line
    let start = -1
    for (let i=0; i<icomment; i++) {
        if (line.substr(i, 1) != " " && line.substr(i, 1) != "\t") {
            start = i
            break
        }
    }

    // render the mnemonic
    if (start >= 0) {
        let op = line.substr(start, 3)
        let next = line.substr(start+3, 1)

        if (next == " " || next == "\t" || next == '') {
            if (hmnemonics[op.toLowerCase()] != undefined) {
                line = line.substr(0, start)+ "<span class=\"mnemonics\">" + op + "</span>" + line.substr(start+3)
            }
        }
    }

    // render hexa number
    let hex = line.match(/#?(\$[\da-f]{1,4})\b/i)
    if (hex) {
        line = line.replace(hex[1], '<span class="hlhex">' + hex[1] + '</span>')
    }

    // render binary number
    let bin = line.match(/#?(%[01]+)\b/i)
    if (bin) {
        line = line.replace(bin[1], '<span class="hlhex">' + bin[1] + '</span>')
    }

    // render decimal number
    let dec = line.match(/#?\b(\d+)\b/i)
    if (dec) {
        line = line.replace(dec[1], '<span class="hlhex">' + dec[1] + '</span>')
    }

    // render the controls
    let control
    let lineU = line.toUpperCase()
    for (let i in _controls) {
        control = "." + _controls[i]
        start = lineU.indexOf(control)
        if (start >= 0) {
            let next = line.substr(start+control.length, 1)
            if (next == " " || next == "\t" || next == '') {
                line = line.substr(0, start)+ "<span class=\"control\">" + control + "</span>" + line.substr(start+control.length)
                break
            }
        }
    }

    // finish escaping special characters to HTML
    line = line.replaceAll("&amp", "&amp;")
        .replaceAll("&lt", "&lt;")
        .replaceAll("&gt", "&gt;")
        .replaceAll("&quot", "&quot;")
        .replaceAll("&#39", "&#39;");  

    return line
}