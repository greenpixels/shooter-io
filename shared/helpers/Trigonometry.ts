export class Trigonometry {
    static angleToRadians(angle: number) {
        let realAngle = angle % 360
        if (Math.sign(realAngle) === -1) {
            realAngle = realAngle + 360
        }
        return (realAngle / 180) * Math.PI
    }

    static lengthdirY(len: number, angle: number) {
        return Math.sin(Trigonometry.angleToRadians(angle)) * len
    }

    static lengthdirX(len: number, angle: number) {
        return Math.cos(Trigonometry.angleToRadians(angle)) * len
    }
}
