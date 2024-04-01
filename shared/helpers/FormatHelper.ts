import { Vector2DTO } from '../dtos/Vector2DTO'

export class FormatHelper {
    static DECIMAL_LIMIT = 5
    static limitDecimals(value: number): number {
        return Number(value.toFixed(this.DECIMAL_LIMIT))
    }

    static limitVectorDecimals(vector: Vector2DTO): Vector2DTO {
        return { x: this.limitDecimals(vector.x), y: this.limitDecimals(vector.y) }
    }
}
