import { ProjectileDTO, Vector2, Trigonometry } from '@shared/index'
import { Entity } from './Entity'
import { Assets, Container, Sprite } from 'pixi.js'
import BulletImage from '@assets/spr_bullet.png'

export class Projectile extends Entity<ProjectileDTO> {
    constructor(stage: Container, dto: ProjectileDTO) {
        const projectileSprite = new Sprite()
        Assets.load(BulletImage).then((loadedTexture) => {
            loadedTexture.source.scaleMode = 'nearest'
            projectileSprite.texture = loadedTexture
        })
        projectileSprite.anchor.set(0.5, 0.5)
        super(stage, projectileSprite, dto)
        this.sync(dto)
    }

    get rotation() {
        return this.sprite.rotation
    }

    public sync(dto: ProjectileDTO) {
        this.position = dto.position
        const angle = new Vector2(dto.direction).angle()
        this.sprite.rotation = Trigonometry.angleToRadians(angle)
    }

    public cleanup(stage: Container): void {
        stage.removeChild(this.sprite)
    }
}
