import constants from "./constants"
import { getViewBox } from "./zoom"

/**
 * Clears the canvas by drawing a rectangle that covers the entire canvas area and an extra margin to avoid artifacts.
 */
export function clean(){
    const coords = getViewBox()  // Get the coordinates of the view box
    const margin = constants.CLEAN_MARGIN  // Margin to clear the canvas and avoid artifacts
    window.ctx.clearRect(coords.x - margin, coords.y - margin, coords.width + margin * 2, coords.height + margin * 2)
}



/**
 * Prints information on the canvas when the debug mode is enabled.
 * 
 * @param {Array} data Array of strings to be printed on the canvas along with the default debug information.
 */
export function drawDebugInfo(data){
    window.ctx.save()
    
    const zoom = window.cvs.zoom

    window.ctx.fillStyle = 'black'
    window.ctx.font = `${12 / zoom}px Arial`
    window.ctx.textAlign = 'right'

    // Default Debug info
    data = [
        `(${window.cvs.x})  - (${window.cvs.y})`,
        "Zoom: " + window.cvs.zoom,
        "Mouse down: " + window.cvs.mouseDown,
        "Dragging origin: " + (window.cvs.draggingOrigin ? `(${window.cvs.draggingOrigin.x}) - (${window.cvs.draggingOrigin.y})` : "None"),
        "Key: " + window.cvs.key,
        "Keys down: " + Object.keys(window.cvs.keysDown).filter(k => window.cvs.keysDown[k]).join('+') || "None",
        "Double click ready: " + (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY ? 'Yes' : 'No'),
        "Canvas pan offset: (" + window.cvs.canvasPanOffset.x + ") - (" + window.cvs.canvasPanOffset.y + ")",

        // Custom debug data
        ...data
    ]

    // Canvas pan offset
    const panOffsetY = window.cvs.canvasPanOffset.y
    // Coords of the right side of the canvas minus a small margin of 10px
    const posX = getViewBox().x2 - 10 / zoom

    // Custom data
    for (let i = 0; i < data.length; i++) {
        const lineY = i * 14 / zoom
        const posY = 20 / zoom + lineY + panOffsetY
        ctx.fillText(data[i], posX, posY)
    }

    // Last line following coordinates
    const cmdsY = 20 / zoom + data.length * 14 / zoom + panOffsetY
    const cmdsX = posX
    const cmdsH = 20 / zoom


    // Draw debug commands as small buttons
    let isHover = undefined
    for (let i = 0; i < window.cvs.debugCommands.length; i++) {
        const command = window.cvs.debugCommands[i]
        const cmdY = cmdsY + i * cmdsH * 1.2
        const textW = ctx.measureText(command.label).width

        // Draw the command label
        ctx.fillStyle = 'black'
        ctx.textAlign = "right"
        ctx.fillText(command.label, posX, cmdY + 12 / zoom)

        const btnX1 = posX - textW - 5 / zoom
        const btnX2 = posX + 5 / zoom
        const btnY1 = cmdY
        const btnY2 = cmdY + cmdsH

        // Draw the command button
        ctx.strokeStyle = 'black'
        ctx.fillStyle = '#8888'
        ctx.fillRect(btnX1, btnY1, textW + 10 / zoom, cmdsH)

        // Hover
        if (window.cvs.x > posX - textW - 5 / zoom && window.cvs.x < posX + 5 / zoom && window.cvs.y > cmdY && window.cvs.y < cmdY + cmdsH) {
            ctx.fillStyle = '#fff2'
            ctx.fillRect(posX - textW - 5 / zoom, cmdY, textW + 10 / zoom, cmdsH)
            isHover = command
        }
    }

    // Hover
    if (isHover) {
        window.cvs.debugCommandHover = isHover
    } else {
        window.cvs.debugCommandHover = null
    }

    // Custom funcs
    for (let f in window.cvs.debugFunctions) {
        window.cvs.debugFunctions[f]()
    }

    // Reset the style
    window.ctx.restore()
}