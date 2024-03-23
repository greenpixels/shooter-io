export function angleToRadians(angle: number) {
    let realAngle = angle % 360
    if(Math.sign(realAngle) === -1) {
        realAngle = realAngle + 360
    }
    return (realAngle / 180) * Math.PI
}

export function lengthdirY(len: number, angle: number) {
    return Math.sin(angleToRadians(angle)) * len
}

export function lengthdirX(len: number, angle: number) {
    return Math.cos(angleToRadians(angle)) * len
}
