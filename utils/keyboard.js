/**
 * Check if a combination of keys is pressed, and no other keys are pressed meanwhile.
 * 
 * The format of the string should be "<key>+<key>+...+<key>", where each key is a key code or alias.
 * 
 * @See {@link getKeysFromAlias} for the list of aliases.
 * 
 * @param {String} string The shortcut to be checked. It should be in the format: "Ctrl+Shift+Z"
 * @returns Boolean indicating if the shortcut is pressed
 */
export function checkShortcut(string){
    const keys = string.split("+")  // Split the string into an array of keys

    // Check if all the keys that should be pressed are pressed
    const allPressed = keys.every(key => {
        if (checkKey(key)) return true
    })

    // If not all the keys are pressed, return false
    if (!allPressed) return false

    // Check if the only keys pressed are the keys of the shortcut
    const validKeys = keys.map(key => getKeysFromAlias(key)).flat()  // Generate a list of keys that are valid/allowed
    // Iterate over all the keys
    for (const key in window.cvs.keysDown){
        const isPressed = window.cvs.keysDown[key] // Check if the key is pressed
        const includes = validKeys.includes(key)   // Check if the key is part of the valid keys list
        if (!includes && isPressed) return false   // If the key is not part of the valid keys list, and it is pressed, return false
    }

    // Otherwise,
    return true
}

/**
 * Check if a key is pressed.
 * 
 * The key can be a key code, or an alias for a group of keys.
 * 
 * @See {@link getKeysFromAlias} for the list of aliases.
 * 
 * @param {String} aliasOrKey The key code or alias to be checked
 * @returns Boolean indicating if the key is pressed
 */
export function checkKey(aliasOrKey){
    const keys = getKeysFromAlias(aliasOrKey)  // Get the list of aliases associated with the key
    return keys.some(key => window.cvs.keysDown[key])  // Check if any of the aliases are pressed
}


/**
 * Get the list of keys associated with an alias.
 * 
 * The aliases are:
 * - "Control" for both left and right control keys.
 * - "Alt" for both left and right alt keys.
 * - "Shift" for both left and right shift keys.
 * - "Meta" for both left and right meta keys.
 * - "Arrow" for the arrow keys (Up, Down, Left, Right).
 * 
 * @param {String} code The alias to be checked
 * @returns Array of key codes associated with the alias
 */
export function getKeysFromAlias(code){
    // Is digit: (1) -> [Digit1, Numpad1]
    if (code.match(/^\d$/)) return ["Digit"+code, "Numpad"+code]

    // Is letter: (a) -> [KeyA]
    if (code.match(/^[a-z]$/i)) return ["Key"+code.toUpperCase()]

    // Is special key
    switch(code.toLowerCase()){
        case "control": return ["ControlLeft", "ControlRight"]
        case "alt": return ["AltLeft", "AltRight"]
        case "shift": return ["ShiftLeft", "ShiftRight"]
        case "meta": return ["MetaLeft", "MetaRight"]
        case "arrow": return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
        default: return [code]
    }
}

/**
 * Check if any special key is pressed.
 * 
 * Special keys are: Control, Alt, Shift, and Meta.
 * 
 * @returns Boolean indicating if any special key is pressed
 */
export function anySpecialKeyPressed(){
    if (window.cvs.keysDown["ControlLeft"] || window.cvs.keysDown["ControlRight"]) return true
    if (window.cvs.keysDown["AltLeft"] || window.cvs.keysDown["AltRight"]) return true
    if (window.cvs.keysDown["ShiftLeft"] || window.cvs.keysDown["ShiftRight"]) return true
    if (window.cvs.keysDown["MetaLeft"] || window.cvs.keysDown["MetaRight"]) return true
    return false
}


export function getPressedShortcut(){

    let shortcut = []
    if (window.cvs.keysDown["ControlLeft"] || window.cvs.keysDown["ControlRight"]) shortcut.push("control")
    if (window.cvs.keysDown["AltLeft"] || window.cvs.keysDown["Altright"]) shortcut.push("alt")
    if (window.cvs.keysDown["ShiftLeft"] || window.cvs.keysDown["ShiftRight"]) shortcut.push("shift")
    if (window.cvs.keysDown["MetaLeft"] || window.cvs.keysDown["MetaRight"]) shortcut.push("meta")
        
    const keys = Object.keys(window.cvs.keysDown).sort().filter(key => window.cvs.keysDown[key] && !key.match(/(control|alt|shift|meta)/i)).map(key => getKeyFromCode(key))
    shortcut = shortcut.concat(keys)

    return shortcut.join("+")
}
    

export function getKeyFromCode(code){

    switch(code){
        case "ControlLeft" || "ControlRight": return "control"
        case "AltLeft" || "AltRight": return "alt"
        case "ShiftLeft" || "ShiftRight": return "shift"
        case "MetaLeft" || "MetaRight": return "meta"
    }

    const key = code.replace(/(key|digit|numpad)/i, "").toLowerCase()
    return key
}


export function handleShortcut(SHORTCUTS){
    const key = getPressedShortcut()
    const shortcutCallback = SHORTCUTS[key]

    if (shortcutCallback) {
        if (window.cvs.debug) console.log("Shortcut up key: ", key)
        shortcutCallback(key)
        return true
    }

    return false
}