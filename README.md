# Canvas component
-----------------------------------------------

## Basic use example

The most basic use of the canvas component is explained below. 

The canvas component requires to import two files: `Canvas` and `utils/setupCanvas`.
- `Canvas` is the component that renders the canvas element.
- `utils/setupCanvas` is a function that initializes the canvas and sets up the event listeners.

Also, the canvas component requires to import the `useLayoutEffect` hook from React. This hook is used to run the setup code only once when the component is mounted.

The main structure you should follow to use the canvas component is the following:
1. Import the necessary files.
2. Use the `useLayoutEffect` hook to run the setup code.
   1. Call the `setupCanvas` function to initialize the canvas and set up the event listeners.
   2. Call the `mainLoop` function to set up the main loop that updates the canvas content.
3. Render the canvas component.


```jsx
import { useLayoutEffect } from 'react'
import Canvas from './canvas/Canvas'
import { setupCanvas, mainLoop } from './canvas/utils/setup'
import './App.css'


function App() {
  useLayoutEffect(() => {

    // Setup the canvas. This function is called only once and it is used to initialize the canvas and set up the event listeners.
    setupCanvas(() => {
      console.log('Canvas setup')

      // Set the mouse down callback
      window.cvs.mouseDownCallback = (button) => {
        console.log('Mouse down:', button)
      }
    }, true)

    // Main loop. This function is called every frame and it is used to update the canvas content.
    mainLoop(()=>{
      // Draw a rect
      ctx.fillStyle = 'red'
      ctx.fillRect(100, 100, 100, 100)
    })
  }, [])

  // Render the canvas. It is important to wrap the canvas in a parent container since the canvas will automatically resize to fit its parent container. ⚠️
  return (
    <div className='wrapper'>
      <div className="canvas-container">
        <Canvas />
      </div>
    </div>
  )
}

export default App
```



## Code

### Global variables

> See the file `utils/global.js` for the global variables used by the canvas components.

The component uses the `window` object to store the data of the canvas. The following data is stored under the prefix `window.`:
- `ctx`: The canvas context
- `cvs`: The canvas data object

Under the `window.cvs` object, the following data is stored:

#### DEBUG MODE

Property | Description
--- | ---
`debug` | Boolean. Indicates if debug mode is enabled
`debugData` | Function. Returns an array of strings for debug info
`debugCommands` | Array. Contains objects with label and callback for debug buttons
`debugCommandHover` | The command being hovered by the mouse
`debugFunctions` | Object. Contains functions for custom debug drawings

#### MOUSE & KEYBOARD

Property | Description
--- | ---
`x` | Number. The x coordinate of the mouse cursor (relative to canvas)
`y` | Number. The y coordinate of the mouse cursor (relative to canvas)
`mouseDown` | Number. The button code of the pressed mouse button (null if none)
`lastMouseDown` | Number. Timestamp of the last mouse down event
`doubleClick` | Boolean. Indicates if a double click event was detected
`draggingOrigin` | Object. Coordinates of the mouse at the start of dragging
`key` | Number/String. The key code of the pressed key (null if none)
`keysDown` | Object. Stores the state of keys

#### CANVAS

Property | Description
--- | ---
`ctx` | The canvas 2D context (repeated for emphasis)
`$canvas` | The canvas HTML element
`canvasPanOffset` | Object. Coordinates of the canvas's top-left corner
`panning` | Boolean. Indicates if the user is panning the canvas
`zoom` | Number. The zoom factor

#### CONFIG

Property | Description
--- | ---
`autoResize` | Boolean. Indicates if the canvas auto-resizes to fit its container

#### Callbacks

Callback | Description
--- | ---
`mouseMoveCallback(e, {x, y})` | Function. Called when the mouse is moved
`mouseDownCallback(button, {x, y})` | Function. Called when a mouse button is pressed
`mouseUpCallback(button, {x, y})` | Function. Called when a mouse button is released
`mouseScrollCallback(deltaY, {x, y})` | Function. Called when the mouse wheel is scrolled
`keyDownCallback(key, {x, y})` | Function. Called when a key is pressed
`keyUpCallback(key, {x, y})` | Function. Called when a key is released
`resizeCallback(e)` | Function. Called when the window is resized

### Debug mode

The canvas component has a debug mode that can be enabled by setting the `window.cvs.debug` variable to `true`. When debug mode is enabled, the canvas will display debug information and buttons that can be used to trigger custom debug functions.

Debug properties:
- `debug` (Boolean): Indicates if debug mode is enabled
- `debugData` (Function): Returns an array of strings for debug info. This function is called every frame at the moment of drawing the debug info.
- `debugCommands` (Array): Contains objects with `label` and `callback` for debug buttons that will be displayed below the debug info returned by the `debugData` function and that the user can click to trigger the callback function.
- `debugCommandHover` (String): The command being (from the `debugCommands` array) hovered by the mouse. This property is used by the `drawDebugInfo` function to highlight the hovered command and to trigger the callback function when the user clicks on the command.
- `debugFunctions` (Object): Contains functions for custom debug drawings. The functions are called every frame after the debug info is drawn. This object is used to draw custom debug information that is not covered by the `debugData` function (since the `debugData` function is used to draw general debug info as a list of strings, but can't cover drawing additional visual information such as shapes). 

### Add support for new canvas DOM events

To add support for new canvas DOM events:
1. Create a the handler function in the `Canvas` component (path: `/Canvas.jsx`)
2. Add the event listener to the canvas HTML element in the `Canvas` component (path: `/Canvas.jsx`)
3. Define the callback function in the `global.js` file (path: `/utils/global.js`)
4. Document the new callback function in the `README.md` file (path: `/README.md`)
