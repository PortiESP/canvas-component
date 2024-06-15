
/**
 * 
 * This function will create global variables and methods that will be used throughout the application.
 * 
 * The global variables are:
 * - `ctx`: The canvas 2D context
 * - `cvs`: An object containing the following properties and methods related to the canvas:
 *      Properties:
 *          - `x`: The x coordinate of the mouse cursor on the canvas (relative to the canvas)
 *          - `y`: The y coordinate of the mouse cursor on the canvas (relative to the canvas)
 *          - `ctx`: The canvas 2D context
 *          - `$canvas`: The canvas element
 *          - `width`: The width of the canvas
 *          - `height`: The height of the canvas
 *          - `debug`: A boolean flag indicating whether the debug mode is enabled
 *          - `mouseDown`: The button code of the pressed mouse button, if any (null otherwise)
 *          - `lastMouseDown`: The timestamp of the last mouse down event (used to detect double clicks)
 *          - `key`: The key code of the pressed key, if any (null otherwise)
 *          - `autoResize`: A boolean flag indicating whether the canvas should automatically resize to fit its parent container
 *  
 *     Callbacks:
 *          - `mouseMoveCallback`: A callback function to be executed when the mouse is moved
 *          - `mouseDownCallback`: A callback function to be executed when a mouse button is pressed
 *          - `mouseUpCallback`: A callback function to be executed when a mouse button is released
 *          - `scrollCallback`: A callback function to be executed when the mouse wheel is scrolled
 *          - `keyDownCallback`: A callback function to be executed when a key is pressed
 *          - `keyUpCallback`: A callback function to be executed when a key is released
 *          - `resizeCallback`: A callback function to be executed when the window is resized
 * 
 *      Methods:
 *          - `clear()`: Clears the canvas
 *          - `drawDebugInfo(Array)`: Draws debug information on the canvas
 * 
 * @param {HTMLElement} $canvas Canvas element in the DOM
 * @param {CanvasRenderingContext2D} ctx Canvas 2D context (retrieved from the canvas element using `.getContext('2d')`)
 */

import constants from "../../graph-manager/utils/constants"

export default function setupGlobals($canvas, ctx, debug = false) {
    // Define the global variables initial values
    
    // Canvas context
    window.ctx = ctx
    // Canvas data
    window.cvs = {
        // Debug mode
        debug,

        // User coordinates
        x: 0,
        y: 0,

        // Canvas coordinates
        canvasBoundingBox: $canvas.getBoundingClientRect(),

        // Mouse state
        mouseMoveCallback: null,
        mouseDown: null, // Button code of the pressed mouse button, if any (null otherwise)
        mouseDownCallback: null,
        mouseUpCallback: null,
        scrollCallback: null,
        lastMouseDown: 0, // Timestamp of the last mouse down event (used to detect double clicks)

        // Keyboard state
        key: null, // The key code of the last pressed key, if any (null otherwise)
        keysDown: {}, // Object to store the state of the keys
        keyDownCallback: null,
        keyUpCallback: null,

        // Resize 
        resizeCallback: null,
        autoResize: false,
        
        // Drawing context
        ctx: ctx,
        $canvas: $canvas,
    }

    // METHODS
    // Clear the canvas
    window.cvs.clear = () => {
        window.ctx.clearRect(0, 0, $canvas.width, $canvas.height)
    }

    // Print debug info
    window.cvs.drawDebugInfo = (data) => {
        window.ctx.fillStyle = 'black'
        window.ctx.font = '12px Arial'
        window.ctx.textAlign = 'right'

        // Debug info
        data = [
            window.cvs.x + ' - ' + window.cvs.y,
            "Mouse down: " + window.cvs.mouseDown,
            "Key: " + window.cvs.key,
            "Keys down: " + Object.keys(window.cvs.keysDown).filter(k => window.cvs.keysDown[k]).join('+') || "None",
            "Double click ready: " + (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY ? 'Yes' : 'No'),
            ...data
        ]

        // Custom data
        for (let i = 0; i < data.length; i++) {
            ctx.fillText(data[i], window.cvs.$canvas.width - 10, 20 + i * 14)
        }

        // Reset the style
        ctx.textAlign = 'left'
    }
}