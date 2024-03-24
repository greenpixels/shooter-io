import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import * as PIXI from 'pixi.js'
import { ClientGameHandler } from "./ClientGameHandler";
import { Vector2DTO } from "@shared/dtos/Vector2DTO";
import "./App.css"

const canvasSize: Vector2DTO = { x: 640, y: 360 }
const canvasScale = 2

function App(props: { socket: Socket }) {
  const [game, setGame] = useState<PIXI.Application<HTMLCanvasElement> | null>(null);
  const [eventHandler, setEventHandler] = useState<ClientGameHandler | null>(null)
  const [running, setRunning] = useState(false)
  const gameViewRef = useRef<HTMLCanvasElement>(null);
  const gameParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewRef = gameViewRef.current
    const handleTabClose = () => {
      props.socket.disconnect()
    };
    if (game === null && viewRef) {
      const newGame = new PIXI.Application<HTMLCanvasElement>({ view: viewRef, width: canvasSize.x , height: canvasSize.y, backgroundColor:  0x808080})
      setGame(newGame)
    } else if(game !== null && !running && viewRef) {
      setRunning(true)
      const size = {x: canvasSize.x * canvasScale, y: canvasSize.y * canvasScale}
      const eventHandler = new ClientGameHandler({game: game, socket: props.socket, canvasSize: size})
      
      document.addEventListener("keydown", (ev) => eventHandler.handleKeyboardInput(ev, true))
      document.addEventListener("keyup", (ev) => eventHandler.handleKeyboardInput(ev, false))
      viewRef.addEventListener("click", (ev) => eventHandler.handleMouseClickInput(ev))
      viewRef.addEventListener("mousemove", (ev) => eventHandler.handleMouseMoveInput(ev))
      window.addEventListener('beforeunload', handleTabClose);
      setEventHandler(eventHandler)
    }

    return () => {
      if(game && viewRef && running && eventHandler) {
        setGame(null)
        setRunning(false)
        window.removeEventListener('beforeunload', handleTabClose);
        document.removeEventListener("keydown", (ev) => eventHandler.handleKeyboardInput(ev, true))
        document.removeEventListener("keyup", (ev) => eventHandler.handleKeyboardInput(ev, false))
        viewRef.addEventListener("mousemove", (ev) => eventHandler.handleMouseMoveInput(ev))
      }
    }
  }, [game, gameViewRef, running, eventHandler, props.socket]);

  return (
    <div ref={gameParentRef} className={"canvas-container"}>
      <canvas ref={gameViewRef} style={{ width: canvasSize.x*canvasScale, height: canvasSize.y*canvasScale,  }} width={canvasSize.x} height={canvasSize.y} />
    </div>
  );
}

export default App
