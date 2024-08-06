import constants from "./constants"
import { getViewBox, resetZoom } from "./zoom"

/**
 * This class will create global variables and methods that will be used throughout the application.
 * 
 * **Properties**
 * 
 * ---
 * 
 * **Debug**
 * @property {Boolean} debug - Flag to indicate if the debug mode is enabled
 * @property {Function} debugData - Function to that returns an array of strings to be printed on the canvas
 * @property {Array} debugCommands - An array of objects containing the label and callback function of the debug button to be displayed on the canvas. This way we can add button that trigger a custom function.
 * @property {Object} debugCommandHover - The command that is being hovered by the mouse
 * @property {Object} debugFunctions - An object containing functions to be executed when the debug mode is enabled. This is useful to draw custom debug information, not just String but whole canvas drawings like overlays, etc.
 * 
 * **Mouse & Keyboard**
 * @property {Number} x - The x coordinate of the mouse cursor on the canvas (relative to the canvas)
 * @property {Number} y - The y coordinate of the mouse cursor on the canvas (relative to the canvas)
 * @property {Number} mouseDown - The button code of the pressed mouse button, if any (null otherwise)
 * @property {Number} lastMouseDown - The timestamp of the last mouse down event (used to detect double clicks)
 * @property {Boolean} doubleClick - A boolean flag indicating if a double click event was detected
 * @property {Object} draggingOrigin - The coordinates of the mouse at the moment the dragging action started
 * @property {Number} key - The key code of the pressed key, if any (null otherwise)
 * @property {Object} keysDown - An object to store the state of the keys
 * @property {Array} touches - An array to store the touch events (mobile)
 * @property {Object} touchesData - An object to store information about the touch events (used to calculate the distance between touches for the zoom effect, etc.)
 * 
 * **Canvas**
 * @property {Object} ctx - The canvas 2D context
 * @property {Object} $canvas - The canvas element
 * @property {Object} canvasPanOffset - An object containing the x and y coordinates of the canvas shown at the top-left corner of the canvas
 * @property {Boolean} panning - A boolean flag indicating if the user is panning the canvas
 * @property {Number} zoom - The zoom factor
 * @property {Boolean} hasBackground - A boolean flag indicating if the canvas has a background color
 * @property {String} background - The background color of the canvas
 * 
 * **Config**
 * @property {Boolean} autoResize - A boolean flag indicating whether the canvas should automatically resize to fit its parent container
 * 
 * **Callbacks**
 * @property {Function} mouseMoveCallback - A callback function to be executed when the mouse is moved
 * @property {Function} mouseUpCallback - A callback function to be executed when a mouse button is released
 * @property {Function} mouseDownCallback - A callback function to be executed when a mouse button is pressed
 * @property {Function} mouseScrollCallback - A callback function to be executed when the mouse wheel is scrolled
 * @property {Function} mouseDoubleClickCallback - A callback function to be executed when a mouse button is double clicked
 * @property {Function} keyDownCallback - A callback function to be executed when a key is pressed
 * @property {Function} keyUpCallback - A callback function to be executed when a key is released
 * @property {Function} resizeCallback - A callback function to be executed when the window is resized
 * 
 * **Methods**
 * 
 * ---
 * 
 * @method clean - Clears the canvas by drawing a rectangle that covers the entire canvas area and an extra margin to avoid artifacts.
 * @method drawDebugInfo - Prints information on the canvas when the debug mode is enabled.
 */
export class CanvasGlobals {
    constructor($canvas, ctx, debug = false) {
        // Setup the global variable
        window.cvs = this

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
        this._x = 0
        this._y = 0
        // Mouse state
        this._mouseDown = null // Button code of the pressed mouse button, if any (null otherwise)
        this._mouseMoveCallback = null
        this._mouseUpCallback = null
        this._mouseDownCallback = null
        this._mouseScrollCallback = null
        this._lastMouseDown = 0 // Timestamp of the last mouse down event (used to detect double clicks)
        this._doubleClick = false // Flag to indicate if a double click event was detected (set to true when a double click is detected by a mouse down event, and reset to false on the next mouse up event)
        this._mouseDoubleClickCallback = null
        this._draggingOrigin = null // Coordinates of the origin of the dragging action
        this.touches = [] // Array to store the touch events (mobile)
        this.touchesData = {} // Object to store the touch data
        // Keyboard state
        this._key = null // The key code of the last pressed key, if any (null otherwise)
        this._keysDown = {} // Object to store the state of the keys (true if the key is pressed, false or undefined otherwise)
        this._keyDownCallback = null
        this._keyUpCallback = null

        // --- Canvas ---
        // Resize 
        this._resizeCallback = null
        this._autoResize = false
        this._hasBackground = false
        this._background = constants.BACKGROUND_COLOR

        // Drawing context
        this._ctx = ctx
        this._$canvas = $canvas

        // --- Pan & Zoom ---
        // Pan the canvas
        this._canvasPanOffset = { x: 0, y: 0 } // Coordinates of the canvas show at the top-left corner of the canvas
        this._panning = false // Flag to indicate if the user is panning the canvas
        // Zoom
        this._zoom = 1 // Zoom factor

    }


    /**
     * Clears the canvas by drawing a rectangle that covers the entire canvas area and an extra margin to avoid artifacts.
     */
    clean() {
        const coords = getViewBox()  // Get the coordinates of the view box
        const margin = constants.CLEAN_MARGIN  // Margin to clear the canvas and avoid artifacts

        if (!this.hasBackground) this.ctx.clearRect(coords.x - margin, coords.y - margin, coords.width + margin * 2, coords.height + margin * 2)
        else {
            this.ctx.save()
            this.ctx.fillStyle = this.background
            this.ctx.fillRect(coords.x - margin, coords.y - margin, coords.width + margin * 2, coords.height + margin * 2)
            this.ctx.restore()
        }   
    }


