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

    static createClientHandlerWithEventListeners(socket: Socket & { id: string }, game: Application) {
        const clientEventHandler = new ClientGameHandler({
            game: game,
            canvasSize: { x: game.screen.width, y: game.screen.height },
            socket: socket,
        })
        game.canvas.addEventListener('click', (ev) => clientEventHandler.handleMouseClickInput(ev))
        game.canvas.addEventListener('mousemove', (ev) => clientEventHandler.handleMouseMoveInput(ev))
        document.addEventListener('keydown', (ev) => clientEventHandler.handleKeyboardInput(ev, true))
        document.addEventListener('keyup', (ev) => clientEventHandler.handleKeyboardInput(ev, false))
        window.addEventListener('beforeunload', socket.disconnect)

        const handleResize = (elements: ResizeObserverEntry[]) => {
            elements.forEach((element) => {
                clientEventHandler.canvasSize.x = element.contentRect.width
                clientEventHandler.canvasSize.y = element.contentRect.height
            })
        }
        new ResizeObserver(handleResize).observe(game.canvas)
        return clientEventHandler
    }
}
