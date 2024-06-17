export function checkShortcut(string){
    const keys = string.split("+")

    keys.forEach(key => {
        if (!checkKey(key)) return false
    })

    // Check if only the keys in the shortcut are pressed
    for (const key in window.cvs.keysDown){
        if (checkKey(key)) continue
        if (!keys.includes(key) && window.cvs.keysDown[key]) return false
    }

    return true
}

export function checkKey(code){
    const aliases = getKeyFormAliases(code)
    return aliases.some(alias => window.cvs.keysDown[alias])
}

export function getKeyFormAliases(code){
    // Is digit
    if (code.match(/^\d$/)) return ["Digit"+code, "Numpad"+code]

    // Is letter
    if (code.match(/^[a-z]$/i)) return ["Key"+code.toUpperCase()]

    // Is special key
    switch(code.toLowerCase()){
        case "control":
            return ["ControlLeft", "ControlRight"]
        case "alt":
            return ["AltLeft", "AltRight"]
        case "shift":
            return ["ShiftLeft", "ShiftRight"]
        case "meta":
            return ["MetaLeft", "MetaRight"]
        case "arrow":
            return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
        default:
            return [code]
    }
}

export function anySpecialKeyPressed(){
    if (window.cvs.keysDown["ControlLeft"] || window.cvs.keysDown["ControlRight"]) return true
    if (window.cvs.keysDown["AltLeft"] || window.cvs.keysDown["AltRight"]) return true
    if (window.cvs.keysDown["ShiftLeft"] || window.cvs.keysDown["ShiftRight"]) return true
    if (window.cvs.keysDown["MetaLeft"] || window.cvs.keysDown["MetaRight"]) return true
    return false
}