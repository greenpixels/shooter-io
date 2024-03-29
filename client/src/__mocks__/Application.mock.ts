import { Application, Renderer } from 'pixi.js'

export function ApplicationMock() {
    return {
        stage: {
            sortChildren: vi.fn(),
            addChild: () => {},
        },
    } as unknown as Application<Renderer<HTMLCanvasElement>>
}
