import { Vector2DTO } from '@shared/dtos/Vector2DTO'
import { Container } from 'pixi.js'
import ExplosionImage from '@assets/spr_explosion.gif'
import { AnimatedGIF } from '@pixi/gif'
import { ImportHelper } from '../ImportHelper'

export class ProjectileExplosionEffect {
    private static loadedGif = ImportHelper.loadGif(ExplosionImage)
    localSprite: AnimatedGIF | undefined = undefined

    constructor(stage: Container, position: Vector2DTO) {
        this.instantiateInGame(stage, position)
    }

    async instantiateInGame(stage: Container, position: Vector2DTO) {
        let loadedGif = await ProjectileExplosionEffect.loadedGif!
        this.localSprite = loadedGif.clone()
        this.localSprite.loop = false
        this.localSprite.texture.source.scaleMode = 'nearest'
        this.localSprite.anchor.set(0.5, 0.5)
        this.localSprite.position.set(position.x, position.y)
        this.localSprite.animationSpeed = 2
        this.localSprite.angle = Math.random() * 360
        this.localSprite.zIndex = position.y + 100

        this.localSprite.onComplete = () => {
            stage.removeChild(this.localSprite as Container)
        }
        stage.addChild(this.localSprite)
    }
}