    /**
     * Prints information on the canvas when the debug mode is enabled.
     * 
     * @param {Array} data Array of strings to be printed on the canvas along with the default debug information.
     */
    drawDebugInfo(data) {
        this.ctx.save()

        const menuPos = { x: 300, y: 50 }

        const zoom = this.zoom

        this.ctx.fillStyle = 'black'
        this.ctx.font = `${12 / zoom}px Arial`
        this.ctx.textAlign = 'right'

        // Debug info
        data = [
            // Default Debug info
            `(${this.x.toFixed(2)})  - (${this.y.toFixed(2)})`,
            "Zoom: " + this.zoom.toFixed(3),
            "Mouse down: " + this.mouseDown,
            "Dragging origin: " + (this.draggingOrigin ? `(${this.draggingOrigin.x.toFixed(2)}) - (${this.draggingOrigin.y.toFixed(2)})` : "None"),
            "Key: " + this.key,
            "Keys down: " + Object.keys(this.keysDown).filter(k => this.keysDown[k]).join('+') || "None",
            "Double click ready: " + (Date.now() - this.lastMouseDown < constants.DOUBLE_CLICK_DELAY ? 'Yes' : 'No'),
            "Canvas pan offset: (" + this.canvasPanOffset.x.toFixed(2) + ") - (" + this.canvasPanOffset.y.toFixed(2) + ")",
            `Touch zoom: ${this.touchesData.zoomEnabled ? "Yes": "No"}`,

            // Additional debug info
            ...data
        ]

        // Canvas pan offset
        const panOffsetY = this.canvasPanOffset.y
        // Coords of the right side of the canvas minus a small margin of 10px
        const posX = getViewBox().x2 - menuPos.x / zoom

        // Custom data
        for (let i = 0; i < data.length; i++) {
            const lineY = i * 14 / zoom
            const posY = menuPos.y / zoom + lineY + panOffsetY
            ctx.fillText(data[i], posX, posY)
        }

        // Last line following coordinates
        const cmdsY = menuPos.y / zoom + data.length * 14 / zoom + panOffsetY
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
            const btnY1 = cmdY

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

        // Store the command that is being hovered
        if (isHover) this.debugCommandHover = isHover
        else this.debugCommandHover = null

        // Call the debug functions
        for (let f in this.debugFunctions) this.debugFunctions[f]()
        this.debugFunctions = {}	

        // Touches
        this.touches.forEach((touch, i) => {
            this.ctx.fillStyle = "#f008"
            this.ctx.beginPath()
            this.ctx.arc(touch.x, touch.y, 25, 0, 2 * Math.PI)
            this.ctx.fillText(touch.id, touch.x+3, touch.y+40)
            this.ctx.fill()
        })

        // Reset the style
        this.ctx.restore()
    }


    // --- Getters & Setters ---

    get x() { return this._x; }
    set x(value) { this._x = value; }

    get y() { return this._y; }
    set y(value) { this._y = value; }

    get mouseDown() { return this._mouseDown; }
    set mouseDown(value) { this._mouseDown = value; }

    get mouseMoveCallback() { return this._mouseMoveCallback; }
    set mouseMoveCallback(value) { this._mouseMoveCallback = value; }

    get mouseUpCallback() { return this._mouseUpCallback; }
    set mouseUpCallback(value) { this._mouseUpCallback = value; }

    get mouseDownCallback() { return this._mouseDownCallback; }
    set mouseDownCallback(value) { this._mouseDownCallback = value; }

    get mouseScrollCallback() { return this._mouseScrollCallback; }
    set mouseScrollCallback(value) { this._mouseScrollCallback = value; }

    get lastMouseDown() { return this._lastMouseDown; }
    set lastMouseDown(value) { this._lastMouseDown = value; }

    get doubleClick() { return this._doubleClick; }
    set doubleClick(value) { this._doubleClick = value; }

    get mouseDoubleClickCallback() { return this._mouseDoubleClickCallback; }
    set mouseDoubleClickCallback(value) { this._mouseDoubleClickCallback = value; }

    get draggingOrigin() { return this._draggingOrigin; }
    set draggingOrigin(value) { this._draggingOrigin = value; }

    get key() { return this._key; }
    set key(value) { this._key = value; }

    get keysDown() { return this._keysDown; }
    set keysDown(value) { this._keysDown = value; }

    get keyDownCallback() { return this._keyDownCallback; }
    set keyDownCallback(value) { this._keyDownCallback = value; }

    get keyUpCallback() { return this._keyUpCallback; }
    set keyUpCallback(value) { this._keyUpCallback = value; }

    get resizeCallback() { return this._resizeCallback; }
    set resizeCallback(value) { this._resizeCallback = value; }

    get autoResize() { return this._autoResize; }
    set autoResize(value) { this._autoResize = value; }

    get hasBackground() { return this._hasBackground; }
    set hasBackground(value) { this._hasBackground = value; }

    get background() { return this._background; }
    set background(value) { this._background = value; }

    get ctx() { return this._ctx; }
    set ctx(value) { this._ctx = value; }

    get $canvas() { return this._$canvas; }
    set $canvas(value) { this._$canvas = value; }

    get canvasPanOffset() { return this._canvasPanOffset; }
    set canvasPanOffset(value) { this._canvasPanOffset = value; }

    get panning() { return this._panning; }
    set panning(value) { this._panning = value; }

    get zoom() { return this._zoom }
    set zoom(value) {
        this._zoom = value
        window.ui.call("setZoomLabel", value)
    }
}