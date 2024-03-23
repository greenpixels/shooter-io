import { vi } from "vitest"

// If we don't create empty mocks here, pixi js tries to specify and create a worker on import
const mockSprite = {
    position: {x: 0, y: 0},
    texture : {
        baseTexture: {
            scaleMode: undefined
        }
    },
    anchor: {
        set: vi.fn()
    }
}

vi.mock("pixi.js",  () => {
    return {
        Sprite: {
            from: () => {
                return mockSprite
            },
        },
        SCALE_MODES: {
            NEAREST: "nearest"
        }
    }
})