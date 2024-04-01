import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Application, Renderer } from 'pixi.js'
import { SetupHelper } from './classes/SetupHelper.ts'
import '@pixi/gif'

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 380
const socket = await SetupHelper.createSocketConnection()
const application = new Application<Renderer<HTMLCanvasElement>>()

application
    .init({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: 0x7f7f7f,
    })
    .then(() => {
        const clientEventHandler = SetupHelper.createClientHandlerWithEventListeners(socket, application)
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <App
                socket={socket}
                application={application}
                client={clientEventHandler}
            />
        )
    })
