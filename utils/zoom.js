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
    const {x, y} = window.cvs.canvasDragOffset
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
    const dy = -(width*zoomFactor - width)/2

    // Apply the zoom (we need to revert the canvas position since the zoom is applied from the top-left corner of the canvas)
    window.ctx.translate(x, y) // Reset the canvas position
    window.ctx.scale(zoomFactor, zoomFactor) // Apply the zoom
    window.ctx.translate(-x, -y) // Apply again the canvas position
    window.ctx.translate(dx,dy)  // Apply the padding

    // Update the canvas drag offset
    window.cvs.canvasDragOffset.x -= dx
    window.cvs.canvasDragOffset.y -= dy
    
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