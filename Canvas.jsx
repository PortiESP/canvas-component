import { useLayoutEffect } from "react"
import { handleBlur, handleFocus, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp, handleResize, handleScroll, handleTouchEnd, handleTouchMove, handleTouchStart } from "./utils/event-handlers"

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


    return <canvas id='canvas'
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleScroll}

        onFocus={handleFocus}
        onBlur={handleBlur}

        onContextMenu={(e) => e.preventDefault()}  // Disable the browser context menu

        // Required to make the canvas to receive keyboard events
        tabIndex={0}
        autoFocus
    />
}


// The following event listeners weren't added using JSX because the canvas element didn't allow to define the event listeners in the JSX code, 
// So it was necessary to add the event listeners in the useLayoutEffect hook.
export function setupAfterCanvas() {
    const $canvas = document.getElementById('canvas')
    $canvas.tabIndex = 1000
    $canvas.autofocus = true
    $canvas.style.outline = 'none'
    $canvas.focus()

    handleResize()  // Set the initial canvas size

    // Add the event listeners
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('resize', handleResize)
    $canvas.addEventListener('keydown', handleKeyDown)
    $canvas.addEventListener('keyup', handleKeyUp)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })


    return () => {
        // Remove the event listeners
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchend', handleTouchEnd)
        window.removeEventListener('resize', handleResize)
        $canvas.removeEventListener('keydown', handleKeyDown)
        $canvas.removeEventListener('keyup', handleKeyUp)

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('touchmove', handleTouchMove)
    }
}