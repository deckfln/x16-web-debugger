[![License: BSD-Clause](https://img.shields.io/github/license/x16community/x16-emulator)](./LICENSE)

This is an experimental remote debugger for the Commander X16 emulator. It is tailored for CA65 assembler code and needs a patched version of the emulator available here

Design
------
```
          http://*:9000            http://localhost:3000           http://*:3000
+---------+----------+                +---------+                  +-----------+
|         |MicroHTTP | <------------> | Browser | <--------------> | server.py |
|         |----------+                |         |                  +-----------+
|         | Remote   |                +---------+                    |       |
|         | Debugger |                                     Project <-+       +-> Debugger 
| mainloop-----------+                                     Folder               Folder
|         |
|         |
+---------+
  x16-emulator
```

Features
--------
* Debug CA65 source code
* Memory dump
* Memory breakpoints
* Code breakpoints
* Display memory as structure

Memory dump
-----------
* Dump 256 bytes of memory from the address provided in hexadecimal
* Highlights bytes changed
* Add memory breakpoints on individual bytes
* Monitored memory bytes are highlight
* Change size of monitored bytes on the fly (byte, word, long)

Source code
-----------
* Syntax highlighting

Code breakpoints
----------------
* Set breakpoints on instructions on the source code

Memory breakpoints
------------------
* Trigger a breakpoint as soon as the content of the memory changes (byte, word, long)

Memory watches
--------------
* Display memory as a structure defined in the source code (.STRUCTURE / .ENDSTRUCTURE)
* indirect access register base (r0),y
* memory indirect access ($0002),y
* highlights attributes changed

Todo
----
* [ ] Display memory as byte, word, long
* [ ] Conditional code breakpoint
* [ ] Trigger a breakpoint when the memory content reaches a predefined value_

Configuration
-------------
Update config.json to point to the source code folder and the debug files
{
    "root":"d:/dev/x16/x16-uncharted",      // home folder of the project
    "sources":"/src",                       // sub folder with sources
    "remote":"http://localhost:9009",       // address of the emulator
    "debuginfo":"/bin/test.dbg",            // local path of the debug info file
    "symbols":""                            // local path of the symbol files (if there is no debuginfo)
}

Usage
-----
* Compile the source code with debug options
 * ca65 __--debug-info__ -t cx16 main.asm -o main.o
 * cl65 -t cx16 -o ../bin/test.prg main.o __-Wl --dbgfile,../bin/test.dbg__

* Start the debugger server
 * __cd x16-web-debugger__
 * __python server.py__

* Start the emulator in remote debug mode
 * x16-emulator.exe -rom rom.bin __-remote-debugger__ -prg test.prg

* point your web browser to the remote debugger
 * http://localhost:3000

Used libraries
--------------
* jquery : https://jquery.com/
* jstree : https://github.com/vakata/jstree
* dock-spawn-ts : https://github.com/node-projects/dock-spawn-ts

 Mandatory screenshot
 --------------------
 ![IDE screenshot](/.gh/ide.jpg)