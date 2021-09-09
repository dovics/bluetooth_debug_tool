const inArray = (arr, key, val) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) {
            return i;
        }
    }
    return -1;
}

const ab2hex = (buffer) => {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('');
}

const hex2ab = (str) => {
    let s = str.toUpperCase()
    let result = new Uint8Array(str.length / 2)
    for (var i = 0; i < str.length; i = i + 2) {
        result[i / 2] = (s.charCodeAt(i) - 48) * 16 + s.charCodeAt(i + 1) - 48
    }

    return result;
}


const uuid = () => {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {

        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);

    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");

    return uuid;
}

export {
    inArray,
    ab2hex,
    hex2ab,
    uuid
}