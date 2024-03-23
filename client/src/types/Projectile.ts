import { ProjectileDTO } from "@shared/dtos/ProjectileDTO.ts";
import { Entity } from "./Entity";
import { Container, DisplayObject, Sprite } from "pixi.js";

export class Projectile extends Entity<ProjectileDTO> {
    

    constructor(stage: Container<DisplayObject>, dto: ProjectileDTO) {
        const projectileSprite = Sprite.from('https://pixijs.com/assets/bunny.png')
        super(stage, projectileSprite, dto) 
    }

    get rotation() {
        return this.sprite.rotation;
    }

    public sync(dto: ProjectileDTO) {
        this.position = dto.position;
        this.sprite.rotation = dto.rotation;
    }

    public cleanup(stage: Container<DisplayObject>): void {
        stage.removeChild(this.sprite)
    }
}