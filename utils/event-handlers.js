import constants from "./constants"
import { resetZoom, zoomBy, zoomIn, zoomOut, zoomTo } from "./zoom"
import { isPanKeysPressed, isPanning, panBy, panTo, resetPan, startPanning, stopPanning } from "./pan"

// --- Export all ---
export { handleMouseMove, handleMouseDown, handleMouseUp, handleScroll, handleKeyDown, handleKeyUp, handleResize, handleBlur, handleFocus, handleTouchStart, handleTouchMove, handleTouchEnd }

// --- Mouse Events ---
const handleMouseMove = (e) => {
    const { x, y } = mapClientToCanvasCoordinates(e.clientX, e.clientY)

    // Set the mouse coordinates on the canvas environment
    window.cvs.x = x
    window.cvs.y = y

    // Adjust the mouse speed based on the zoom level (this method is used in the callbacks to adjust to read mouse movements)
    e.despX = e.movementX / window.cvs.zoom
    e.despY = e.movementY / window.cvs.zoom

    // --- Default actions ---
    // Pan the canvas
    if (isPanning()) {  // Check if the pan key is pressed
        panBy(e.despX, e.despY)
        return  // Prevent further actions
    }

    // --- Callbacks ---
    if (window.cvs.mouseMoveCallback) window.cvs.mouseMoveCallback(e, { x: window.cvs.x, y: window.cvs.y })
}


const handleMouseDown = (e) => {
    window.cvs.$canvas.focus()

    const button = e.button

    // Store the mouse down button
    window.cvs.mouseDown = button

    // --- Debug mode ---
    if (window.cvs.debug) {
        console.log('Mouse down:', button)

        // Check if any debug command was triggered
        if (button === 0 && window.cvs.debugCommandHover) {
            window.cvs.debugCommandHover.callback()
            return
        }
    }

    // --- Default actions ---
    if (isPanKeysPressed()) {  // Check if the pan key is pressed
        startPanning()
        return // Prevent further actions
    }

    // Left mouse button
    if (button === 0) {
        // Store the coordinates of the mouse at the moment of the mouse down event (just in case the user wants to drag the canvas)
        window.cvs.draggingOrigin = { x: window.cvs.x, y: window.cvs.y }

        // Check double click
        if (Date.now() - window.cvs.lastMouseDown < constants.DOUBLE_CLICK_DELAY) {
            window.cvs.lastMouseDown = Date.now()
            window.cvs.doubleClick = true
            // --- Double click callback ---
            if (window.cvs.mouseDoubleClickCallback) window.cvs.mouseDoubleClickCallback(button, { x: window.cvs.x, y: window.cvs.y })
            return
        } else window.cvs.lastMouseDown = Date.now()
    }


    // --- Callbacks ---
    // Single click
    if (window.cvs.mouseDownCallback) window.cvs.mouseDownCallback(button, { x: window.cvs.x, y: window.cvs.y })
}


const handleMouseUp = (e) => {
    // Prevent the event to be triggered when the mouse is released over some overlay element
    // - The `html` allows the mouse up event to be triggered even if the mouse is released outside of the browser
    // - The `canvas` allows the mouse up event to be triggered even if the mouse is released over the canvas
    if (e.target.localName !== "html" && e.target.localName !== "canvas") return

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
    if (window.cvs.mouseUpCallback) window.cvs.mouseUpCallback(button, { x: window.cvs.x, y: window.cvs.y })
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
    if (window.cvs.mouseScrollCallback) window.cvs.mouseScrollCallback(deltaY, { x: window.cvs.x, y: window.cvs.y })
}



// --- Keyboard Events ---

const handleKeyDown = (e) => {
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
    if (window.cvs.keyDownCallback) {
        if (window.cvs.keyDownCallback(code, { x: window.cvs.x, y: window.cvs.y })) e.preventDefault()
    }
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
    if (window.cvs.keyUpCallback) window.cvs.keyUpCallback(code, { x: window.cvs.x, y: window.cvs.y })
}



// --- Resize Event ---

const handleResize = (e) => {
    // --- Debug mode ---
    if (window.cvs.debug) console.log('Resized:', e)


    // --- Default actions ---
    if (window.cvs.autoResize) { // Auto resize the canvas, if enabled
        resetPan()  // Reset the canvas pan
        resetZoom() // Reset the zoom level
        const $canvas = window.cvs.$canvas
        const parent = $canvas.parentElement.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1;
        
        // Set the canvas width and height according to the device pixel ratio
        $canvas.width = parent.width * dpr
        $canvas.height = parent.height * dpr
    }

    // --- Callbacks ---
    if (window.cvs.resizeCallback) window.cvs.resizeCallback(e)
}

// --- Focus & Blur ---
const handleFocus = (e) => {
    if (window.cvs.debug) console.log("event focus", e)

    // --- Callbacks ---
    if (window.cvs.focusCallback) window.cvs.focusCallback(e)
}

