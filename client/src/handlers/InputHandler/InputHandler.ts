import { Vector2DTO } from '@shared/index'

export class InputHandler {
    moveVector: Vector2DTO = { x: 0, y: 0 }
    canvasSize: Vector2DTO

    constructor(canvasSize: Vector2DTO) {
        this.canvasSize = canvasSize
    }

    handleKeyboardInput(event: KeyboardEvent, isKeyDown: boolean, onMoveInput: (moveVector: Vector2DTO) => void) {
        const lastMoveVector = { ...this.moveVector }
        const downOffset = Math.sign(Number(isKeyDown) - 0.5)
        const amount = downOffset

        switch (event.code) {
            case 'KeyS':
            case 'ArrowDown':
                event.preventDefault()
                this.moveVector.y += amount
                break

            case 'KeyW':
            case 'ArrowUp':
                event.preventDefault()
                this.moveVector.y -= amount
                break

            case 'KeyA':
            case 'ArrowLeft':
                event.preventDefault()
                this.moveVector.x -= amount
                break

            case 'KeyD':
            case 'ArrowRight':
                event.preventDefault()
                this.moveVector.x += amount
                break

            case 'Tab':
                event.preventDefault()
                break
        }

        if (Math.abs(this.moveVector.x) > 1) {
            this.moveVector.x = Math.sign(this.moveVector.x)
        }
        if (Math.abs(this.moveVector.y) > 1) {
            this.moveVector.y = Math.sign(this.moveVector.y)
        }
        if (event.repeat || (lastMoveVector.x === this.moveVector.x && lastMoveVector.y === this.moveVector.y)) {
            return
        }
        onMoveInput(this.moveVector)
    }

    handleMouseMoveInput(ev: MouseEvent, onAimInput: (moveVector: Vector2DTO) => void) {
        const clampValue = this.canvasSize.x * 2
        const centeredX = Math.max(-clampValue, Math.min(clampValue, ev.x - this.canvasSize.x / 2))
        const centeredY = Math.max(-clampValue, Math.min(clampValue, ev.y - this.canvasSize.y / 2))
        let normalizedMX = centeredX / clampValue
        if (Math.abs(normalizedMX) > 1) {
            normalizedMX = Math.sign(normalizedMX)
        }
        let normalizedMY = centeredY / clampValue
        if (Math.abs(normalizedMY) > 1) {
            normalizedMY = Math.sign(normalizedMY)
        }
        onAimInput({ x: normalizedMX, y: normalizedMY })
    }

    handleMouseClickInput(ev: MouseEvent, onShootInput: () => void): void {
        ev.preventDefault()
        onShootInput()
    }
}
