import { PlayerDTO, Trigonometry, Vector2DTO, Vector2 } from '@shared/index'
import { Entity } from './Entity'
import { Assets, Container, Sprite } from 'pixi.js'
import SniperImage from '@assets/spr_sniper.png'
import PlayerImage from '@assets/spr_human1.png'
export class Player extends Entity<PlayerDTO> {
    readonly gunSprite: Sprite
    aimDirection: Vector2DTO = { x: 0, y: 0 }
    /**
     * This can be used to scale shake or flash effects. Will be set when the player instance got shot or hurt in any way
     */
    impactFactor: number = 0
    /**
     * This can be used to scale recoil or muzzle flash effects. Will be set when the player shoots their gun
     */
    recoilFactor: number = 0

    constructor(stage: Container, dto: PlayerDTO) {
        const playerSprite = new Sprite()
        Assets.load(PlayerImage).then((loadedTexture) => {
            loadedTexture.source.scaleMode = 'nearest'
            playerSprite.texture = loadedTexture
        })
        playerSprite.anchor.set(0.5, 0.5)
        super(stage, playerSprite, dto)
        this.gunSprite = new Sprite()
        Assets.load(SniperImage).then((loadedTexture) => {
            loadedTexture.source.scaleMode = 'nearest'
            this.gunSprite.texture = loadedTexture
        })
        this.gunSprite.anchor.set(0, 0.5)

        stage.addChild(this.gunSprite)
        this.sync(dto)
    }

    public sync(dto: PlayerDTO) {
        this.lastPosition = this.position
        this.position = dto.position
        this.sprite.pivot.set(Math.random() * this.impactFactor, Math.random() * this.impactFactor)
        this.sprite.zIndex = this.position.y
        const lastStepDistance = Math.round(Math.sign(this.position.x - this.lastPosition.x))
        if (lastStepDistance !== 0) {
            this.sprite.scale.x = lastStepDistance
        }
        this.aimDirection = dto.aimDirection
        const angle = new Vector2(this.aimDirection).angle()
        this.gunSprite.rotation = Trigonometry.angleToRadians(angle)
        this.gunSprite.zIndex = this.sprite.zIndex + Math.sign(this.aimDirection.y) / 2
        if (this.aimDirection.x !== 0) this.gunSprite.scale.y = Math.sign(this.aimDirection.x)

        const gunDistance = 9

        this.gunSprite.position = {
            x:
                this.position.x +
                this.sprite.width / 2 +
                Trigonometry.lengthdirX(gunDistance - Math.min(gunDistance, this.recoilFactor * gunDistance), angle),
            y:
                this.position.y +
                this.sprite.height / 2 +
                Trigonometry.lengthdirY(gunDistance - Math.min(gunDistance, this.recoilFactor * gunDistance), angle),
        }
        this.impactFactor *= 0.85
        this.recoilFactor *= 0.75
    }

    public cleanup(stage: Container): void {
        stage.removeChild(this.sprite)
        stage.removeChild(this.gunSprite)
    }
}
