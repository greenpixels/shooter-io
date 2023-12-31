import { Vector2DTO } from "@shared/dtos/Vector2DTO.ts";
import * as PIXI from 'pixi.js'
import { EntityDTO } from "@shared/dtos/EntityDTO.ts"

export abstract class Entity<T extends EntityDTO> {
    private readonly _id: string;
    protected _sprite : PIXI.Sprite;

    constructor(sprite: PIXI.Sprite, dto: T) {
        this._id = dto.id;
        this._sprite = sprite
        this.sync(dto)
    }

    get id() {
        return this._id;
    }

    get position() {
        return {x: this._sprite.position.x, y: this._sprite.position.y};
    }

    get sprite() {
        return this._sprite;
    }

    set position(position: Vector2DTO) {
        this._sprite.position.x = position.x;
        this._sprite.position.y = position.y;
    }

    public abstract sync(dto : T) : void
}