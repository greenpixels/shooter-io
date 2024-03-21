import { angle_to_radians, lengthdir_x, lengthdir_y } from "./trigonometry"

describe("Test angle to radians functionnality", () => {
    test("An angle of 180 should be PI radians", () => {
        expect(angle_to_radians(180)).toBeCloseTo(Math.PI)
    })

    test("An angle of 360 should be zero radians", () => {
        expect(angle_to_radians(360)).toBe(0)
    })

    test("An angle of 0 should be the same as an angle of 360", () => {
        expect(angle_to_radians(0)).toBe(angle_to_radians(360))
    })

    test("An angle close to 360 should be close to to 2PI radians", () => {
        expect(angle_to_radians(359.999)).toBeCloseTo(Math.PI * 2)
    })

    test("An angle close to 360 should be close to to 2PI radians", () => {
        expect(angle_to_radians(359.999)).toBeCloseTo(Math.PI * 2)
    })

    test("A negative value (-45) should be the same as (315)", () => {
        expect(angle_to_radians(-45)).toBeCloseTo(angle_to_radians(315))
    })

    test("A negative value (-180) should be the same as (180)", () => {
        expect(angle_to_radians(-180)).toBeCloseTo(angle_to_radians(180))
    })

    test("A negative value (-1) should be the same as (359)", () => {
        expect(angle_to_radians(-1)).toBeCloseTo(angle_to_radians(359))
    })

    test("A value exceeding 360 by 180 should be the same as (180)", () => {
        expect(angle_to_radians(360 + 180)).toBeCloseTo(angle_to_radians(180))
    })

    test("A value exceeding 152 by 180 should be the same as (152)", () => {
        expect(angle_to_radians(360 + 152)).toBeCloseTo(angle_to_radians(152))
    })

    test("A negative value exceeding -360 by 50 should be the same as (310)", () => {
        expect(angle_to_radians(-360 - 50)).toBeCloseTo(angle_to_radians(310))
    })
})

describe("Test lengthdir_x functionnality", () => {
    test("An angle of 0, 360 and 720 should all return the same value", () => {
        const arbitaryLength = 10
        const resultOf0Angle = lengthdir_x(arbitaryLength, 0);
        const resultOf360Angle = lengthdir_x(arbitaryLength, 360);
        const resultOf720Angle = lengthdir_x(arbitaryLength, 720);
        expect(resultOf0Angle).toBeCloseTo(resultOf360Angle)
        expect(resultOf360Angle).toBeCloseTo(resultOf720Angle)
    })
})

describe("Test lengthdir_y functionnality", () => {
    test("An angle of 0, 360 and 720 should all return the same value", () => {
        const arbitaryLength = 10
        const resultOf0Angle = lengthdir_y(arbitaryLength, 0);
        const resultOf360Angle = lengthdir_y(arbitaryLength, 360);
        const resultOf720Angle = lengthdir_y(arbitaryLength, 720);
        expect(resultOf0Angle).toBeCloseTo(resultOf360Angle)
        expect(resultOf360Angle).toBeCloseTo(resultOf720Angle)
    })
})