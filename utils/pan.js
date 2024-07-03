import constants from "./constants"
import { getViewBox } from "./zoom"

/**
 * Returns to the original position the canvas (0, 0) 
 */
export function resetPan(){
    const {x, y} = getViewBox()
    window.ctx.translate(x, y)
    window.cvs.canvasPanOffset = {x: 0, y: 0}
}

/**
 * Returns true if the user has the panning keys pressed.
 * 
 * The panning action can be triggered by any of the following:
 * - Holding the pan key (shortcut defined in constants.PAN_KEY)
 * - Holding the pan mouse button (defined in constants.PAN_MOUSE_BUTTON)
 * 
 * @returns {boolean} Whether the user is panning elements in the canvas.
 */
export function isPanning(){
    return window.cvs.panning
}

/**
 * Moves the canvas by the given offset by displacing the origin by a given amount.
 * 
 * Imagine an axis with the origin at the top-left corner of the canvas. 
 * - The positive x-axis goes to the right.
 * - The positive y-axis goes down.
 *  
 * @param {number} dx The offset in the x-axis.
 * @param {number} dy The offset in the y-axis.
 */
export function panBy(dx, dy){
    // Move the canvas
    window.ctx.translate(dx, dy)
    // Update the pan offset global variable
    window.cvs.canvasPanOffset.x -= dx
    window.cvs.canvasPanOffset.y -= dy
    // Update the mouse coordinates
    window.cvs.x -= dx
    window.cvs.y -= dy
}

/**
 * Moves the canvas to the given position.
 * 
 * Imagine an axis with the origin at the top-left corner of the canvas. 
 * - The positive x-axis goes to the right.
 * - The positive y-axis goes down.
 *  
 * @param {number} x The new x position.
 * @param {number} y The new y position.
 */
export function panTo(x, y){
    const {x: currentX, y: currentY} = getViewBox()
    panBy(currentX - x, currentY - y)
}



/**
 * Start panning the canvas.
 * 
 * This function should be called when the user has pressed the pan key or the pan mouse button.
 */
export function startPanning(){
    document.body.style.cursor = "grabbing"
    window.cvs.panning = true
}


/**
 * Stop panning the canvas.
 * 
 * This function should be called when the user has released the pan key or the pan mouse button.
 */
export function stopPanning(){
    document.body.style.cursor = "default"
    window.cvs.panning = false
}


/**
 * Check if the pan shortcut is pressed.
 * 
 * @returns {boolean} Whether the pan shortcut is pressed.
 */
export function isPanKeysPressed(){
    const option1 = window.cvs.keysDown[constants.PAN_KEY] && window.cvs.mouseDown === 0
    const option2 = window.cvs.mouseDown === constants.PAN_MOUSE_BUTTON
    return option1 || option2
}
