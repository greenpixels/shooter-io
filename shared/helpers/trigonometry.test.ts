import { angleToRadians, lengthdirX, lengthdirY } from "./trigonometry"

describe("Test angle to radians functionnality", () => {
    test("An angle of 180 should be PI radians", () => {
        expect(angleToRadians(180)).toBeCloseTo(Math.PI)
    })

    test("An angle of 360 should be zero radians", () => {
        expect(angleToRadians(360)).toBe(0)
    })

    test("An angle of 0 should be the same as an angle of 360", () => {
        expect(angleToRadians(0)).toBe(angleToRadians(360))
    })

    test("An angle close to 360 should be close to to 2PI radians", () => {
        expect(angleToRadians(359.999)).toBeCloseTo(Math.PI * 2)
    })

    test("An angle close to 360 should be close to to 2PI radians", () => {
        expect(angleToRadians(359.999)).toBeCloseTo(Math.PI * 2)
    })

    test("A negative value (-45) should be the same as (315)", () => {
        expect(angleToRadians(-45)).toBeCloseTo(angleToRadians(315))
    })

    test("A negative value (-180) should be the same as (180)", () => {
        expect(angleToRadians(-180)).toBeCloseTo(angleToRadians(180))
    })

    test("A negative value (-1) should be the same as (359)", () => {
        expect(angleToRadians(-1)).toBeCloseTo(angleToRadians(359))
    })

    test("A value exceeding 360 by 180 should be the same as (180)", () => {
        expect(angleToRadians(360 + 180)).toBeCloseTo(angleToRadians(180))
    })

    test("A value exceeding 152 by 180 should be the same as (152)", () => {
        expect(angleToRadians(360 + 152)).toBeCloseTo(angleToRadians(152))
    })

    test("A negative value exceeding -360 by 50 should be the same as (310)", () => {
        expect(angleToRadians(-360 - 50)).toBeCloseTo(angleToRadians(310))
    })
})

describe("Test lengthdir_x functionnality", () => {
    test("An angle of 0, 360 and 720 should all return the same value", () => {
        const arbitaryLength = 10
        const resultOf0Angle = lengthdirX(arbitaryLength, 0);
        const resultOf360Angle = lengthdirX(arbitaryLength, 360);
        const resultOf720Angle = lengthdirX(arbitaryLength, 720);
        expect(resultOf0Angle).toBeCloseTo(resultOf360Angle)
        expect(resultOf360Angle).toBeCloseTo(resultOf720Angle)
    })
})

describe("Test lengthdir_y functionnality", () => {
    test("An angle of 0, 360 and 720 should all return the same value", () => {
        const arbitaryLength = 10
        const resultOf0Angle = lengthdirY(arbitaryLength, 0);
        const resultOf360Angle = lengthdirY(arbitaryLength, 360);
        const resultOf720Angle = lengthdirY(arbitaryLength, 720);
        expect(resultOf0Angle).toBeCloseTo(resultOf360Angle)
        expect(resultOf360Angle).toBeCloseTo(resultOf720Angle)
    })
})