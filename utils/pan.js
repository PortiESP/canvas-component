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
 * Returns true if the user has the dragging keys pressed.
 * 
 * The dragging action can be triggered by any of the following:
 * - Holding the pan key (Space+LeftMouseButton)
 * - Holding the pan mouse button (Middle mouse button)
 * 
 * @returns {boolean} Whether the user is dragging elements in the canvas.
 */
export function isDragging(){
    const option1 = window.cvs.keysDown[constants.PAN_KEY] && window.cvs.mouseDown === 0
    const option2 = window.cvs.mouseDown === constants.PAN_MOUSE_BUTTON
    return option1 || option2
}