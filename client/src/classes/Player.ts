import { PlayerDTO, Trigonometry, Vector2DTO, Vector2, GunInfo } from '@shared/index'
import { Entity } from './Entity'
import { Container, Sprite } from 'pixi.js'
import { AssetHelper, TSpriteAssetNames } from './AssetHelper'
import { AnimatedGIF } from '@pixi/gif'

export type TPlayerState = 'idle' | 'moving'
export class Player extends Entity<PlayerDTO> {
    gunSprite: Sprite | undefined
    private state: TPlayerState = 'idle'
    private container
    level
    score
    aimDirection: Vector2DTO = { x: 0, y: 0 }
    /**
     * This can be used to scale shake or flash effects. Will be set when the player instance got shot or hurt in any way
     */
    impactFactor: number = 0
    /**
     * This can be used to scale recoil or muzzle flash effects. Will be set when the player shoots their gun
     */
    recoilFactor: number = 0

    constructor(container: Container, dto: PlayerDTO) {
        const playerSprite = AssetHelper.getSpriteAsset('playerIdle')!
        super(container, playerSprite, dto)
        this.container = container
        this.level = dto.level
        this.score = dto.score
        this.setGunSpriteBasedOnLevel()
        this.sync(dto)
    }

    setGunSpriteBasedOnLevel() {
        const gunInfo = GunInfo[this.level - 1]
        if (gunInfo) {
            if (this.gunSprite) {
                this.container.removeChild(this.gunSprite)
            }
            const gunSpriteOptions = { anchor: { x: 0, y: 0.5 } }
            const newGunSprite = AssetHelper.getSpriteAsset(
                `gun${gunInfo.key}` as keyof TSpriteAssetNames,
                gunSpriteOptions
            )
            this.gunSprite = newGunSprite
            this.container.addChild(this.gunSprite)
        }
    }

    public sync(dto: PlayerDTO) {
        this.lastPosition = this.position
        this.position = dto.position
        this.score = dto.score
        const previousLevel = this.level
        this.level = dto.level
        if (previousLevel != this.level) {
            this.setGunSpriteBasedOnLevel()
        }

        if (!this.isStandingStill() && this.state === 'idle') {
            this.switchSprite(AssetHelper.getSpriteAsset('playerWalk'))
            this.state = 'moving'
        }

        if (this.isStandingStill() && this.state === 'moving') {
            this.switchSprite(AssetHelper.getSpriteAsset('playerIdle'))
            this.state = 'idle'
        }

        switch (this.state) {
            case 'moving':
                this.stateMoving()
                break
            case 'idle':
                this.stateIdle()
                break
        }

        this.syncWeapon(dto)
        this.sprite.pivot.set(Math.random() * this.impactFactor, Math.random() * this.impactFactor)
        this.sprite.zIndex = this.position.y
        this.impactFactor *= 0.85
        this.recoilFactor *= 0.75
    }

    private stateMoving() {
        const lastStepDistance = Math.round(Math.sign(this.position.x - this.lastPosition.x))
        if (lastStepDistance !== 0) {
            this.sprite.scale.x = lastStepDistance
        }
    }

    private stateIdle() {}

    public isStandingStill() {
        return this.lastPosition.x === this.position.x && this.lastPosition.y === this.position.y
    }

    private syncWeapon(dto: PlayerDTO) {
        if (!this.gunSprite) return
        this.aimDirection = dto.aimDirection
        const angle = new Vector2(this.aimDirection).angle()
        const gunDistance = 9
        this.gunSprite.rotation = Trigonometry.angleToRadians(angle)
        this.gunSprite.zIndex = this.sprite.zIndex + Math.sign(this.aimDirection.y) / 2
        if (this.aimDirection.x !== 0) this.gunSprite.scale.y = Math.sign(this.aimDirection.x)
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
    }

    public switchSprite(newSprite: Sprite | AnimatedGIF) {
        if (this.sprite.uid === newSprite.uid) return
        const replacement = newSprite
        replacement.position = this.sprite.position
        replacement.scale.x = this.sprite.scale.x
        this.container.addChild(replacement)
        this.container.removeChild(this.sprite)
        this.sprite = replacement
    }

    public cleanup(): void {
        this.container.removeChild(this.sprite)
        if (this.gunSprite) {
            this.container.removeChild(this.gunSprite)
        }
    }
}
