function structures_map()
{
    // search for each structure in all the files
    // build the content of the structure

    for (let struct in debug_info.structures) {
        let found = false
        for (let fileID in debug_info.files) {
            let lines = debug_info.files[fileID].text
            let foundStruct = false

            for (let i in lines) {
                let l = lines[i].toLowerCase()

                if (!foundStruct) {
                    if (l.indexOf(".struct") >= 0) {
                        if (l.indexOf(struct) >= 0) {
                            foundStruct = true
                        }
                    } 
                }
                else {
                    if (l.indexOf(".endstruct") >= 0) {
                        foundStruct = false
                        found = true
                        break
                    }
                    else {
                        // split the line to extract (spaces)attribute_name(spaces)type
                        let re = /[ \t]*(\w*)[ \t]+(\.\w*)/i
                        let m = l.match(re)
                        if (m) {
                            let attr = {"name": m[1], "size": m[2], "index": 0}
                            if (m[2] == ".tag" || m[2] == ".TAG") {
                                re = /[ \t]*(\w*)[ \t]+(\.\w*)[ \t]+(\w*)/i
                                m = l.match(re)
                                if (m) {
                                    attr.size = m[3]
                                }
                            }
                            debug_info.structures[struct].attributes.push(attr)
                        }
                    }
                }
            }
            if (found) {
                break       // structure found in the current file, so move to the next file
            }

        }
    }

    // for each structure build the memory map
    for (let struct in debug_info.structures) {
        let memory = 0
        for (let i in debug_info.structures[struct].attributes) {
            debug_info.structures[struct].attributes[i].index = memory

            let ssize = debug_info.structures[struct].attributes[i].size
            let size = 0

            switch (ssize) {
                case ".byte":
                    size = 1
                    break
                case ".word":
                case ".addr":
                    size = 2
                    break
                case ".res":
                    console.log("not implemented .RES")
                    break;
                default:
                    size = debug_info.structures[ssize].size
            }

            memory += size
        }
    }
}