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
}

/**
 * Runs the main loop of the application. This function will be called only once and will call the callback function on every frame.
 *      - This function will clean the canvas on every frame
 *      - The callback function will be called with no arguments
 *      - The function already does the requestAnimationFrame loop call
 * 
 * @param {Function} callback The function to be called on every frame
 */
export function mainLoop (callback){
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