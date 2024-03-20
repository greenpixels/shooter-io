import { vi } from "vitest"

// If we don't create empty mocks here, pixi js tries to specify and create a worker on import
vi.mock("pixi.js", () => {
    return {}
})