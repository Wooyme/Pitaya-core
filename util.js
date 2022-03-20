window.uploadBinary = async function(binary){
    console.log(binary);
    const file = {
        content:binary
    }
    const result = await window._ipfs.add(file);
    console.log(result);
    return result.path;
}

window.getBinaryUrl = async function(path){
    let array = [];
    for await (const buf of window._ipfs.cat(path)) {
        array.push(buf);
    }
    console.log(array);
    return window.URL.createObjectURL(new Blob(array,{type:'application/octet-stream'}));
}