import { useLayoutEffect } from "react"
import { handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp, handleResize, handleScroll } from "./utils/event-handlers"

/**
 * This component represents the canvas element in the DOM. The component will handle the events related to the canvas and will store the values read from the events in the global variables.
 *      
 * - Every callback functions receive the event related to the action and the mouse coordinates at the moment of the action. `callback(event, {x, y})`
 * 
 * Most of the events will run a default action, like preventing the default behavior of the event, and then call the callback function if it is defined. 
 * The callbacks are defined in the global variables and can be changed at any time. This callback functions as supposed to be defined in `setupCanvas` function as explained in README basic example.
 * @See `GraphGlobals` from `utils/globals.js` for more information about the global variables and available callbacks.
 * 
 * @returns The canvas element using JSX
 */
export default function Canvas() {

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