import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import * as PIXI from 'pixi.js'
import { ClientGameHandler } from "./ClientGameHandler";

const canvasSize = { width: 640, height: 360 }
const canvasScale = 2

function App(props: { socket: Socket }) {
  const [game, set_game] = useState<PIXI.Application<HTMLCanvasElement> | null>(null);
  const [event_handler, set_event_handler] = useState<ClientGameHandler | null>(null)
  const [running, set_running] = useState(false)
  const gameViewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // This useEffect will initialize the canvas, append it, execute the ready-script and append the step-script
    if (game === null && gameViewRef.current) {
      const newGame = new PIXI.Application<HTMLCanvasElement>({ view: gameViewRef.current, ...{canvasSize} });
      set_game(newGame)
    } else if(game !== null && !running) {
      set_running(true)
      let ev_handler = new ClientGameHandler({game: game, socket: props.socket})
      document.addEventListener("keydown", (ev) => ev_handler.handle_input(ev, true))
      document.addEventListener("keyup", (ev) => ev_handler.handle_input(ev, false))
      set_event_handler(ev_handler)
    }
  }, [game, gameViewRef, running, props.socket, props.socket.id]);

  useEffect(() => {
    // This useEffect unmounts the game and resets it, allowing HMR to properly work when developing with vite
    // TODO: This does not work at the moment
    return () => {
      if(game !== null) {
        set_game(null)
        set_running(false)
        document.removeEventListener("keydown", (ev) => event_handler?.handle_input(ev, true))
        document.removeEventListener("keyup", (ev) => event_handler?.handle_input(ev, false))
      }
    }
  }, [game, props.socket]);

  return (
    <div>
      <canvas ref={gameViewRef} style={{ width: canvasSize.width*canvasScale, height: canvasSize.height*canvasScale }} width={canvasSize.width} height={canvasSize.height} />
    </div>
  );
}

export default App
