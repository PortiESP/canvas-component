
import constants from "../../graph-manager/utils/constants"
import { getViewBox } from "../../graph-manager/utils/zoom"

/**
 * 
 * This function will create global variables and methods that will be used throughout the application.
 * 
 * The global variables are:
 * - `ctx`: The canvas 2D context
 * - `cvs`: An object containing the following properties and methods related to the canvas:
 *      Properties:
 *          - `debug`: A boolean flag indicating whether the debug mode is enabled
 *          - `x`: The x coordinate of the mouse cursor on the canvas (relative to the canvas)
 *          - `y`: The y coordinate of the mouse cursor on the canvas (relative to the canvas)
 *          - `mouseDown`: The button code of the pressed mouse button, if any (null otherwise)
 *          - `lastMouseDown`: The timestamp of the last mouse down event (used to detect double clicks)
 *          - `key`: The key code of the pressed key, if any (null otherwise)
 *          - `keysDown`: An object to store the state of the keys
 *          - `autoResize`: A boolean flag indicating whether the canvas should automatically resize to fit its parent container
 *          - `ctx`: The canvas 2D context
 *          - `$canvas`: The canvas element
 *          - `canvasBoundingBox`: The bounding box of the canvas element
 *  
 *     Callbacks: (this function receives the following callbacks as arguments: (e, {x, y}), where `e` is the event object and `{x, y}` are the mouse coordinates at the time of the event)
 *          - `mouseMoveCallback`: A callback function to be executed when the mouse is moved
 *          - `mouseDownCallback`: A callback function to be executed when a mouse button is pressed
 *          - `mouseUpCallback`: A callback function to be executed when a mouse button is released
 *          - `mouseScrollCallback`: A callback function to be executed when the mouse wheel is scrolled
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
export default function setupGlobals($canvas, ctx, debug = false) {
    // Define the global variables initial values
    
    // Canvas context
    window.ctx = ctx
    // Canvas data
    window.cvs = {
        // Debug mode
        debug,

        // Mouse coordinates in the canvas
        x: 0,
        y: 0,

        // Canvas x and y coordinates and dimensions
        canvasBoundingBox: $canvas.getBoundingClientRect(),
        
        // Mouse state
        mouseDown: null, // Button code of the pressed mouse button, if any (null otherwise)
        mouseMoveCallback: null,
        mouseUpCallback: null,
        mouseDownCallback: null,
        mouseScrollCallback: null,
        lastMouseDown: 0, // Timestamp of the last mouse down event (used to detect double clicks)

        // Keyboard state
        key: null, // The key code of the last pressed key, if any (null otherwise)
        keysDown: {}, // Object to store the state of the keys (true if the key is pressed, false or undefined otherwise)
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
        const coords = getViewBox()  // Get the coordinates of the view box
        const margin = constants.CLEAN_MARGIN  // Margin to clear the canvas and avoid artifacts
        window.ctx.clearRect(coords.x - margin, coords.y - margin, coords.width + margin*2, coords.height + margin*2)
    }

    // Prints debug information on the canvas. The data parameter is an array of strings to be printed as well.
    window.cvs.drawDebugInfo = (data) => {
        const zoom = window.graph.zoom

        window.ctx.fillStyle = 'black'
        window.ctx.font = `${12/zoom}px Arial`
        window.ctx.textAlign = 'right'

        // Default Debug info
        data = [
            `(${window.cvs.x})  - (${window.cvs.y})`,
            "Mouse down: " + window.cvs.mouseDown,
            "Key: " + window.cvs.key,
            "Keys down: " + Object.keys(window.cvs.keysDown).filter(k => window.cvs.keysDown[k]).join('+') || "None",
            "Double click ready: " + (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY ? 'Yes' : 'No'),
            ...data
        ]

        // Canvas drag offset
        const dragOffsetY = window.graph.canvasDragOffset.y
        // Coords of the right side of the canvas minus a small margin of 10px
        const posX = getViewBox().x2 - 10

        // Custom data
        for (let i = 0; i < data.length; i++) {
            const lineY = i * 14 / zoom
            const posY = 20 + lineY + dragOffsetY
            ctx.fillText(data[i], posX, posY)
        }

        // Reset the style
        ctx.textAlign = 'left'
    }
}