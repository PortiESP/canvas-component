import { useLayoutEffect } from "react"
import constants from "./utils/constants"
import { resetZoom, zoomIn, zoomOut } from "./utils/zoom"
import { isPanKeysPressed, isPanning, panBy, resetPan, startPanning, stopPanning } from "./utils/pan"

/**
 * This component represents the canvas element in the DOM. The component will handle the events related to the canvas and will store the values read from the events in the global variables.
 *      
 * - Every callback functions receive the event related to the action and the mouse coordinates at the moment of the action. `callback(event, {x, y})`
 * 
 * Most of the events will run a default action, like preventing the default behavior of the event, and then call the callback function if it is defined. 
 * The callbacks are defined in the global variables and can be changed at any time. This callback functions as supposed to be defined in `setupCanvas` function as explained in README basic example.
 * @See `setupGlobals` from `utils/globals.js` for more information about the global variables and available callbacks.
 * 
 * @returns The canvas element using JSX
 */
export default function Canvas() {

    // ================================ Event Handlers ================================

    // --- Mouse Events ---

    const handleMouseMove = (e) => {
        // Calculate the mouse coordinates relative to the canvas
        const rect = window.cvs.$canvas.getBoundingClientRect()

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
        if (isPanning()) {  // Check if the pan key is pressed
            panBy(e.movementX, e.movementY)
            return  // Prevent further actions
        }

        // --- Callbacks ---
        if (window.cvs.mouseMoveCallback) window.cvs.mouseMoveCallback(e, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleMouseDown = (e) => {
        e.preventDefault()
        window.cvs.$canvas.focus()

        const button = e.button

        // Store the mouse down button
        window.cvs.mouseDown = button
        // Store the coordinates of the mouse at the moment of the mouse down event (just in case the user wants to drag the canvas)
        window.cvs.draggingOrigin = {x: window.cvs.x, y: window.cvs.y}

        // --- Debug mode ---
        if (window.cvs.debug) {
            console.log('Mouse down:', button)

            // Check if any debug command was triggered
            if (button === 0 && window.cvs.debugCommandHover){
                window.cvs.debugCommandHover.callback()
                return
            }
        }

        // --- Default actions ---
        if (isPanKeysPressed()) {  // Check if the pan key is pressed
            startPanning()
            return // Prevent further actions
        }
        
        // --- Callbacks ---
        // Check double click
        if (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY) {
            window.cvs.lastMouseDown = Date.now()
            window.cvs.doubleClick = true
            if (window.cvs.mouseDoubleClickCallback) window.cvs.mouseDoubleClickCallback(button, {x: window.cvs.x, y: window.cvs.y})
            return 
        } else window.cvs.lastMouseDown = Date.now()

        // Single click
        if (window.cvs.mouseDownCallback) window.cvs.mouseDownCallback(button, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleMouseUp = (e) => {
        e.preventDefault()

        const button = e.button

        // --- Debug mode ---
        if (window.cvs.debug) console.log('Mouse up:', button)

        // Reset the mouse state
        window.cvs.mouseDown = null
        window.cvs.doubleClick = false
        window.cvs.draggingOrigin = null

        // --- Default actions ---
        if (window.cvs.keysDown[constants.PAN_KEY]) {  // Check if the pan key is still pressed 
            stopPanning()
            document.body.style.cursor = "grab"
            return // Prevent further actions
        }
        // Release the pan key
        if (button === 1) { // Middle mouse button (usually the mouse button for panning)
            stopPanning()
            return // Prevent further actions
        }

        // --- Callbacks ---
        if (window.cvs.mouseUpCallback) window.cvs.mouseUpCallback(button, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleScroll = (e) => {
        const deltaY = e.deltaY

        // --- Debug mode ---
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
        // e.preventDefault()

        const code = e.code

        // --- Debug mode ---
        if (window.cvs.debug) console.log('Key down:', code)

        // Store the key pressed
        window.cvs.key = code  // Store the key code (used to check the last key pressed, overwriting the previous key code even if that key is still pressed. That's why the keysDown object is used to store the state of the keys)
        window.cvs.keysDown[code] = true  // Store the key state

        // --- Default shortcuts ---
        if (code === constants.PAN_KEY) { // The pan key is pressed
            // Change the cursor to the grab cursor to indicate that the canvas can be panned, but only if the mouse is not already dragging an element
            if (!window.cvs.panning) document.body.style.cursor = "grab"
            return // Prevent further actions
        }

        // --- Callback ---
        if (window.cvs.keyDownCallback) window.cvs.keyDownCallback(code, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleKeyUp = (e) => {

        e.preventDefault()

        const code = e.code

        // --- Debug mode ---
        if (window.cvs.debug) console.log('Key up:', code)

        // Reset the key pressed
        window.cvs.key = null
        window.cvs.keysDown[code] = false

        // --- Default shortcuts ---
        if (code === constants.PAN_KEY) { // The pan key is released
            stopPanning()
            return // Prevent further actions
        }

        // --- Callbacks ---
        if (window.cvs.keyUpCallback) window.cvs.keyUpCallback(code, {x: window.cvs.x, y: window.cvs.y})
    }

    // --- Resize Event ---

    const handleResize = (e) => {
        // --- Debug mode ---
        if (window.cvs.debug) console.log('Resized:', e)

            
        // --- Default actions ---
        if (window.cvs.autoResize){ // Auto resize the canvas, if enabled
            resetPan()  // Reset the canvas pan
            resetZoom() // Reset the zoom level
            const $canvas = window.cvs.$canvas
            const parent = $canvas.parentElement.getBoundingClientRect()
            $canvas.width = parent.width
            $canvas.height = parent.height
        }

        // --- Callbacks ---
        if (window.cvs.resizeCallback) window.cvs.resizeCallback(e)
    }

    // ================================ Assign the events to the canvas HTML element ================================

    // The following event listeners weren't added using JSX because the canvas element didn't allow to define the event listeners in the JSX code, 
    // So it was necessary to add the event listeners in the useLayoutEffect hook.
    useLayoutEffect(() => {
        const $canvas = window.cvs?.$canvas
        if (!$canvas) return

        $canvas.tabIndex = 1000
        $canvas.autofocus = true
        $canvas.style.outline = 'none'
        $canvas.focus()


        // Add the event listeners
        $canvas.addEventListener('resize', handleResize)
        $canvas.addEventListener('keydown', handleKeyDown)
        $canvas.addEventListener('keyup', handleKeyUp)

        $canvas.addEventListener('mouseup', () => {
            window.cvs.mouseDown = null
        })

        return () => {
            // Remove the event listeners
            $canvas.removeEventListener('resize', handleResize)
            $canvas.removeEventListener('keydown', handleKeyDown)
            $canvas.removeEventListener('keyup', handleKeyUp)
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