import { PlayerDTO } from "@shared/dtos/PlayerDTO.ts";
import {Entity} from "./Entity"
import { Vector2DTO } from "@shared/dtos/Vector2DTO";
import { Vector2 } from "@shared/classes/Vector2";
import {angleToRadians, lengthdirX, lengthdirY} from "@shared/helpers/trigonometry"
import { Container, DisplayObject, SCALE_MODES, Sprite } from "pixi.js";
import SniperImage from "../assets/spr_sniper.png"
import PlayerImage from "../assets/spr_human1.png"
export class Player extends Entity<PlayerDTO> {
    readonly gunSprite : Sprite = Sprite.from(SniperImage)
    aimDirection: Vector2DTO = {x: 0, y: 0};
    

    constructor(stage: Container<DisplayObject>, dto: PlayerDTO) {
        const playerSprite = Sprite.from(PlayerImage)
        playerSprite.anchor.set(0.5, 0.5)
        super(stage, playerSprite, dto) 

        this.gunSprite = Sprite.from(SniperImage)
        this.gunSprite.anchor.set(0, 0.5)
        this.gunSprite.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST
        
        stage.addChild(this.gunSprite)
        this.sync(dto)
    }

    public sync(dto: PlayerDTO) {
        this.lastPosition = this.position;
        this.position = dto.position;
        this.sprite.zIndex = this.position.y
        const lastStepDistance = Math.round(Math.sign(this.position.x - this.lastPosition.x))
        if(lastStepDistance !== 0) {
            this.sprite.scale.x = lastStepDistance
        }
        this.aimDirection = dto.aimDirection
        const angle = new Vector2(this.aimDirection).angle()
        this.gunSprite.rotation = angleToRadians(angle); 
        this.gunSprite.zIndex = this.sprite.zIndex + Math.sign(this.aimDirection.y)/2
        if(this.aimDirection.x !== 0) this.gunSprite.scale.y = Math.sign(this.aimDirection.x)
        
        this.gunSprite.position = {
            x: this.position.x + this.sprite.width/2 + lengthdirX(5, angle),
            y: this.position.y + this.sprite.height/2 + lengthdirY(5, angle)
        }
    }

    public cleanup(stage: Container<DisplayObject>): void {
        console.log("Trying to remove")
        stage.removeChild(this.sprite)
        stage.removeChild(this.gunSprite)
    }
}