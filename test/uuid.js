const hex2ab = (str) => {
    let s = str.toUpperCase()
    let result = new Uint8Array(str.length / 2)
    for (var i = 0; i < str.length; i = i + 2) {
        result[i / 2] = (s.charCodeAt(i) - 48) * 16 + s.charCodeAt(i + 1) - 48
    }

    return result;
}
