import { handleKeyDown, handleKeyUp, handleMouseMove, handleMouseUp, handleResize, handleTouchEnd, handleTouchMove } from "./event-handlers"
import { CanvasGlobals } from "./globals"

/**
 * Setup the initial configuration of the canvas and the global variables
 *      - This function already does the setup of the canvas and the global variables
 * 
 * The callback function will be called after the canvas is ready and the global variables created. The callback function will be called with no arguments.
 * 
 * Use the callback function define the initial state of the application and the event callbacks.
 * @See {@link globals.js} for more information about the global variables
 * 
 * @param {Function} callback The function to be called after the canvas is ready
 * @param {Boolean} debug Whether to enable the debug mode or not
 */
export function setupCanvas(debug = false) {
    // Setup canvas
    const $canvas = document.getElementById('canvas')
    const ctx = $canvas.getContext('2d')

    // Set canvas size
    const parent = $canvas.parentElement.getBoundingClientRect()
    $canvas.width = parent.width
    $canvas.height = parent.height

    // Setup globals
    window.ctx = ctx
    window.cvs = new CanvasGlobals($canvas, ctx, debug)
    setupAfterCanvas()
}

// The following event listeners weren't added using JSX because the canvas element didn't allow to define the event listeners in the JSX code, 
// So it was necessary to add the event listeners in the useLayoutEffect hook.
function setupAfterCanvas() {
    const $canvas = document.getElementById('canvas')
    // $canvas.tabIndex = 1000
    $canvas.autofocus = true
    $canvas.style.outline = 'none'
    $canvas.focus()

    handleResize()  // Set the initial canvas size

    // Add the event listeners
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('resize', handleResize)
    $canvas.addEventListener('keydown', handleKeyDown)
    $canvas.addEventListener('keyup', handleKeyUp)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
}


export function unmountCanvas() {
    // Remove the event listeners
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('resize', handleResize)
    window.cvs.$canvas.removeEventListener('keydown', handleKeyDown)
    window.cvs.$canvas.removeEventListener('keyup', handleKeyUp)

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('touchmove', handleTouchMove)
}

/**
 * Runs the main loop of the application. This function will be called only once and will call the callback function on every frame.
 *      - This function will clean the canvas on every frame
 *      - The callback function will be called with no arguments
 *      - The function already does the requestAnimationFrame loop call
 * 
 * @param {Function} callback The function to be called on every frame
 */
export function mainLoop(callback) {
    // =========== Main drawing loop ===========
    const loop = () => {
        // Clean the canvas
        window.cvs.clean()

        // Draw all nodes
        callback()

        // Request the next frame
        requestAnimationFrame(loop)
    }

    // Start the loop
    loop()
}