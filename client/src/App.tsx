import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import * as PIXI from 'pixi.js'

const canvasSize = { width: 640, height: 360 }
const canvasScale = 2
const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
function App(props: { socket: Socket }) {
  const [game, setGame] = useState<PIXI.Application<HTMLCanvasElement> | null>(null);
  const [running, setRunning] = useState(false)
  const gameViewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // This useEffect will initialize the canvas, append it, execute the ready-script and append the step-script
    if (game === null && gameViewRef.current) {
      const newGame = new PIXI.Application<HTMLCanvasElement>({ view: gameViewRef.current, ...{canvasSize} });
      setGame(newGame)
    } else if(game !== null && !running) {
      console.log("A canvas has been created and the current socket connection id is " + props.socket.id)
      on_game_ready(game)
      setRunning(true)
    }
  }, [game, gameViewRef, running, props.socket.id]);

  useEffect(() => {
    // This useEffect unmounts the game and resets it, allowing HMR to properly work when developing with vite
    return () => {
      if(game !== null) {
        setGame(null)
        setRunning(false)
      }
    }
  }, [game])

  return (
    <div>
      <canvas ref={gameViewRef} style={{ width: canvasSize.width*canvasScale, height: canvasSize.height*canvasScale }} width={canvasSize.width} height={canvasSize.height} />
    </div>
  );
}

function on_game_ready(game : PIXI.Application<HTMLCanvasElement>) {
  game.stage.addChild(bunny)
  game.ticker.add(on_game_step)
  bunny.anchor.set(0.5);
  bunny.x = game.screen.width / 2;
  bunny.y = game.screen.height / 2;
}

function on_game_step(delta : number) {
  bunny.rotation += delta / 10
}

export default App
