import { Socket } from 'socket.io-client'
import { Application, Renderer } from 'pixi.js'
import GameUserInterface from './components/GameUserInterface/GameUserInterface'
import Style from './App.module.css'
import { ClientGameHandler } from './ClientGameHandler'
import { useEffect, useRef } from 'react'

export interface IAppProps {
    socket: Socket
    game: Application<Renderer<HTMLCanvasElement>>
    client: ClientGameHandler
}

function App(props: IAppProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            container.append(props.game.canvas)
        }
    }, [containerRef, props.game.canvas])

    return (
        <div
            ref={containerRef}
            className={Style.container}>
            <GameUserInterface />
        </div>
    )
}

export default App
