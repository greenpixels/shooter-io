import { AnimatedGIF } from '@pixi/gif'

export class ImportHelper {
    static async loadGif(gifUrl: string) {
        return fetch(gifUrl)
            .then((res) => res.arrayBuffer())
            .then(AnimatedGIF.fromBuffer)
            .then((loadedGif) => {
                return loadedGif
            })
    }
}
