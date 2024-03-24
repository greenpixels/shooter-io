import { ProjectileDTO } from "@shared/dtos/ProjectileDTO.ts";
import { Entity } from "./Entity";
import { Container, DisplayObject, Sprite } from "pixi.js";
import BulletImage from "../assets/spr_bullet.png"
import { angleToRadians } from "@shared/helpers/trigonometry";
import { Vector2 } from "@shared/classes/Vector2";

export class Projectile extends Entity<ProjectileDTO> {
    constructor(stage: Container<DisplayObject>, dto: ProjectileDTO) {
        const projectileSprite = Sprite.from(BulletImage)
        projectileSprite.anchor.set(0.5, 0.5)
        super(stage, projectileSprite, dto)
        this.sync(dto)
    }

    get rotation() {
        return this.sprite.rotation;
    }

    public sync(dto: ProjectileDTO) {
        this.position = dto.position;
        const angle = new Vector2(dto.direction).angle()
        this.sprite.rotation = angleToRadians(angle); 
    }

    public cleanup(stage: Container<DisplayObject>): void {
        stage.removeChild(this.sprite)
    }
}