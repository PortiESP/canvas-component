import constants from "./constants"
import { panBy } from "./pan"

export function zoomBy(zoomFactor){
    const {x, y, x2, y2} = getViewBox()
    const userXRatio = (window.cvs.x - x)/(x2-x)
    const userYRatio = (window.cvs.y - y)/(y2-y)
    const newZoom = window.cvs.zoom * zoomFactor

    // Apply the zoom (we need to revert the canvas position since the zoom is applied from the coord (0, 0) of the canvas)
    window.ctx.translate(x, y) // Reset the canvas position
    window.ctx.scale(zoomFactor, zoomFactor) // Apply the zoom
    window.ctx.translate(-x, -y) // Apply again the canvas position

    // Update the zoom level
    window.cvs.zoom = newZoom

    const {x: newX1, y: newY1, width, height} = getViewBox()
    const newUserX = userXRatio*width + newX1
    const newUserY = userYRatio*height + newY1

    // Update the canvas position
    window.cvs.x = newUserX
    window.cvs.y = newUserY
}

export function zoomTo(zoom){
    resetZoom()
    zoomBy(zoom)
}

/**
 * Resets the zoom of the graph to the default value (1).
 */
export function resetZoom(){
    zoomBy(1/window.cvs.zoom)
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
export function zoomAtMouse(zoomIn){
    // Determine the zoom factor
    const zoomFactor = zoomIn ? 1.1 : 0.9

    const {x, y, x2, y2} = getViewBox()
    const userXRatio = (window.cvs.x - x)/(x2-x)
    const userYRatio = (window.cvs.y - y)/(y2-y)

    // Zoom the graph
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
 * Zooms in the graph.
 */
export function zoomIn(){
    const {x, y} = window.cvs
    zoomAtMouse(true)
}


/**
 * Zooms out the graph.
 */
export function zoomOut(){
    const {x, y} = window.cvs
    zoomAtMouse(false)
}


export function zoomToFit(toWidth, toHeight){
    const {width: currentWidth, height: currentHeight} = getViewBox()

    const widthRatio = currentWidth / toWidth
    const heightRatio = currentHeight / toHeight

    const zoomFactor = Math.min(widthRatio, heightRatio)
    
    zoomBy(zoomFactor)
}
