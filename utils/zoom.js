import { panBy } from "./pan"

/**
 * Zooms the canvas by a given factor. 
 * 
 * The zoom is applied relative to the current zoom level. e.g. if the current zoom level is 2 and the zoom factor is 2, the new zoom level will be 4.
 * 
 * @param {Number} zoomFactor The factor by which the canvas should be zoomed relative to the current zoom level.
 */
export function zoomBy(zoomFactor){
    const {x, y, x2, y2} = getViewBox()

    // Calculate the position of the mouse relative to the canvas HTML element currently in the view (let's say the mouse is at the center, then this value will be 0.5, if it's at the most right, it will be 1, etc.)
    const userXRatio = (window.cvs.x - x)/(x2-x)  // Ratio of the user's x position relative to the visible canvas
    const userYRatio = (window.cvs.y - y)/(y2-y)  // Ratio of the user's y position relative to the visible canvas

    // Apply the zoom (we need to revert the canvas position since the zoom is applied from the coord (0, 0) of the canvas)
    window.ctx.translate(x, y) // Reset the canvas position
    window.ctx.scale(zoomFactor, zoomFactor) // Apply the zoom
    window.ctx.translate(-x, -y) // Apply again the canvas position

    // Update the zoom level
    window.cvs.zoom = window.cvs.zoom * zoomFactor

    // Calculate the new position of the user mouse after the zoom
    const {x: newX1, y: newY1, width, height} = getViewBox()
    window.cvs.x = userXRatio*width + newX1
    window.cvs.y = userYRatio*height + newY1
}


/**
 * Resets the zoom of the canvas to the default value (1).
 */
export function resetZoom(){
    zoomBy(1/window.cvs.zoom)
}


/**
 * Sets the zoom level of the canvas to a specific value.
 * 
 * Unlike `zoomBy`, this function sets the zoom level to an absolute value. e.g. if the current zoom level is 2 and the zoom level is set to 2, the new zoom level will be 2.
 * 
 * @param {Number} zoom Zoom level to set the canvas to.
 */
export function zoomTo(zoom){
    resetZoom()  // Reset the zoom to 1
    zoomBy(zoom) // Apply the zoom
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
 * Zooms in or out at the current mouse position
 * 
 * @param {Boolean} zoomIn - Whether to zoom in or out. If true, zooms in, otherwise zooms out.
 */
export function zoomAtMouse(zoomIn){
    // Determine the zoom factor
    const zoomFactor = zoomIn ? 1.1 : 0.9

    const {x, y, x2, y2} = getViewBox()
    const userXRatio = (window.cvs.x - x)/(x2-x)
    const userYRatio = (window.cvs.y - y)/(y2-y)

    // Zoom the canvas
    zoomBy(zoomFactor)

    // Pan towards the mouse position
    if (zoomIn){
        const {width, height} = getViewBox()
        const userX = userXRatio*width/10
        const userY = userYRatio*height/10
        panBy(-userX, -userY)
    }
    // Pan towards the center of the canvas
    else {
        const {width, height} = getViewBox()
        const userX = 0.5*width/10
        const userY = 0.5*height/10
        panBy(userX, userY)
    }

}


/**
 * Zooms in the canvas at the current mouse position.
 */
export function zoomIn(){
    zoomAtMouse(true)
}


/**
 * Zooms out the canvas at the current mouse position.
 */
export function zoomOut(){
    zoomAtMouse(false)
}

/**
 * Zooms the canvas to fit the given dimensions.
 * 
 * @param {Number} toWidth The distance that the canvas should fit in the x-axis
 * @param {Number} toHeight The distance that the canvas should fit in the y-axis
 */
export function zoomToFit(toWidth, toHeight){
    const {width: currentWidth, height: currentHeight} = getViewBox()

    // Calculate the ratio of the current dimensions to the desired dimensions
    const widthRatio = currentWidth / toWidth
    const heightRatio = currentHeight / toHeight

    // Zoom by the smallest ratio to ensure that the canvas fits both dimensions
    const zoomFactor = Math.min(widthRatio, heightRatio)
    
    // Apply the zoom
    zoomBy(zoomFactor)
}
