import {GameEventHandler } from "@shared/GameEventHandler"
import { Socket } from "socket.io-client";
import * as PIXI from 'pixi.js'
import { Player } from "./types/Player";
import { Projectile } from "./types/Projectile";
import { PlayerDTO } from "@shared/dtos/PlayerDTO";
import { ProjectileDTO } from "@shared/dtos/ProjectileDTO";
import { Vector2DTO } from "@shared/dtos/Vector2DTO";

export type ClientGameHandlerProps = {
    socket : Socket,
    game : PIXI.Application<HTMLCanvasElement>,
    canvasSize: Vector2DTO
}

export class ClientGameHandler extends GameEventHandler {
    game : PIXI.Application<HTMLCanvasElement>
    socket : Socket
    players : {[key : string] : Player} = {}
    projectiles : {[key : string] : Projectile} = {}
    moveVector : Vector2DTO = {x: 0, y: 0} 
    canvasSize : Vector2DTO = {x: 0, y: 0}

    constructor(props : ClientGameHandlerProps) {
        super()
        this.game = props.game
        this.socket = props.socket
        this.canvasSize = props.canvasSize;
        this.socket.on(this.EVENT_GAME_TICK, this.gameTick.bind(this))
        this.socket.on(this.EVENT_PLAYER_SPAWN, this.playerSpawn.bind(this))
        this.socket.on(this.EVENT_PLAYER_DEATH, this.playerDeath.bind(this))
        this.socket.on(this.EVENT_PLAYER_LEAVE, this.playerLeave.bind(this))
    }

    handleMouseMoveInput(ev: MouseEvent) {
        if(!this.socket.id) return;
        const clampValue = 2000
        const centeredX = Math.max(-clampValue, Math.min(clampValue, ev.x - this.canvasSize.x/2))
        const centeredY = Math.max(-clampValue, Math.min(clampValue, ev.y - this.canvasSize.y/2))
        let normalizedMX = centeredX/clampValue
        if(Math.abs(normalizedMX) > 1) {
            normalizedMX = Math.sign(normalizedMX)
        }
        let normalizedMY = centeredY/clampValue;
        if(Math.abs(normalizedMY) > 1) {
            normalizedMY = Math.sign(normalizedMY)
        }
        this.playerAim(this.socket.id, {x: normalizedMX,  y: normalizedMY})
    }

    handleKeyboardInput(ev: KeyboardEvent, isKeyDown: boolean) {
        const lastMoveVector = {...this.moveVector}
        const downOffset = Math.sign(Number(isKeyDown) - 0.5)
        const amount = downOffset

        switch(ev.code) {
            case "KeyS":
            case "ArrowDown":
                this.moveVector.y += amount; break;

            case "KeyW":
            case "ArrowUp":
                this.moveVector.y -= amount; break;

            case "KeyA":
            case "ArrowLeft":  
                this.moveVector.x -= amount; break;
                
            case "KeyD":
            case "ArrowRight": 
                this.moveVector.x += amount; break;
          }

          if(Math.abs(this.moveVector.x) > 1) {
            this.moveVector.x = Math.sign(this.moveVector.x);
          }
          if(Math.abs(this.moveVector.y) > 1) {
            this.moveVector.y = Math.sign(this.moveVector.y);
          }
          if(ev.repeat || !this.socket.id || (lastMoveVector.x === this.moveVector.x && lastMoveVector.y === this.moveVector.y)) {
            return
        }
          this.playerMove(this.socket.id, this.moveVector)
    }

    gameTick(visiblePlayers: { [key: string]: PlayerDTO; }, visibleProjectiles: { [key: string]: ProjectileDTO; }): void {
        
        if(!this.socket.id) {
            return
        }
        Object.entries(visiblePlayers).forEach(([id, playerDto]) => {
            if(this.players[id] !== undefined) {
                this.players[id].sync(playerDto);
            } else {
                this.playerSpawn({[playerDto.id]: playerDto})
            }
        })

        Object.entries(visibleProjectiles).forEach(([id, projectileDto]) => {
            if(this.projectiles[id] !== undefined) {
                this.projectiles[id].sync(projectileDto);
            } else {
                this.addProjectile(id, visibleProjectiles[id])
            }
        })
        
        const currentPlayer = this.players[this.socket.id]
        if(currentPlayer) {
            this.game.stage.pivot.set(
                (currentPlayer.position.x + currentPlayer.sprite.width/2) - this.game.screen.width/2,
                (currentPlayer.position.y + currentPlayer.sprite.height/2)  - this.game.screen.height/2
                )
        }
        
        this.game.stage.sortChildren()
    }

    playerMove(socketId: string, moveVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_MOVE, socketId, moveVector)
    }

    playerAim(socketId: string, aimVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_AIM, socketId, aimVector)
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
        this.players = {...this.players, ...{[id]: new Player(this.game.stage, dto)}}
    }

    addProjectile(id: string, dto: ProjectileDTO) {
        const projectileSprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
        const newProjectile = new Projectile(projectileSprite, dto)
        this.projectiles = {...this.projectiles, ...{[id]: newProjectile}}
    }

    removePlayer(id: string) {
        this.players[id].cleanup(this.game.stage)
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