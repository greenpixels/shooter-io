import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"
import { GameStateDTO } from "../../shared/GameStateDTO";
import * as PIXI from 'pixi.js'
import { ProjectileDTO } from "@shared/ProjectileDTO";
import { EventInformationDTO} from "@shared/EventInformationDTO";
import {EventInformationType} from "@shared/enums/EventInformationType"
import { SOCKET_EVENT } from "@shared/enums/SocketEvents";
import { MoveEvent } from "@shared/MoveEvent"
import { MOVE_DIRECTION } from "@shared/enums/MoveDirection";
import { Player } from "./types/Player";
import { PlayerDTO } from "@shared/PlayerDTO";
import { Projectile } from "./types/Projectile";
import { EntityDTO } from "@shared/EntityDTO";

const canvasSize = { width: 640, height: 360 }
const canvasScale = 2

function App(props: { socket: Socket }) {
  const [game, set_game] = useState<PIXI.Application<HTMLCanvasElement> | null>(null);
  const [running, set_running] = useState(false)
  const gameViewRef = useRef<HTMLCanvasElement>(null);

  const [players, set_players] = useState<{[key : string] : Player}>({})
  const [projectiles, set_projectiles] = useState<{[key : string] : Projectile}>({})

  useEffect(() => {
    // This useEffect will initialize the canvas, append it, execute the ready-script and append the step-script
    if (game === null && gameViewRef.current) {
      const newGame = new PIXI.Application<HTMLCanvasElement>({ view: gameViewRef.current, ...{canvasSize} });
      set_game(newGame)
    } else if(game !== null && !running) {
      console.log("A canvas has been created and the current socket connection id is " + props.socket.id)
      on_game_ready(game)
      props.socket.on(SOCKET_EVENT.GAME_EVENT, (event_information : EventInformationDTO<EntityDTO>) => { // TODO this could be improved
        switch(event_information.type) {
          case EventInformationType.PLAYER_SPAWN: on_player_spawn_event(game, {...players}, event_information.payload as {[key : string] : PlayerDTO}, set_players); break
          case EventInformationType.PROJECTILE_SPAWN: on_projectile_spawn_event(game, {...projectiles}, event_information.payload as {[key : string] : ProjectileDTO}, set_projectiles); break
        }
      })

      props.socket.on(SOCKET_EVENT.GAME_TICK, (game_information: GameStateDTO) => {
        const new_players = {...players};
        const new_projectiles = {...projectiles};

        Object.entries(game_information.players).forEach(([id, player]) => {
          // TODO might update more stuff in the future
          new_players[id].sync(player);
        })

        Object.entries(game_information.projectiles).forEach(([id, projectile]) => {
          new_projectiles[id].sync(projectile);
        })

        set_players(new_players);
        set_projectiles(new_projectiles);
      })
      set_running(true)
    }
    document.addEventListener("keydown", (ev) => on_key_event(ev, true, props.socket))
    document.addEventListener("keyup", (ev) => on_key_event(ev, false, props.socket))
  }, [game, gameViewRef, running, props.socket, players, projectiles, props.socket.id]);

  useEffect(() => {
    // This useEffect unmounts the game and resets it, allowing HMR to properly work when developing with vite
    return () => {
      if(game !== null) {
        set_game(null)
        set_running(false)
        document.removeEventListener("keydown", (ev) => on_key_event(ev, true, props.socket))
        document.removeEventListener("keyup", (ev) => on_key_event(ev, false, props.socket))
      }
    }
  }, [game, props.socket]);

  return (
    <div>
      <canvas ref={gameViewRef} style={{ width: canvasSize.width*canvasScale, height: canvasSize.height*canvasScale }} width={canvasSize.width} height={canvasSize.height} />
    </div>
  );
}

function on_game_ready(game : PIXI.Application<HTMLCanvasElement>) {
  console.log(game)
  //game.ticker.add(on_game_step)
}

//function on_game_step(_delta : number) {
//}

function on_player_spawn_event(game : PIXI.Application<HTMLCanvasElement>, current_players : {[key : string] : Player}, received_players : {[key : string] : PlayerDTO}, set_players: React.Dispatch<React.SetStateAction<{[key: string]: Player}>>) {
  Object.keys(received_players).forEach((id) => {
    if(current_players[id] === undefined) {
      // A player that was not in the game before has joined
      const player_sprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
      const new_player = {[id]: new Player(player_sprite, received_players[id])}
      game.stage.addChild(player_sprite)
      set_players({...current_players, ...new_player})
    } else {
      // A player respawned
      current_players[id].sync(received_players[id])
      set_players(current_players)
    }
  })
}

function on_projectile_spawn_event(game : PIXI.Application<HTMLCanvasElement>, current_projectiles : {[key : string] : Projectile}, received_projectiles : {[key : string] : ProjectileDTO}, set_projectiles: React.Dispatch<React.SetStateAction<{[key: string]: Projectile}>>) {
  Object.keys(received_projectiles).forEach((id) => {
    if(current_projectiles[id] === undefined) {
      // A player that was not in the game before has joined
      const projectile_sprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
      const new_projectile = {[id]: new Projectile(projectile_sprite, received_projectiles[id])}
      game.stage.addChild(projectile_sprite)
      set_projectiles({...current_projectiles, ...new_projectile})
    } else {
      // A player respawned
      current_projectiles[id].sync(received_projectiles[id])
      set_projectiles(current_projectiles)
    }
  })
}

function on_key_event(ev: KeyboardEvent, key_down: boolean, socket: Socket) {
  switch(ev.code) {
    case "KeyS":
    case "ArrowDown":
      socket.emit(SOCKET_EVENT.MOVE, {direction: MOVE_DIRECTION.DOWN, key_down: key_down} satisfies MoveEvent);
      break;
    case "KeyW":
    case "ArrowUp":
      socket.emit(SOCKET_EVENT.MOVE, {direction: MOVE_DIRECTION.UP, key_down: key_down} satisfies MoveEvent);
      break;
    case "KeyA":
    case "ArrowLeft":
      socket.emit(SOCKET_EVENT.MOVE, {direction: MOVE_DIRECTION.LEFT, key_down: key_down} satisfies MoveEvent);
      break;
    case "KeyD":
    case "ArrowRight":
      socket.emit(SOCKET_EVENT.MOVE, {direction: MOVE_DIRECTION.RIGHT, key_down: key_down} satisfies MoveEvent);
      break;
  }
}

export default App
