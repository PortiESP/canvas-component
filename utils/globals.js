import constants from "./constants"
import { getViewBox, resetZoom } from "./zoom"

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
    // Canvas context
    window.ctx = ctx
    // Canvas data
    window.cvs = new Canvas($canvas, ctx, debug)
}


export class Canvas{
    constructor($canvas, ctx, debug = false){

        // --- Debug mode ---
        this.debug = debug // Flag to indicate if the debug mode is enabled
        this.debugData = undefined // Function to that returns an array of strings to be printed on the canvas
        this.debugCommands = [
            {
                label: 'Close debug mode',
                callback: () => this.debug = false
            },
            {
                label: 'Reset zoom',
                callback: () => resetZoom()
            }
        ],
        this.debugCommandHover = null
        this.debugFunctions = {}

        // --- Mouse & Keyboard ---
        // Mouse coordinates in the canvas
        this.x = 0
        this.y = 0
        // Mouse state
        this.mouseDown = null // Button code of the pressed mouse button, if any (null otherwise)
        this.mouseMoveCallback = null
        this.mouseUpCallback = null
        this.mouseDownCallback = null
        this.mouseScrollCallback = null
        this.lastMouseDown = 0 // Timestamp of the last mouse down event (used to detect double clicks)
        this.doubleClick = false // Flag to indicate if a double click event was detected (set to true when a double click is detected by a mouse down event, and reset to false on the next mouse up event)
        this.draggingOrigin = null // Coordinates of the origin of the dragging action
        // Keyboard state
        this.key = null // The key code of the last pressed key, if any (null otherwise)
        this.keysDown = {} // Object to store the state of the keys (true if the key is pressed, false or undefined otherwise)
        this.keyDownCallback = null
        this.keyUpCallback = null

        // --- Canvas ---
        // Resize 
        this.resizeCallback = null
        this.autoResize = false
        // Drawing context
        this.ctx = ctx
        this.$canvas = $canvas

        // --- Pan & Zoom ---
        // Pan the canvas
        this.canvasPanOffset = { x: 0, y: 0 } // Coordinates of the canvas show at the top-left corner of the canvas
        this.panning = false // Flag to indicate if the user is panning the canvas
        // Zoom
        this.zoom = 1 // Zoom factor
        this.zoomLevel = constants.ZOOM_LEVELS.indexOf(1) // Zoom level (index of the zoom factor in the zoom levels array at the constants file)
    
    }

    
    
    /**
     * Clears the canvas by drawing a rectangle that covers the entire canvas area and an extra margin to avoid artifacts.
     */
    clean(){
        const coords = getViewBox()  // Get the coordinates of the view box
        const margin = constants.CLEAN_MARGIN  // Margin to clear the canvas and avoid artifacts
        this.ctx.clearRect(coords.x - margin, coords.y - margin, coords.width + margin * 2, coords.height + margin * 2)
    }
    
    
    
    /**
     * Prints information on the canvas when the debug mode is enabled.
     * 
     * @param {Array} data Array of strings to be printed on the canvas along with the default debug information.
     */
    drawDebugInfo(data){
        this.ctx.save()
        
        const zoom = this.zoom
    
        this.ctx.fillStyle = 'black'
        this.ctx.font = `${12 / zoom}px Arial`
        this.ctx.textAlign = 'right'
    
        // Default Debug info
        data = [
            `(${this.x})  - (${this.y})`,
            "Zoom: " + this.zoom,
            "Mouse down: " + this.mouseDown,
            "Dragging origin: " + (this.draggingOrigin ? `(${this.draggingOrigin.x}) - (${this.draggingOrigin.y})` : "None"),
            "Key: " + this.key,
            "Keys down: " + Object.keys(this.keysDown).filter(k => this.keysDown[k]).join('+') || "None",
            "Double click ready: " + (Date.now() - this.lastMouseDown < constants.DOUBLE_CLICK_DELAY ? 'Yes' : 'No'),
            "Canvas pan offset: (" + this.canvasPanOffset.x + ") - (" + this.canvasPanOffset.y + ")",
    
            // Custom debug data
            ...data
        ]
    
        // Canvas pan offset
        const panOffsetY = this.canvasPanOffset.y
        // Coords of the right side of the canvas minus a small margin of 10px
        const posX = getViewBox().x2 - 10 / zoom
    
        // Custom data
        for (let i = 0; i < data.length; i++) {
            const lineY = i * 14 / zoom
            const posY = 20 / zoom + lineY + panOffsetY
            ctx.fillText(data[i], posX, posY)
        }
    
        // Last line following coordinates
        const cmdsY = 20 / zoom + data.length * 14 / zoom + panOffsetY
        const cmdsH = 20 / zoom
    
    
        // Draw debug commands as small buttons
        let isHover = undefined
        for (let i = 0; i < this.debugCommands.length; i++) {
            const command = this.debugCommands[i]
            const cmdY = cmdsY + i * cmdsH * 1.2
            const textW = ctx.measureText(command.label).width
    
            // Draw the command label
            ctx.fillStyle = 'black'
            ctx.textAlign = "right"
            ctx.fillText(command.label, posX, cmdY + 12 / zoom)
    
            const btnX1 = posX - textW - 5 / zoom
            const btnX2 = posX + 5 / zoom
            const btnY1 = cmdY
            const btnY2 = cmdY + cmdsH
    
            // Draw the command button
            ctx.strokeStyle = 'black'
            ctx.fillStyle = '#8888'
            ctx.fillRect(btnX1, btnY1, textW + 10 / zoom, cmdsH)
    
            // Hover
            if (this.x > posX - textW - 5 / zoom && this.x < posX + 5 / zoom && this.y > cmdY && this.y < cmdY + cmdsH) {
                ctx.fillStyle = '#fff2'
                ctx.fillRect(posX - textW - 5 / zoom, cmdY, textW + 10 / zoom, cmdsH)
                isHover = command
            }
        }
    
        // Hover
        if (isHover) {
            this.debugCommandHover = isHover
        } else {
            this.debugCommandHover = null
        }
    
        // Custom funcs
        for (let f in this.debugFunctions) {
            this.debugFunctions[f]()
        }
    
        // Reset the style
        this.ctx.restore()
    }
}