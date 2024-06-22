
import constants from "./constants"
import { resetZoom } from "../../canvas/utils/zoom"

/**
 * 
 * This function will create global variables and methods that will be used throughout the application.
 * 
 * The global variables are:
 * - `ctx`: The canvas 2D context
 * - `cvs`: An object containing the following properties and methods related to the canvas:
 *      - Properties:
 *          - DEBUG MODE
 *              - `debug`: A boolean flag indicating whether the debug mode is enabled
 *              - `debugData`: A function that returns an array of strings to be printed on the canvas as debug info: `() => ["string1", "string2", ...]`
 *              - `debugCommands`: An array of objects containing the label and callback function of the debug button to be displayed on the canvas. This way we can add button that trigger a custom function.
 *              - `debugCommandHover`: The command that is being hovered by the mouse
 *              - `debugFunctions`: An object containing functions to be executed when the debug mode is enabled. This is useful to draw custom debug information, not just String but whole canvas drawings like overlays, etc.
 *          - MOUSE & KEYBOARD
 *              - `x`: The x coordinate of the mouse cursor on the canvas (relative to the canvas)
 *              - `y`: The y coordinate of the mouse cursor on the canvas (relative to the canvas)
 *              - `mouseDown`: The button code of the pressed mouse button, if any (null otherwise)
 *              - `lastMouseDown`: The timestamp of the last mouse down event (used to detect double clicks)
 *              - `key`: The key code of the pressed key, if any (null otherwise)
 *              - `keysDown`: An object to store the state of the keys
 *              - `draggingOrigin`: The coordinates of the mouse at the moment the dragging action started
 *          - CANVAS
 *              - `ctx`: The canvas 2D context
 *              - `$canvas`: The canvas element
 *              - `canvasBoundingBox`: The bounding box of the canvas element
 *              - `canvasPanOffset`: An object containing the x and y coordinates of the canvas shown at the top-left corner of the canvas
 *              - `zoom`: The zoom factor
 *              - `zoomLevel`: The zoom level (index of the zoom factor in the zoom levels array at the constants file)
 *          - CONFIG
 *              - `autoResize`: A boolean flag indicating whether the canvas should automatically resize to fit its parent container
 *  
 *     - Callbacks: (this functions receives the following callbacks as arguments: (e, {x, y}), where `e` is the event object and `{x, y}` are the mouse coordinates at the time of the event)
 *          - `mouseMoveCallback(e, {x, y})`: A callback function to be executed when the mouse is moved
 *          - `mouseDownCallback(button, {x, y})`: A callback function to be executed when a mouse button is pressed
 *          - `mouseUpCallback(button, {x, y})`: A callback function to be executed when a mouse button is released
 *          - `mouseScrollCallback(deltaY, {x, y})`: A callback function to be executed when the mouse wheel is scrolled
 *          - `keyDownCallback(key, {x, y})`: A callback function to be executed when a key is pressed
 *          - `keyUpCallback(key, {x, y})`: A callback function to be executed when a key is released
 *          - `resizeCallback(e)`: A callback function to be executed when the window is resized
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
        // --- Debug mode ---
        debug,
        debugData: undefined, // Function to that returns an array of strings to be printed on the canvas
        debugCommands: [
            {
                label: 'Close debug mode',
                callback: () => window.cvs.debug = false
            },
            {
                label: 'Reset zoom',
                callback: () => resetZoom()
            }
        ],
        debugCommandHover: null,
        debugFunctions: {},

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
        doubleClick: false, // Flag to indicate if a double click event was detected (set to true when a double click is detected by a mouse down event, and reset to false on the next mouse up event)
        draggingOrigin: null, // Coordinates of the origin of the dragging action

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

        // Pan the canvas
        canvasPanOffset: { x: 0, y: 0 }, // Coordinates of the canvas show at the top-left corner of the canvas

        // Zoom
        zoom: 1, // Zoom factor
        zoomLevel: constants.ZOOM_LEVELS.indexOf(1), // Zoom level (index of the zoom factor in the zoom levels array at the constants file)
    }
}