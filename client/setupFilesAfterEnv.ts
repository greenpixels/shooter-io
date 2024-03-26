import { vi } from 'vitest'
import { Sprite } from 'pixi.js'

// If we don't create empty mocks here, pixi js tries to specify and create a worker on import
const mockTexture = {
    source: {
        scaleMode: undefined,
    },
}

vi.mock('pixi.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual: any = await importOriginal()

    return {
        Sprite: actual.Sprite as Sprite,
        Assets: {
            load: async () => mockTexture,
        },
    }
})