const handleBlur = (e) => {
    if (window.cvs.debug) console.log("event blur", e)

    // Trigger the key up event for all keys
    for (const key in window.cvs.keysDown) {
        const event = new Event('mouseup')
        event.code = key
        if (window.cvs.keysDown[key]) handleKeyUp(event)
    }

    // Trigger the mouse up event for all mouse buttons
    if (window.cvs.mouseDown) {
        const event = new Event('mouseup')
        event.button = window.cvs.mouse
        handleMouseUp(event)
    }

    // --- Callbacks ---
    if (window.cvs.blurCallback) window.cvs.blurCallback(e)
}

// ============== Touch Events ==============

const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]

    const { x, y } = mapClientToCanvasCoordinates(touch.clientX, touch.clientY)

    window.cvs.x = x
    window.cvs.y = y

    // Fake the button property. The touch event doesn't have a button property but the mouse event does
    touch.button = 0
    console.log(e)

    saveTouches(Object.values(e.touches), {start: true})
    window.cvs.touchesData = {
        zoomEnabled: e.touches.length === 2,
        touchA: e.touches[0],
        touchB: null,
        distance: null,
        originalZoom: window.cvs.zoom,
        originalX: x,
        originalY: y
    }

    if (window.cvs.touchesData.zoomEnabled) {
        const tA = e.touches[0]
        const tB = e.touches[1]
        const distance = Math.hypot(tA.clientX - tB.clientX, tA.clientY - tB.clientY)
        window.cvs.touchesData.distance = distance
        window.cvs.touchesData.touchB = tB
        const { x: xB, y: yB } = mapClientToCanvasCoordinates(tB.clientX, tB.clientY)
        const center = {x: (x+xB)/2, y: (y+yB)/2}
        window.cvs.touchesData.originalX = center.x
        window.cvs.touchesData.originalY = center.y
    }

    handleMouseDown(touch)
}

const handleTouchMove = (e) => {
    
    if (e.target.localName === "canvas") e.preventDefault()  // Avoid the page to be moved/scrolled on mobile devices when the user drags the canvas

    const touch = e.touches[0]

    const { x, y } = mapClientToCanvasCoordinates(touch.clientX, touch.clientY)

    // Fake the movementX and movementY properties. Calculate the movement based on the previous touch position
    touch.movementX = (x - window.cvs.x)/window.cvs.zoom
    touch.movementY = (y - window.cvs.y)/window.cvs.zoom

    // After the fake movementX and movementY properties are calculated, update the mouse coordinates
    window.cvs.x = x
    window.cvs.y = y

    saveTouches(Object.values(e.touches))
    if (window.cvs.touchesData.zoomEnabled) {
        const tA = e.touches[0]
        const tB = e.touches[1]
        const distance = Math.hypot(tA.clientX - tB.clientX, tA.clientY - tB.clientY)
        let delta = distance/window.cvs.touchesData.distance
        window.cvs.touchesData.delta = delta

        zoomTo(window.cvs.touchesData.originalZoom*delta)
        const { x: xB, y: yB } = mapClientToCanvasCoordinates(tB.clientX, tB.clientY)
        const center = {x: (x+xB)/2, y: (y+yB)/2}
        console.log(`calcs: ${center.x-window.cvs.touchesData.originalX}, ${center.y-window.cvs.touchesData.originalY}`)
        panBy(center.x-window.cvs.touchesData.originalX, center.y-window.cvs.touchesData.originalY)
    } else {
        handleMouseMove(touch)
    }
}

const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0]

    touch.button = 0

    saveTouches(Object.values(e.touches), {end: true})

    window.cvs.touchesData = {
        zoomEnabled: false,
        touchA: null,
        touchB: null,
        distance: null,
        delta: 0
    }

    handleMouseUp(touch)
}


// ============== Utils ==============

function mapClientToCanvasCoordinates(clientX, clientY) {
    // Calculate the mouse coordinates relative to the canvas
    const rect = window.cvs.$canvas.getBoundingClientRect()

    // Position of the mouse relative to the canvas
    const pointerX = (clientX - rect.left)
    const pointerY = (clientY - rect.top)
    // Compensate the canvas pan
    const panOffsetX = window.cvs.canvasPanOffset.x
    const panOffsetY = window.cvs.canvasPanOffset.y

    const x = pointerX / window.cvs.zoom + panOffsetX
    const y = pointerY / window.cvs.zoom + panOffsetY

    // Adjust the pointer coordinates based on the zoom level and the canvas pan
    return { x, y }
}


function saveTouches(touches, additionalData = {}) {
    console.log("*", touches)
    window.cvs.touches = touches.map(t => {
        console.log()
        return { id: t.identifier, ...mapClientToCanvasCoordinates(t.clientX, t.clientY), ...additionalData }
    })
}