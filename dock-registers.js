function dock_registers(bank, address)
{
    let remote = "http://localhost:9009/dump/0/0002/32";
    fetch (remote, {
        method: 'GET',
        mode: "cors"
    })
    .then ( response => response.arrayBuffer())
    .then ( buffer => {
        let words = new Uint16Array( buffer );

        let table=$('<table>');
        for (r = 0; r < 16; r++) {
                let tr=$('<tr>');
                tr.append("<td>R"+r+"</td><td>" + snprintf(words[r],"%04X") + "</td>")
                table.append(tr);
        }
        $('#registers')[0].innerHTML = table[0].outerHTML;
    })
    .catch (error => { 
        console.log(error);
    })       
}
