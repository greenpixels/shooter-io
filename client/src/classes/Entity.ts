import { Vector2DTO, EntityDTO } from '@shared/index'
import { Sprite, Container } from 'pixi.js'

export abstract class Entity<T extends EntityDTO> {
    readonly id: string
    readonly sprite: Sprite
    protected lastPosition: Vector2DTO

    constructor(stage: Container, sprite: Sprite, dto: T) {
        this.id = dto.id
        this.sprite = sprite
        this.sprite.texture.source.scaleMode = 'nearest'
        stage.addChild(this.sprite)
        this.lastPosition = this.sprite.position
    }

    get position() {
        return {
            x: this.sprite.position.x - this.sprite.width * this.sprite.anchor._x,
            y: this.sprite.position.y - this.sprite.height * this.sprite.anchor._y,
        }
    }

    set position(position: Vector2DTO) {
        this.sprite.position.x = position.x
        this.sprite.position.y = position.y
    }

    public abstract cleanup(stage: Container): void

    public abstract sync(dto: T): void
}
