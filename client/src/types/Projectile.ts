import { ProjectileDTO } from "@shared/dtos/ProjectileDTO.ts";
import { Entity } from "./Entity";

export class Projectile extends Entity<ProjectileDTO> {
    get rotation() {
        return this._sprite.rotation;
    }

    public sync(dto: ProjectileDTO) {
        this.position = dto.position;
        this._sprite.rotation = dto.rotation;
    }
}