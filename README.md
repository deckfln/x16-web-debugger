[![License: BSD-Clause](https://img.shields.io/github/license/x16community/x16-emulator)](./LICENSE)

This is an experimental remote debugger for the Commander X16 emulator. It is tailored for CA65 assembler code and needs a patched version of the emulator available here

Features
--------
* debug in source code
* display memory as structure
* _(todo) display memory as byte, word, long_
* memory dump
* memory breakpoints
* code breakpoints
 
Memory dump
-----------
* dump 256 bytes of memory from the address provided in hexadecimal
* highlights bytes changed
* add memory breakpoints on individual bytes
* monitored memory bytes are highlight
* change size of monitored bytes on the fly (byte, word, long)

Code breakpoints
----------------
* _(todo) conditional code breakpoint_

Memory breakpoints
------------------
* Trigger a breakpoint as soon as the content of the memory changes (byte, word, long)
* _(todo) Trigger a breakpoint when the memory content reaches a predefined value_

Memory watches
--------------
* Display memory as a structure defined in the source code (.STRUCTURE / .ENDSTRUCTURE)
* indirect access register base (r0),y
* memory indirect access ($0002),y

ca65 parameters
---------------
RemoteD needs ca65 debug info. In order to generate the proper data ca65 needs the following options

ca65 --debug-info -t cx16 main.asm -o main.o
cl65 -t cx16 -o test.prg main.o -Wl --dbgfile,test.dbg

Configuration
-------------
Update config.json to point to the source code folder and the debug files

{
    "root":"d:/dev/x16/x16-uncharted",
    "sources":"/src",
    "remote":"http://localhost:9009",
    "debuginfo":"/bin/test.dbg",
    "symbols":""
}