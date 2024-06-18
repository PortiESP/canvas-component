import constants from "./constants"
import { panBy } from "./pan"

/**
 * Resets the zoom of the graph to the default value (1).
 */
export function resetZoom(){
    window.ctx.scale(1/window.cvs.zoom, 1/window.cvs.zoom)
    window.cvs.zoom = 1
}

/**
 * Calculates some values related to the coordinates and dimensions of the canvas.
 * 
 * @returns {Object} Returns an object with the following properties:
 * - x: The x coordinate of the top-left corner of the canvas
 * - y: The y coordinate of the top-left corner of the canvas
 * - width: The width of the canvas
 * - height: The height of the canvas
 * - x2: The x coordinate of the bottom-right corner of the canvas
 * - y2: The y coordinate of the bottom-right corner of the canvas
 */
export function getViewBox(){
    const {x, y} = window.cvs.canvasPanOffset
    const {width, height} = window.cvs.$canvas
    return {
        x,
        y,
        width: width/window.cvs.zoom,
        height: height/window.cvs.zoom,
        x2: x + width/window.cvs.zoom,
        y2: y + height/window.cvs.zoom
    }
}

/**
 * Zooms the graph to a specific level.
 * 
 * @param {Boolean} zoomIn - Whether to zoom in or out. If true, zooms in, otherwise zooms out.
 */
export function zoomCenter(zoomIn){
    // Determine the zoom factor
    const zoomFactor = zoomIn ? 1.1 : 0.9
    // Calculate the new zoom level
    const newZoom = zoomIn ? window.cvs.zoom * zoomFactor : window.cvs.zoom * zoomFactor

    // Calculate the new canvas position
    const {x, y, width, height} = getViewBox()
    const userX = window.cvs.x  // Current mouse position
    const userY = window.cvs.y
    const dx = -(width*zoomFactor - width)/2  // Calculate the offset to center the zoom (padding)
    const dy = -(height*zoomFactor - height)/2

    // Apply the zoom (we need to revert the canvas position since the zoom is applied from the top-left corner of the canvas)
    window.ctx.translate(x, y) // Reset the canvas position
    window.ctx.scale(zoomFactor, zoomFactor) // Apply the zoom
    window.ctx.translate(-x, -y) // Apply again the canvas position

    // Update the canvas position
    panBy(dx, dy)
    
    // Update the zoom level
    window.cvs.zoom = newZoom

    // Update mouse position (to keep mouse position unchanged after zooming, this is necessary due to the translations applied to the canvas, this translations move the canvas, but the mouse position is not updated until the next mouseMove event so we need to update it manually just in case the user does not move the mouse after zooming)
    window.cvs.x = userX-dx
    window.cvs.y = userY-dy
}

/**
 * Zooms in the graph.
 */
export function zoomIn(){
    const {x, y} = window.cvs
    zoomCenter(true)
}


/**
 * Zooms out the graph.
 */
export function zoomOut(){
    const {x, y} = window.cvs
    zoomCenter(false)
}


export function zoomToFit(toWidth, toHeight){
    const {x, y, width: currentWidth, height: currentHeight, x2, y2} = getViewBox()

    const widthRatio = currentWidth / toWidth
    const heightRatio = currentHeight / toHeight

    const zoomFactor = Math.min(widthRatio, heightRatio)
    
    // Apply the zoom (we need to revert the canvas position since the zoom is applied from the top-left corner of the canvas)
    window.ctx.translate(x, y) // Reset the canvas position
    window.ctx.scale(zoomFactor, zoomFactor) // Apply the zoom
    window.ctx.translate(-x, -y) // Apply again the canvas position
    
    // Update the zoom level
    window.cvs.zoom *= zoomFactor
    
    const {x2: newX2, y2: newY2} = getViewBox()
    const userX = window.cvs.x  // Current mouse position
    const userY = window.cvs.y
    const newUserX = userX/x2*newX2
    const newUserY = userY/y2*newY2

    // Update the canvas position
    window.cvs.x = newUserX
    window.cvs.y = newUserY
}