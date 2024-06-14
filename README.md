# Canvas components

## Basic use example

```jsx
import { useLayoutEffect } from 'react'
import Canvas from './canvas/Canvas'
import { setupCanvas, mainLoop } from './canvas/utils/setup'
import './App.css'


function App() {
  useLayoutEffect(() => {

    // Setup the canvas
    setupCanvas(() => {
      console.log('Canvas setup')

      // Set the mouse down callback
      window.cvs.mouseDownCallback = (button) => {
        console.log('Mouse down:', button)
      }
    }, true)

    // Run the main loop
    mainLoop(()=>{
      // Draw a rect
      ctx.fillStyle = 'red'
      ctx.fillRect(100, 100, 100, 100)
    })
  }, [])

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