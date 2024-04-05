import { Vector2DTO } from '@shared/index'
import { Container } from 'pixi.js'

import { AssetHelper } from '../AssetHelper'
import { AnimatedGIF } from '@pixi/gif'

export class ProjectileExplosionEffect {
    constructor(stage: Container, position: Vector2DTO) {
        const sprite = AssetHelper.getSpriteAsset('explosionImage')! as AnimatedGIF
        sprite.position.set(position.x, position.y)
        sprite.animationSpeed = 2
        sprite.loop = false
        sprite.angle = Math.random() * 360
        sprite.zIndex = position.y + 100
        stage.addChild(sprite)
        sprite.onComplete = () => stage.removeChild(sprite)
    }
}
