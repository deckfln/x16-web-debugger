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
* _(todo) register indirect access (r0),y_
* _(todo) memory indirect access ($800),y_