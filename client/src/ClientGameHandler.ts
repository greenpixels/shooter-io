import {GameEventHandler } from "@shared/GameEventHandler"
import { Socket } from "socket.io-client";
import * as PIXI from 'pixi.js'
import { Player } from "./types/Player";
import { Projectile } from "./types/Projectile";
import { MOVE_DIRECTION } from "@shared/enums/MoveDirection";
import { PlayerDTO } from "@shared/dtos/PlayerDTO";
import { ProjectileDTO } from "@shared/dtos/ProjectileDTO";

type ClientGameHandlerProps = {
    socket : Socket,
    game : PIXI.Application<HTMLCanvasElement>
}

export class ClientGameHandler extends GameEventHandler {
    private game : PIXI.Application<HTMLCanvasElement>
    private socket : Socket
    private players : {[key : string] : Player} = {}
    private projectiles : {[key : string] : Projectile} = {}

    constructor(props : ClientGameHandlerProps) {
        super()
        this.game = props.game
        this.socket = props.socket
        this.socket.on(this.EVENT_GAME_TICK, this.game_tick.bind(this))
        this.socket.on(this.EVENT_PLAYER_SPAWN, this.player_spawn.bind(this))
        this.socket.on(this.EVENT_PLAYER_DEATH, this.player_death.bind(this))
        
    }

    handle_input(ev: KeyboardEvent, key_down: boolean) {
        if(ev.repeat) {
            return
        }
        switch(ev.code) {
            case "KeyS":
            case "ArrowDown": this.player_move(this.socket.id, MOVE_DIRECTION.DOWN, key_down); break;
            case "KeyW":
            case "ArrowUp": this.player_move(this.socket.id, MOVE_DIRECTION.UP, key_down); break;
            case "KeyA":
            case "ArrowLeft": this.player_move(this.socket.id, MOVE_DIRECTION.LEFT, key_down); break;
            case "KeyD":
            case "ArrowRight": this.player_move(this.socket.id, MOVE_DIRECTION.RIGHT, key_down); break;
          }
    }

    game_tick(visible_players: { [key: string]: PlayerDTO; }, visible_projectiles: { [key: string]: ProjectileDTO; }): void {
        Object.entries(visible_players).forEach(([id, player]) => {
            if(this.players[id] !== undefined) {
                this.players[id].sync(player);
            } else {
                this.add_player(id, visible_players[id])
            }
          
        })

        Object.entries(visible_projectiles).forEach(([id, projectile]) => {
            if(this.projectiles[id] !== undefined) {
                this.projectiles[id].sync(projectile);
            }
        })
    }

    player_move(socket_id: string, direction: MOVE_DIRECTION, key_down: boolean): void {
        this.socket.emit(this.EVENT_PLAYER_MOVE, socket_id, direction, key_down)
    }

    player_death(...args: any): void {
        throw new Error("Method not implemented." + args[0]);
    }

    player_spawn(affected_players : {[key : string] : PlayerDTO}): void {
          Object.keys(affected_players).forEach((id)=>  {
            if(this.players[id] === undefined) {
                // A player that was not in the game before has joined
               this.add_player(id, affected_players[id])
              } else {
                // A player respawned
                this.players[id].sync(affected_players[id])
              }
          })
    }

    add_player(id: string, dto: PlayerDTO) {
        const player_sprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
        this.game.stage.addChild(player_sprite)
        const new_player = new Player(player_sprite, dto)
        this.players = {...this.players, ...{[id]: new_player}}
    }

    projectile_spawn(...args: any): void {
        throw new Error("Method not implemented." + args[0]);
    }
    projectile_destroy(...args: any): void {
        throw new Error("Method not implemented." + args[0]);
    }

    
}