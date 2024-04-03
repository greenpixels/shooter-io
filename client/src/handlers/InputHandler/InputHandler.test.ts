import { Vector2DTO } from '@shared/index'
import { InputHandler } from './InputHandler'
const MOCK_SCREEN_SIZE = { x: 1000, y: 1000 }

describe('Testing InputHandler: Movement', () => {
    generateMovementTest(['KeyS', 'ArrowDown'], { x: 0, y: 1 })
    generateMovementTest(['KeyW', 'ArrowUp'], { x: 0, y: -1 })
    generateMovementTest(['KeyA', 'ArrowLeft'], { x: -1, y: 0 })
    generateMovementTest(['KeyD', 'ArrowRight'], { x: 1, y: 0 })
})

function generateMovementTest(keyCodes: Array<string>, expectedVector: Vector2DTO) {
    keyCodes.forEach((keyCode) => {
        const inputHandler = new InputHandler(MOCK_SCREEN_SIZE)
        const onMoveMock = vi.fn()
        test(`Holding ${keyCode} should set the move vector to be ${JSON.stringify(expectedVector)}`, () => {
            inputHandler.handleKeyboardInput(createMockKeyEvent(keyCode, false), true, (moveVector) =>
                onMoveMock(moveVector)
            )
            expect(onMoveMock).toBeCalledWith(expectedVector)
        })
    })
}

describe('Testing InputHandler: Aiming', () => {
    const vector = [
        { x: 100, y: -100 }, // Upper Right
        { x: -100, y: 100 }, // Lower Left
        { x: -100, y: -100 }, // Upper Left
        { x: 100, y: 100 }, // Lower Right
        { x: 0, y: -100 }, // Up
        { x: 0, y: 100 }, // Down
        { x: 100, y: 0 }, // Right
        { x: -100, y: 0 }, // Left
    ]
    vector.forEach((vector) => {
        generateMouseMoveTest(vector)
    })
})

function generateMouseMoveTest(mouseCenterOffset: Vector2DTO) {
    const inputHandler = new InputHandler(MOCK_SCREEN_SIZE)
    const onAimMock = vi.fn()
    inputHandler.handleMouseMoveInput(
        createMockMouseMoveEvent(
            MOCK_SCREEN_SIZE.x / 2 + mouseCenterOffset.x,
            MOCK_SCREEN_SIZE.y / 2 + mouseCenterOffset.y
        ),
        (vector) => onAimMock(vector)
    )
    const equalGreaterOrLesserToZeroAsString = (value: number) => {
        switch (Math.sign(value)) {
            case 0:
                return 'Zero'
            case -1:
                return 'Lower Than Zero'
            case 1:
                return 'Greater Than Zero'
        }
    }
    test(`Center of Screen + ${JSON.stringify(mouseCenterOffset)} should result in a vector that is {x: <${equalGreaterOrLesserToZeroAsString(mouseCenterOffset.x)}> y: <${equalGreaterOrLesserToZeroAsString(mouseCenterOffset.y)}}>`, () => {
        expect(onAimMock.mock.calls.length).toBe(1)
        const vectorParameter: Vector2DTO = onAimMock.mock.calls[0][0]
        expect(Math.sign(vectorParameter.x)).toBe(Math.sign(mouseCenterOffset.x))
        expect(Math.sign(vectorParameter.y)).toBe(Math.sign(mouseCenterOffset.y))
    })
}

function createMockKeyEvent(keyCode: string, repeat: boolean) {
    return { code: keyCode, repeat: repeat, preventDefault: () => {} } as KeyboardEvent
}

function createMockMouseMoveEvent(x: number, y: number) {
    return { x: x, y: y } as MouseEvent
}
