import { Trigonometry } from './Trigonometry'
describe('Test angle to radians functionnality', () => {
    test('An angle of 180 should be PI radians', () => {
        expect(Trigonometry.angleToRadians(180)).toBeCloseTo(Math.PI)
    })

    test('An angle of 360 should be zero radians', () => {
        expect(Trigonometry.angleToRadians(360)).toBe(0)
    })

    test('An angle of 0 should be the same as an angle of 360', () => {
        expect(Trigonometry.angleToRadians(0)).toBe(Trigonometry.angleToRadians(360))
    })

    test('An angle close to 360 should be close to to 2PI radians', () => {
        expect(Trigonometry.angleToRadians(359.999)).toBeCloseTo(Math.PI * 2)
    })

    test('An angle close to 360 should be close to to 2PI radians', () => {
        expect(Trigonometry.angleToRadians(359.999)).toBeCloseTo(Math.PI * 2)
    })

    test('A negative value (-45) should be the same as (315)', () => {
        expect(Trigonometry.angleToRadians(-45)).toBeCloseTo(Trigonometry.angleToRadians(315))
    })

    test('A negative value (-180) should be the same as (180)', () => {
        expect(Trigonometry.angleToRadians(-180)).toBeCloseTo(Trigonometry.angleToRadians(180))
    })

    test('A negative value (-1) should be the same as (359)', () => {
        expect(Trigonometry.angleToRadians(-1)).toBeCloseTo(Trigonometry.angleToRadians(359))
    })

    test('A value exceeding 360 by 180 should be the same as (180)', () => {
        expect(Trigonometry.angleToRadians(360 + 180)).toBeCloseTo(Trigonometry.angleToRadians(180))
    })

    test('A value exceeding 152 by 180 should be the same as (152)', () => {
        expect(Trigonometry.angleToRadians(360 + 152)).toBeCloseTo(Trigonometry.angleToRadians(152))
    })

    test('A negative value exceeding -360 by 50 should be the same as (310)', () => {
        expect(Trigonometry.angleToRadians(-360 - 50)).toBeCloseTo(Trigonometry.angleToRadians(310))
    })
})

describe('Test lengthdir_x functionnality', () => {
    test('An angle of 0, 360 and 720 should all return the same value', () => {
        const arbitaryLength = 10
        const resultOf0Angle = Trigonometry.lengthdirX(arbitaryLength, 0)
        const resultOf360Angle = Trigonometry.lengthdirX(arbitaryLength, 360)
        const resultOf720Angle = Trigonometry.lengthdirX(arbitaryLength, 720)
        expect(resultOf0Angle).toBeCloseTo(resultOf360Angle)
        expect(resultOf360Angle).toBeCloseTo(resultOf720Angle)
    })
})

describe('Test lengthdir_y functionnality', () => {
    test('An angle of 0, 360 and 720 should all return the same value', () => {
        const arbitaryLength = 10
        const resultOf0Angle = Trigonometry.lengthdirY(arbitaryLength, 0)
        const resultOf360Angle = Trigonometry.lengthdirY(arbitaryLength, 360)
        const resultOf720Angle = Trigonometry.lengthdirY(arbitaryLength, 720)
        expect(resultOf0Angle).toBeCloseTo(resultOf360Angle)
        expect(resultOf360Angle).toBeCloseTo(resultOf720Angle)
    })
})
