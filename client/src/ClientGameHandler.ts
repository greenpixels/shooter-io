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
        this.socket.on(this.EVENT_GAME_TICK, this.gameTick.bind(this))
        this.socket.on(this.EVENT_PLAYER_SPAWN, this.playerSpawn.bind(this))
        this.socket.on(this.EVENT_PLAYER_DEATH, this.playerDeath.bind(this))
        this.socket.on(this.EVENT_PLAYER_LEAVE, this.playerLeave.bind(this))
    }

    handleInput(ev: KeyboardEvent, isKeyDown: boolean) {
        if(ev.repeat || !this.socket.id) {
            return
        }
        switch(ev.code) {
            case "KeyS":
            case "ArrowDown": this.playerMove(this.socket.id, MOVE_DIRECTION.DOWN, isKeyDown); break;
            case "KeyW":
            case "ArrowUp": this.playerMove(this.socket.id, MOVE_DIRECTION.UP, isKeyDown); break;
            case "KeyA":
            case "ArrowLeft": this.playerMove(this.socket.id, MOVE_DIRECTION.LEFT, isKeyDown); break;
            case "KeyD":
            case "ArrowRight": this.playerMove(this.socket.id, MOVE_DIRECTION.RIGHT, isKeyDown); break;
          }
    }

    gameTick(visiblePlayers: { [key: string]: PlayerDTO; }, visibleProjectiles: { [key: string]: ProjectileDTO; }): void {
        Object.entries(visiblePlayers).forEach(([id, player]) => {
            if(this.players[id] !== undefined) {
                this.players[id].sync(player);
            } else {
                this.addPlayer(id, visiblePlayers[id])
            }
          
        })

        Object.entries(visibleProjectiles).forEach(([id, projectile]) => {
            if(this.projectiles[id] !== undefined) {
                this.projectiles[id].sync(projectile);
            }
        })
    }

    playerMove(socketId: string, direction: MOVE_DIRECTION, isKeyDown: boolean): void {
        this.socket.emit(this.EVENT_PLAYER_MOVE, socketId, direction, isKeyDown)
    }

    playerDeath(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args[0]);
    }

    playerSpawn(affectedPlayers : {[key : string] : PlayerDTO}): void {
          Object.keys(affectedPlayers).forEach((id)=>  {
            if(this.players[id] === undefined) {
                // A player that was not in the game before has joined
               this.addPlayer(id, affectedPlayers[id])
              } else {
                // A player respawned
                this.players[id].sync(affectedPlayers[id])
              }
          })
    }

    playerLeave(affectedPlayers: { [key: string]: PlayerDTO; }): void {
        console.log("Trying to remove player")
        Object.keys(affectedPlayers).forEach((id) =>  {
            if(this.players[id] !== undefined) {
                // A player left the game
                console.log("A player was removed")
                this.removePlayer(id)
              }
          })
    }

    addPlayer(id: string, dto: PlayerDTO) {
        const playerSprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
        this.game.stage.addChild(playerSprite)
        const newPlayer = new Player(playerSprite, dto)
        this.players = {...this.players, ...{[id]: newPlayer}}
    }

    removePlayer(id: string) {
        this.game.stage.removeChild(this.players[id].sprite)
        delete this.players[id]
    }

    projectileSpawn(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args[0]);
    }
    projectileDestroy(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args[0]);
    }

    
}