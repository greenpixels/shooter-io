import { Application } from 'pixi.js'
import { Socket, io } from 'socket.io-client'
import { ClientGameHandler } from '../handlers/ClientGameHandler/ClientGameHandler'

export class SetupHelper {
    static async createSocketConnection() {
        const target = import.meta.env.VITE_TARGET
        if (target === undefined) {
            throw Error(
                'The process could not start because the environment variable for TARGET was not set propertly (undefined)'
            )
        }
        const socket = io('ws://' + target)

        await new Promise<void>((resolve) => {
            socket.on('connect', () => resolve())
        })

        if (!socket.id) {
            throw Error('Unable to connect to the game server')
        }
        return socket as Socket & { id: string }
    }

    static createClientHandlerWithEventListeners(socket: Socket & { id: string }, application: Application) {
        const clientEventHandler = new ClientGameHandler({
            application: application,
            canvasSize: { x: application.screen.width, y: application.screen.height },
            socket: socket,
        })

        this.attachEventHandlersToClient(application, clientEventHandler, socket)

        return clientEventHandler
    }

    static attachEventHandlersToClient(
        application: Application,
        clientEventHandler: ClientGameHandler,
        socket: Socket & { id: string }
    ) {
        application.canvas.addEventListener('click', (ev) =>
            clientEventHandler.inputHandler.handleMouseClickInput(ev, () =>
                clientEventHandler.playerShootEvent(socket.id)
            )
        )
        application.canvas.addEventListener('mousemove', (ev) =>
            clientEventHandler.inputHandler.handleMouseMoveInput(ev, (vector) =>
                clientEventHandler.playerAimEvent(socket.id, vector)
            )
        )
        document.addEventListener('keydown', (ev) =>
            clientEventHandler.inputHandler.handleKeyboardInput(ev, true, (vector) => {
                clientEventHandler.playerMoveEvent(socket.id, vector)
            })
        )
        document.addEventListener('keyup', (ev) =>
            clientEventHandler.inputHandler.handleKeyboardInput(ev, false, (vector) => {
                clientEventHandler.playerMoveEvent(socket.id, vector)
            })
        )

        const handleResize = (elements: ResizeObserverEntry[]) => {
            elements.forEach((element) => {
                clientEventHandler.inputHandler.canvasSize.x = element.contentRect.width
                clientEventHandler.inputHandler.canvasSize.y = element.contentRect.height
            })
        }

        window.addEventListener('beforeunload', socket.disconnect)
        new ResizeObserver(handleResize).observe(application.canvas)
    }
}
