import { useLayoutEffect } from "react"
import constants from "../graph-manager/utils/constants"

/**
 * This component represents the canvas element in the DOM. The component will handle the events related to the canvas and will store the values read from the events in the global variables.
 *      - The callback functions receive the event related to the action and the mouse coordinates at the moment of the action. `callback(event, {x, y})`
 * 
 * [i] See the `globals.js` file for more information about the available global variables.
 * 
 * @returns The canvas element using JSX
 */
export default function Canvas() {

    const handleMouseMove = (e) => {
        // Calculate the mouse coordinates relative to the canvas
        const rect = window.cvs.canvasBoundingBox
        // Store the mouse coordinates in the global variables, considering the canvas position and the canvas drag offset

        const dragOffsetX = window.graph.canvasDragOffset.x
        const dragOffsetY = window.graph.canvasDragOffset.y

        window.cvs.x = (e.clientX - rect.left)/window.graph.zoom - dragOffsetX
        window.cvs.y = (e.clientY - rect.top)/window.graph.zoom - dragOffsetY

        // Adjust the mouse speed based on the zoom level
        e.movementX /= window.graph.zoom
        e.movementY /= window.graph.zoom

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

    const handleScroll = (e) => {
        if (window.cvs.debug) console.log('Scroll:', e.deltaY)

        if (window.cvs.mouseScrollCallback) window.cvs.mouseScrollCallback(e.deltaY, {x: window.cvs.x, y: window.cvs.y})
    }

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

    // Other events
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

                onContextMenu={(e) => e.preventDefault()}

                tabIndex={0}
                autoFocus
            />
}