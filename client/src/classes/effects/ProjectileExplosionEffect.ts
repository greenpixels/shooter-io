import { Vector2DTO } from '@shared/dtos/Vector2DTO'
import { Assets, Container } from 'pixi.js'
import ExplosionImage from '@assets/spr_explosion.gif'
import { AnimatedGIF } from '@pixi/gif'

export class ProjectileExplosionEffect {
    sprite: AnimatedGIF | undefined = undefined
    constructor(stage: Container, position: Vector2DTO) {
        Assets.load(ExplosionImage).then((loadedGif: AnimatedGIF) => {
            loadedGif.texture.source.scaleMode = 'nearest'
            loadedGif.loop = false
            this.sprite = loadedGif.clone()
            this.sprite.anchor.set(0.5, 0.5)
            this.sprite.position.set(position.x, position.y)
            this.sprite.animationSpeed = 2
            this.sprite.angle = Math.random() * 360
            this.sprite.zIndex = position.y + 100
            this.sprite.onComplete = () => {
                stage.removeChild(this.sprite as Container)
            }
            stage.addChild(this.sprite)
        })
    }
}
