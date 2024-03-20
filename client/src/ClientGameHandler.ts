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
        Object.entries(visiblePlayers).forEach(([id, playerDto]) => {
            if(this.players[id] !== undefined) {
                this.players[id].sync(playerDto);
            } else {
                this.playerSpawn({playerDto})
            }
        })

        Object.entries(visibleProjectiles).forEach(([id, projectileDto]) => {
            if(this.projectiles[id] !== undefined) {
                this.projectiles[id].sync(projectileDto);
            } else {
                this.addProjectile(id, visibleProjectiles[id])
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
        Object.keys(affectedPlayers).forEach((id) =>  {
            if(this.players[id] !== undefined) {
                // A player left the game
                console.log("A player has left the game")
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

    addProjectile(id: string, dto: ProjectileDTO) {
        const projectileSprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
        this.game.stage.addChild(projectileSprite)
        const newProjectile = new Projectile(projectileSprite, dto)
        this.projectiles = {...this.projectiles, ...{[id]: newProjectile}}
    }

    removePlayer(id: string) {
        this.game.stage.removeChild(this.players[id].sprite)
        delete this.players[id]
    }

    projectileSpawn(affectedProjectiles : {[key : string] : ProjectileDTO}): void {
        Object.keys(affectedProjectiles).forEach((id)=>  {
            if(this.projectiles[id] === undefined) {
               this.addProjectile(id, affectedProjectiles[id])
              } else {
                console.warn("A projectile has been spawned whos ID already exists on the client. This is extremely unlikely. If this warning shows up often, there is need to debug.")
              }
          })
    }
    projectileDestroy(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args[0]);
    }

    
}