import { AnimatedGIF } from '@pixi/gif'
import { Assets, Sprite, Texture } from 'pixi.js'
import PlayerWalkAnimation from '@assets/spr_human_walk.gif'
import BulletSprite from '@assets/spr_bullet.png'
import GroundSprite from '@assets/spr_ground.png'
import GunSniperSprite from '@assets/spr_sniper.png'
import ExplosionImageAnimation from '@assets/spr_explosion.gif'
import PlayerIdleSprite from '@assets/spr_human1.png'
import { Vector2DTO } from '@shared/index'

const GET_BEFORE_IMPORT_ERROR =
    "Getting the sprite has failed. Please use 'loadAllSprites' at the beginning of the game before using 'getSpriteAsset'."

export type TSpriteAssetNames = {
    gunSniper: string
    playerWalk: string
    playerIdle: string
    bullet: string
    groundSprite: string
    explosionImage: string
}

export interface IGameAssets {
    sprites: { [key in keyof TSpriteAssetNames]: AnimatedGIF | Texture }
}

export interface ISpriteOptions {
    anchor?: Vector2DTO
}

export class AssetHelper {
    private static assets: IGameAssets | undefined

    /**
     * This function will be called at the beginning of the game to pre-load all sprites
     */
    static async loadAllSprites() {
        this.assets = {
            sprites: {
                gunSniper: await Assets.load(GunSniperSprite),
                playerWalk: await this.loadGif(PlayerWalkAnimation),
                playerIdle: await Assets.load(PlayerIdleSprite),
                bullet: await Assets.load(BulletSprite),
                groundSprite: await Assets.load(GroundSprite),
                explosionImage: await this.loadGif(ExplosionImageAnimation),
            },
        }
    }

    static getSpriteAsset(key: keyof TSpriteAssetNames, options?: ISpriteOptions): Sprite | AnimatedGIF {
        let anchorValue: Vector2DTO = { x: 0.5, y: 0.5 }
        if (this.assets) {
            const asset = this.assets.sprites[key]
            let returnValue

            if ((asset as AnimatedGIF)['clone'] !== undefined) {
                returnValue = (asset as AnimatedGIF).clone()
                ;(returnValue as AnimatedGIF).dirty = true
            } else {
                returnValue = Sprite.from(asset as Texture)
            }

            if (options) {
                anchorValue = options.anchor ?? anchorValue
            }

            returnValue.anchor.set(anchorValue.x, anchorValue.y)
            returnValue.texture.source.scaleMode = 'nearest'
            return returnValue
        } else {
            throw Error(GET_BEFORE_IMPORT_ERROR)
        }
    }

    static async loadGif(gifUrl: string) {
        return fetch(gifUrl)
            .then((res) => res.arrayBuffer())
            .then(AnimatedGIF.fromBuffer)
    }
}
