let hSymbols = {}

function load_symbols(file, callback)
{
    let local = "/code/"+file;
    fetch (local, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.text())
    .then ( text => {
        let symbols = text.split("\n");
        for (i in symbols) {
            let symbol = symbols[i];
            let addr = symbol.substring(3, 9);
            let val = symbol.substring(10);
            let daddr = parseInt(addr, 16);
            hSymbols[daddr]=val;
        }
        if (callback) {
            callback();
        }
    })
    .catch (error => {
        console.log(error);
    })
}