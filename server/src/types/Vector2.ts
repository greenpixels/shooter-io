import {Vector2DTO} from "@shared/dtos/Vector2DTO";

export class Vector2 implements Vector2DTO {
    private _x: number;
    private _y: number;

    constructor(vector2DTO: Vector2DTO) {
        this._x = vector2DTO.x;
        this._y = vector2DTO.y;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    public length(): number {
        return Math.sqrt(this._x ** 2 + this._y ** 2);
    }

    public add(vector: Vector2DTO): void {
        this._x += vector.x;
        this._y += vector.y;
    }

    public sub(vector: Vector2DTO): void {
        this._x -= vector.x;
        this._y -= vector.y;
    }

    public mul(vector: Vector2DTO): void {
        this._x *= vector.x;
        this._y *= vector.y;
    }

    public mul_scalar(scalar: number): void {
        this._x *= scalar;
        this._y *= scalar;
    }

    public div(vector: Vector2DTO): void {
        this._x /= vector.x;
        this._y /= vector.y;
    }

    public div_scalar(scalar: number): void {
        this._x /= scalar;
        this._y /= scalar;
    }

    public normalize(): void {
        const length = this.length();
        this._x /= length;
        this._y /= length;
    }

    public equals(vector: Vector2DTO): boolean {
        return this._x === vector.x && this._y === vector.y;
    }

    public dto(): Vector2DTO {
        return {
            x: this._x,
            y: this._y
        }
    }
}
