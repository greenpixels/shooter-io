import { Vector2DTO } from '@shared/index'
import { Container } from 'pixi.js'
import ExplosionImage from '@assets/spr_explosion.gif'
import { ImportHelper } from '../ImportHelper'

export class ProjectileExplosionEffect {
    private static loadedGif = ImportHelper.loadGif(ExplosionImage)

    constructor(stage: Container, position: Vector2DTO) {
        this.instantiateInGame(stage, position)
    }

    async instantiateInGame(stage: Container, position: Vector2DTO) {
        const loadedGif = await ProjectileExplosionEffect.loadedGif!
        const sprite = loadedGif.clone()
        sprite.loop = false
        sprite.texture.source.scaleMode = 'nearest'
        sprite.anchor.set(0.5, 0.5)
        sprite.position.set(position.x, position.y)
        sprite.animationSpeed = 2
        sprite.angle = Math.random() * 360
        sprite.zIndex = position.y + 100

        sprite.onComplete = () => {
            stage.removeChild(sprite)
        }
        stage.addChild(sprite)
    }
}
