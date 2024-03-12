import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import * as PIXI from 'pixi.js'
import { ClientGameHandler } from "./ClientGameHandler";

const canvasSize = { width: 640, height: 360 }
const canvasScale = 2

function App(props: { socket: Socket }) {
  const [game, setGame] = useState<PIXI.Application<HTMLCanvasElement> | null>(null);
  const [eventHandler, setEventHandler] = useState<ClientGameHandler | null>(null)
  const [running, setRunning] = useState(false)
  const gameViewRef = useRef<HTMLCanvasElement>(null);
  const gameParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewRef = gameViewRef.current
    if (game === null && viewRef) {
      const newGame = new PIXI.Application<HTMLCanvasElement>({ view: viewRef, ...{canvasSize} });
      setGame(newGame)
    } else if(game !== null && !running) {
      setRunning(true)
      const eventHandler = new ClientGameHandler({game: game, socket: props.socket})
      document.addEventListener("keydown", (ev) => eventHandler.handleInput(ev, true))
      document.addEventListener("keyup", (ev) => eventHandler.handleInput(ev, false))
      setEventHandler(eventHandler)
    }

    return () => {
      if(game !== null && viewRef && running) {
        setGame(null)
        setRunning(false)
        document.removeEventListener("keydown", (ev) => eventHandler?.handleInput(ev, true))
        document.removeEventListener("keyup", (ev) => eventHandler?.handleInput(ev, false))
      }
    }
  }, [game, gameViewRef, running, eventHandler, props.socket]);

  return (
    <div ref={gameParentRef}>
      <canvas ref={gameViewRef} style={{ width: canvasSize.width*canvasScale, height: canvasSize.height*canvasScale }} width={canvasSize.width} height={canvasSize.height} />
    </div>
  );
}

export default App
