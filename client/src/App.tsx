import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { ClientGameHandler } from './ClientGameHandler'
import { Vector2DTO } from '@shared/dtos/Vector2DTO'
import Style from './App.module.css'
import GameUserInterface from './components/GameUserInterface/GameUserInterface'
import { GameInformation } from './types/GameInformation'
import { Application, Renderer } from 'pixi.js'

const canvasSize: Vector2DTO = { x: 640, y: 360 }
const canvasScale = 2

function App(props: { socket: Socket }) {
    const [game, setGame] = useState<Application<Renderer<HTMLCanvasElement>> | null>(null)
    const [startedGameInit, setStartedGameInit] = useState(false)
    const [gameInfo, setGameInfo] = useState<GameInformation>({ players: [], ownId: props.socket.id! })
    const [eventHandler, setEventHandler] = useState<ClientGameHandler | null>(null)
    const [running, setRunning] = useState(false)
    const gameViewRef = useRef<HTMLCanvasElement>(null)
    const gameParentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const viewRef = gameViewRef.current
        const handleTabClose = () => {
            props.socket.disconnect()
        }
        if (game === null && viewRef) {
            if (!startedGameInit) {
                const newGame = new Application<Renderer<HTMLCanvasElement>>()
                initializeGame(newGame, viewRef).then(() => {
                    setGame(newGame)
                })
                setStartedGameInit(true)
            }
        } else if (game !== null && !running && viewRef) {
            setRunning(true)
            const size = { x: canvasSize.x * canvasScale, y: canvasSize.y * canvasScale }
            const eventHandler = new ClientGameHandler({
                game: game,
                socket: props.socket,
                canvasSize: size,
                setGameInfo,
            })

            document.addEventListener('keydown', (ev) => eventHandler.handleKeyboardInput(ev, true))
            document.addEventListener('keyup', (ev) => eventHandler.handleKeyboardInput(ev, false))
            viewRef.addEventListener('click', (ev) => eventHandler.handleMouseClickInput(ev))
            viewRef.addEventListener('mousemove', (ev) => eventHandler.handleMouseMoveInput(ev))
            window.addEventListener('beforeunload', handleTabClose)
            const handleResize = (elements: ResizeObserverEntry[]) => {
                elements.forEach((element) => {
                    eventHandler.canvasSize.x = element.contentRect.width
                    eventHandler.canvasSize.y = element.contentRect.height
                })
            }
            new ResizeObserver(handleResize).observe(viewRef)
            setEventHandler(eventHandler)
        }

        return () => {
            if (game && viewRef && running && eventHandler) {
                setGame(null)
                setRunning(false)
                window.removeEventListener('beforeunload', handleTabClose)
                document.removeEventListener('keydown', (ev) => eventHandler.handleKeyboardInput(ev, true))
                document.removeEventListener('keyup', (ev) => eventHandler.handleKeyboardInput(ev, false))
                viewRef.addEventListener('mousemove', (ev) => eventHandler.handleMouseMoveInput(ev))
            }
        }
    }, [game, gameViewRef, running, eventHandler, props.socket, startedGameInit])

    return (
        <div
            ref={gameParentRef}
            className={Style.container}>
            <GameUserInterface gameInfo={gameInfo} />
            <canvas
                ref={gameViewRef}
                width={canvasSize.x}
                height={canvasSize.y}
            />
        </div>
    )
}

export default App

async function initializeGame(newGame: Application<Renderer<HTMLCanvasElement>>, viewRef: HTMLCanvasElement) {
    await newGame.init({
        canvas: viewRef,
        width: canvasSize.x,
        height: canvasSize.y,
        backgroundColor: 0x808080,
    })
}
