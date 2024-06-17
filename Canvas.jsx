import { useLayoutEffect } from "react"
import constants from "../graph-manager/utils/constants"

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
        // We need to apply this correction factor to the movementX and movementY values since the speed of the mouse is not 100% accurate
        const DISPLACEMENT_CORRECTION_FACTOR = 1.1
        e.movementX /= window.cvs.zoom * DISPLACEMENT_CORRECTION_FACTOR
        e.movementY /= window.cvs.zoom * DISPLACEMENT_CORRECTION_FACTOR

        if (window.cvs.mouseMoveCallback) window.cvs.mouseMoveCallback(e, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleMouseDown = (e) => {
        e.preventDefault()
        if (window.cvs.debug) console.log('Mouse down:', e.button)

        window.cvs.mouseDown = e.button
        
        // Check double click
        if (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY) {
            window.cvs.lastMouseDown = Date.now()
            if (window.cvs.mouseDoubleClickCallback) window.cvs.mouseDoubleClickCallback(e.button, {x: window.cvs.x, y: window.cvs.y})
                return
        } else window.cvs.lastMouseDown = Date.now()

        // Single click
        if (window.cvs.mouseDownCallback) window.cvs.mouseDownCallback(e.button, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleMouseUp = (e) => {
        e.preventDefault()
        if (window.cvs.debug) console.log('Mouse up:', e.button)

        window.cvs.mouseDown = null
        if (window.cvs.mouseUpCallback) window.cvs.mouseUpCallback(e.button, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleScroll = (e) => {
        if (window.cvs.debug) console.log('Scroll:', e.deltaY)

        if (window.cvs.mouseScrollCallback) window.cvs.mouseScrollCallback(e.deltaY, {x: window.cvs.x, y: window.cvs.y})
    }

    // --- Keyboard Events ---

    const handleKeyDown = (e) => {
        e.preventDefault()
        if (window.cvs.debug) console.log('Key down:', e.code)

        window.cvs.key = e.code
        window.cvs.keysDown[e.code] = true
        if (window.cvs.keyDownCallback) window.cvs.keyDownCallback(e.code, {x: window.cvs.x, y: window.cvs.y})
    }

    const handleKeyUp = (e) => {
        e.preventDefault()
        if (window.cvs.debug) console.log('Key up:', e.code)

        window.cvs.key = null
        window.cvs.keysDown[e.code] = false
        if (window.cvs.keyUpCallback) window.cvs.keyUpCallback(e.code, {x: window.cvs.x, y: window.cvs.y})
    }

    // --- Resize Event ---

    const handleResize = (e) => {
        if (window.cvs.debug) console.log('Resized:', e)

        if (window.cvs.autoResize){
            const $canvas = window.cvs.$canvas
            const parent = $canvas.parentElement.getBoundingClientRect()
            $canvas.width = parent.width
            $canvas.height = parent.height

            // Update the canvas bounding box
            window.cvs.canvasBoundingBox = $canvas.getBoundingClientRect()
        }
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