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

Property | Description
--- | ---
`debug` | Boolean. If true, the canvas will display debug information and print debug messages to the console.
`x` | Number. The x position of cursor in canvas coordinates.
`y` | Number. The y position of cursor in canvas coordinates.
`mouseDown` | Number. If a mouse button is pressed, this property will contain the button code. Otherwise, it will be null.
`lastMouseDown` | Number. The timestamp of the last mouse down event (used to detect double clicks).
`key` | Number. If a keyboard key is pressed, this property will contain the key code. Otherwise, it will be null. (e.g. "KeyA" for the "A" key).
`keysDown` | Object. A map of key codes to boolean values indicating whether the key is currently pressed. If the key appears as true, it is pressed. If it appears as false or undefined, it is not pressed.
`autoResize` | Boolean. If true, the canvas will automatically resize to fit its parent container.
`ctx` | Object. The 2D rendering context of the canvas.
`$canvas` | Object. The canvas HTML element.

Callbacks | Description
--- | ---
`mouseDownCallback` | Function. A callback function that is called when a mouse button is pressed. Params: (`button`, `{x, y}`). The `button` parameter is the button code (Number) of the pressed mouse button. The `{x, y}` parameter is the position of the cursor in canvas coordinates at the time of the event.
`mouseUpCallback` | Function. A callback function that is called when a mouse button is released. Params: (`button`, `{x, y}`). The `button` parameter is the button code (Number) of the released mouse button. The `{x, y}` parameter is the position of the cursor in canvas coordinates at the time of the event.
`mouseMoveCallback` | Function. A callback function that is called when the mouse is moved. Params: (`{x, y}`). The `{x, y}` parameter is the position of the cursor in canvas coordinates at the time of the event.
`keyDownCallback` | Function. A callback function that is called when a keyboard key is pressed. Params: (`key`). The `key` parameter is the key code (String) of the pressed key.
`keyUpCallback` | Function. A callback function that is called when a keyboard key is released. Params: (`key`). The `key` parameter is the key code (String) of the released key.
`resizeCallback` | Function. A callback function that is called when the canvas is resized. Params: (`{width, height}`). The `{width, height}` parameter is the new size of the canvas in pixels.

## Add support for new canvas DOM events

To add support for new canvas DOM events:
1. Create a the handler function in the `Canvas` component (path: `/Canvas.jsx`)
2. Add the event listener to the canvas HTML element in the `Canvas` component (path: `/Canvas.jsx`)
3. Define the callback function in the `global.js` file (path: `/utils/global.js`)
4. Document the new callback function in the `README.md` file (path: `/README.md`)