import { AnimatedGIF } from '@pixi/gif'
import { Assets, Sprite, Texture } from 'pixi.js'
import PlayerWalkAnimation from '@assets/spr_human_walk.gif'
import BulletSprite from '@assets/spr_bullet.png'
import GroundSprite from '@assets/spr_ground.png'
import ExplosionImageAnimation from '@assets/spr_explosion.gif'
import PlayerIdleSprite from '@assets/spr_human1.png'
import { Vector2DTO } from '@shared/index'
import ArrowSprite from '@assets/spr_arrow.png'
import AK47Sprite from '@assets/guns/spr_ak47.png'
import LugerSprite from '@assets/guns/spr_luger.png'
import M15Sprite from '@assets/guns/spr_m15.png'
import M24Sprite from '@assets/guns/spr_m24.png'
import M92Sprite from '@assets/guns/spr_m92.png'
import MP5Sprite from '@assets/guns/spr_mp5.png'
import RevolverSprite from '@assets/guns/spr_revolver.png'
import ShotgunSprite from '@assets/guns/spr_shotgun.png'
import CrownSprite from '@assets/spr_crown.png'

const GET_BEFORE_IMPORT_ERROR =
    "Getting the sprite has failed. Please use 'loadAllSprites' at the beginning of the game before using 'getSpriteAsset'."

export type TSpriteAssetNames = {
    playerWalk: string
    playerIdle: string
    bullet: string
    groundSprite: string
    explosionImage: string
    arrowSprite: string

    gunAK47: string
    gunLuger: string
    gunM15: string
    gunM24: string
    gunM92: string
    gunMP5: string
    gunRevolver: string
    gunShotgun: string
    crownSprite: string
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
                arrowSprite: await Assets.load(ArrowSprite),
                playerWalk: await this.loadGif(PlayerWalkAnimation),
                playerIdle: await Assets.load(PlayerIdleSprite),
                bullet: await Assets.load(BulletSprite),
                groundSprite: await Assets.load(GroundSprite),
                explosionImage: await this.loadGif(ExplosionImageAnimation),
                crownSprite: await Assets.load(CrownSprite),
                gunAK47: await Assets.load(AK47Sprite),
                gunM15: await Assets.load(M15Sprite),
                gunLuger: await Assets.load(LugerSprite),
                gunM24: await Assets.load(M24Sprite),
                gunM92: await Assets.load(M92Sprite),
                gunMP5: await Assets.load(MP5Sprite),
                gunRevolver: await Assets.load(RevolverSprite),
                gunShotgun: await Assets.load(ShotgunSprite),
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
