import { useLayoutEffect } from "react"
import constants from "./utils/constants"
import { zoomIn, zoomOut } from "./utils/zoom"
import { isPanning, panBy } from "./utils/pan"

/**
 * This component represents the canvas element in the DOM. The component will handle the events related to the canvas and will store the values read from the events in the global variables.
 *      
 * - Every callback functions receive the event related to the action and the mouse coordinates at the moment of the action. `callback(event, {x, y})`
 * 
 * Most of the events will run a default action, like preventing the default behavior of the event, and then call the callback function if it is defined. 
 * The callbacks are defined in the global variables and can be changed at any time. This callback functions as supposed to be defined in `setupCanvas` function as explained in README basic example.
 * 
 * @See the `globals.js` file for more information about the available global variables.
 * @returns The canvas element using JSX
 */
export default function Canvas() {

    // ================================ Event Handlers ================================

    // --- Mouse Events ---

    const handleMouseMove = (e) => {
        // Calculate the mouse coordinates relative to the canvas
        const rect = window.cvs.canvasBoundingBox

        // Position of the mouse relative to the canvas
        const pointerX = (e.clientX - rect.left)
        const pointerY = (e.clientY - rect.top)
        // Compensate the canvas pan
        const panOffsetX = window.cvs.canvasPanOffset.x
        const panOffsetY = window.cvs.canvasPanOffset.y
        // Adjust the pointer coordinates based on the zoom level and the canvas pan
        window.cvs.x = pointerX/window.cvs.zoom + panOffsetX
        window.cvs.y = pointerY/window.cvs.zoom + panOffsetY

        // Adjust the mouse speed based on the zoom level (this method is used in the callbacks to adjust to read mouse movements)
        e.movementX /= window.cvs.zoom
        e.movementY /= window.cvs.zoom

        // --- Default actions ---
        // Pan the canvas
        if (isPanning()) {
            panBy(e.movementX, e.movementY)

            return true
        }

        // --- Callbacks ---
        if (window.cvs.mouseMoveCallback) window.cvs.mouseMoveCallback(e, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleMouseDown = (e) => {
        e.preventDefault()
        const button = e.button
        window.cvs.mouseDown = button
        window.cvs.draggingOrigin = {x: window.cvs.x, y: window.cvs.y}

        // --- Debug mode ---
        if (window.cvs.debug) {
            console.log('Mouse down:', button)

            // Check if any debug command was triggered
            if (button === 0 && window.cvs.debugCommandHover){
                window.cvs.debugCommandHover.callback()
                return true
            }
        }

        // --- Default actions ---
        // Check pan
        if (isPanning()) {
            document.body.style.cursor = "grabbing"
            return true
        }
        
        // --- Callbacks ---
        // Check double click
        if (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY) {
            window.cvs.lastMouseDown = Date.now()
            window.cvs.doubleClick = true
            if (window.cvs.mouseDoubleClickCallback) window.cvs.mouseDoubleClickCallback(button, {x: window.cvs.x, y: window.cvs.y})
            return true
        } else window.cvs.lastMouseDown = Date.now()

        // Single click
        if (window.cvs.mouseDownCallback) window.cvs.mouseDownCallback(button, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleMouseUp = (e) => {
        e.preventDefault()
        const button = e.button
        if (window.cvs.debug) console.log('Mouse up:', button)

        window.cvs.mouseDown = null
        window.cvs.doubleClick = false
        window.cvs.draggingOrigin = null

        // --- Default actions ---
        if (window.cvs.keysDown[constants.PAN_KEY]) {
            document.body.style.cursor = "grab"
            return true
        }
        // Release the pan key
        if (button === 1) {
            document.body.style.cursor = "default"
            return true
        }

        // --- Callbacks ---
        if (window.cvs.mouseUpCallback) window.cvs.mouseUpCallback(button, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleScroll = (e) => {
        const deltaY = e.deltaY
        if (window.cvs.debug) console.log('Scroll:', deltaY)

        // --- Default actions ---
        // Zoom in and out
        if (deltaY < 0) zoomIn()
        else if (deltaY > 0) zoomOut()

        // --- Callbacks ---
        if (window.cvs.mouseScrollCallback) window.cvs.mouseScrollCallback(deltaY, {x: window.cvs.x, y: window.cvs.y})
    }

    // --- Keyboard Events ---

    const handleKeyDown = (e) => {
        e.preventDefault()
        const code = e.code
        if (window.cvs.debug) console.log('Key down:', code)

        // Store the key pressed
        window.cvs.key = code
        window.cvs.keysDown[code] = true

        // --- Default shortcuts ---
        // Pan the canvas
        if (code === constants.PAN_KEY) {
            if (document.body.style.cursor !== "grabbing") document.body.style.cursor = "grab"
            return true
        }

        // --- Any other key ---
        if (window.cvs.keyDownCallback) window.cvs.keyDownCallback(code, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleKeyUp = (e) => {
        e.preventDefault()
        const code = e.code
        if (window.cvs.debug) console.log('Key up:', code)

        window.cvs.key = null
        window.cvs.keysDown[code] = false

        // --- Default shortcuts ---
        // Pan the canvas
        if (code === constants.PAN_KEY) {
            document.body.style.cursor = "default"
            return true
        }

        // --- Callbacks ---
        if (window.cvs.keyUpCallback) window.cvs.keyUpCallback(code, {x: window.cvs.x, y: window.cvs.y})
    }

    // --- Resize Event ---

    const handleResize = (e) => {
        if (window.cvs.debug) console.log('Resized:', e)

        // --- Default actions ---
        // Auto resize the canvas, if enabled
        if (window.cvs.autoResize){
            const $canvas = window.cvs.$canvas
            const parent = $canvas.parentElement.getBoundingClientRect()
            $canvas.width = parent.width
            $canvas.height = parent.height

            // Update the canvas bounding box
            window.cvs.canvasBoundingBox = $canvas.getBoundingClientRect()
        }

        // --- Callbacks ---
        if (window.cvs.resizeCallback) window.cvs.resizeCallback(e)
    }

    // ================================ Assign the events to the canvas HTML element ================================

    // The following event listeners weren't added using JSX because the canvas element didn't allow to define the event listeners in the JSX code, 
    // So it was necessary to add the event listeners in the useLayoutEffect hook.
    useLayoutEffect(() => {
        // Add the event listeners
        window.addEventListener('resize', handleResize)
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            // Remove the event listeners
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return <canvas id='canvas' 
                onMouseMove={handleMouseMove} 
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onWheel={handleScroll}

                onContextMenu={(e) => e.preventDefault()}  // Disable the browser context menu

                // Required to make the canvas to receive keyboard events
                tabIndex={0}  
                autoFocus 
            />
}