export function lengthdir_x(len: number, angle: number) {
    return Math.cos(angle_to_radians(angle)) * len
}

export function lengthdir_y(len: number, angle: number) {
    return Math.sin(angle_to_radians(angle)) * len
}

export function angle_to_radians(angle: number) {
    let real_angle = angle % 360
    if(Math.sign(real_angle) === -1) {
        real_angle = real_angle + 360
    }
    return (real_angle / 180) * Math.PI
}