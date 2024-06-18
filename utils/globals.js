
import constants from "./constants"
import { getViewBox, resetZoom, zoomBy, zoomTo } from "../../canvas/utils/zoom"

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
 *          - `canvasPanOffset`: An object containing the x and y coordinates of the canvas shown at the top-left corner of the canvas
 *          - `zoom`: The zoom factor
 *          - `zoomLevel`: The zoom level (index of the zoom factor in the zoom levels array at the constants file)
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

    // METHODS
    // Clear the canvas
    window.cvs.clear = () => {
        const coords = getViewBox()  // Get the coordinates of the view box
        const margin = constants.CLEAN_MARGIN  // Margin to clear the canvas and avoid artifacts
        window.ctx.clearRect(coords.x - margin, coords.y - margin, coords.width + margin*2, coords.height + margin*2)
    }

    // Prints debug information on the canvas. The data parameter is an array of strings to be printed as well.
    window.cvs.drawDebugInfo = (data) => {
        const zoom = window.cvs.zoom

        window.ctx.fillStyle = 'black'
        window.ctx.font = `${12/zoom}px Arial`
        window.ctx.textAlign = 'right'

        // Default Debug info
        data = [
            `(${window.cvs.x})  - (${window.cvs.y})`,
            "Zoom: " + window.cvs.zoom,
            "Mouse down: " + window.cvs.mouseDown,
            "Dragging origin: " + (window.cvs.draggingOrigin ? `(${window.cvs.draggingOrigin.x}) - (${window.cvs.draggingOrigin.y})` : "None"),
            "Key: " + window.cvs.key,
            "Keys down: " + Object.keys(window.cvs.keysDown).filter(k => window.cvs.keysDown[k]).join('+') || "None",
            "Double click ready: " + (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY ? 'Yes' : 'No'),
            "Canvas pan offset: (" + window.cvs.canvasPanOffset.x + ") - (" + window.cvs.canvasPanOffset.y + ")",
            ...data
        ]

        // Canvas pan offset
        const panOffsetY = window.cvs.canvasPanOffset.y
        // Coords of the right side of the canvas minus a small margin of 10px
        const posX = getViewBox().x2 - 10/zoom

        // Custom data
        for (let i = 0; i < data.length; i++) {
            const lineY = i * 14/zoom
            const posY = 20/zoom + lineY + panOffsetY
            ctx.fillText(data[i], posX, posY)
        }

        // Last line following coordinates
        const cmdsY = 20/zoom + data.length * 14/zoom + panOffsetY
        const cmdsX = posX 
        const cmdsH = 20/zoom


        // Draw debug commands as small buttons
        let isHover = undefined
        for (let i = 0; i < window.cvs.debugCommands.length; i++) {
            const command = window.cvs.debugCommands[i]
            const cmdY = cmdsY + i * cmdsH *1.2
            const textW = ctx.measureText(command.label).width

            // Draw the command label
            ctx.fillStyle = 'black'
            ctx.textAlign = "right"
            ctx.fillText(command.label, posX, cmdY + 12/zoom)

            const btnX1 = posX - textW - 5/zoom
            const btnX2 = posX + 5/zoom
            const btnY1 = cmdY
            const btnY2 = cmdY + cmdsH

            // Draw the command button
            ctx.strokeStyle = 'black'
            ctx.fillStyle = '#8888'
            ctx.fillRect(btnX1, btnY1, textW + 10/zoom, cmdsH)

            // Hover
            if (window.cvs.x > posX - textW - 5/zoom && window.cvs.x < posX + 5/zoom && window.cvs.y > cmdY && window.cvs.y < cmdY + cmdsH) {
                ctx.fillStyle = '#fff2'
                ctx.fillRect(posX - textW - 5/zoom, cmdY, textW + 10/zoom, cmdsH)
                isHover = command
            }
        }

        // Hover
        if (isHover) {
            window.cvs.debugCommandHover = isHover
        } else {
            window.cvs.debugCommandHover = null
        }

        // Reset the style
        ctx.textAlign = 'left'
    }
}