import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Application, Renderer } from 'pixi.js'
import '@pixi/gif'
import { SetupHelper } from './classes/SetupHelper.ts'

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 380
const socket = await SetupHelper.createSocketConnection()
const application = new Application<Renderer<HTMLCanvasElement>>()

await application.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 0x7f7f7f,
})

const clientEventHandler = SetupHelper.createClientHandlerWithEventListeners(socket, application)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App
            socket={socket}
            application={application}
            client={clientEventHandler}
        />
    </React.StrictMode>
)
