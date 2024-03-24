
import { Application } from "pixi.js";
import { ClientGameHandler } from "./ClientGameHandler"
import { Socket } from "socket.io-client";
import { PlayerDTO } from "@shared/dtos/PlayerDTO";
import { ProjectileDTO } from "@shared/dtos/ProjectileDTO";
import { Player } from "./classes/Player";
const MOCK_SOCKET_CLIENT_ID = "some_id"

describe("Testing ClientGameHandler Input Handling", () => {
    test("Holding arrow-down or S should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock = vi.fn()
        client.playerMove = playerMoveMock;
        client.handleKeyboardInput({ code: "ArrowDown", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, { x: 0, y: 1 })
        client.moveVector = { x: 0, y: 0 }
        client.handleKeyboardInput({ code: "KeyS", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, { x: 0, y: 1 })
    })

    test("Holding key-up or W should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock = vi.fn()
        client.playerMove = playerMoveMock;
        client.handleKeyboardInput({ code: "ArrowUp", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, { x: 0, y: -1 })
        client.moveVector = { x: 0, y: 0 }
        client.handleKeyboardInput({ code: "KeyW", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, { x: 0, y: -1 })
    })

    test("Holding key-left or A should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock = vi.fn()
        client.playerMove = playerMoveMock;
        client.handleKeyboardInput({ code: "ArrowLeft", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, { x: -1, y: 0 })
        client.moveVector = { x: 0, y: 0 }
        client.handleKeyboardInput({ code: "KeyA", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, { x: -1, y: 0 })
    })

    test("Holding key-right or D should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock = vi.fn()
        client.playerMove = playerMoveMock;
        client.handleKeyboardInput({ code: "ArrowRight", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, { x: 1, y: 0 })
        client.moveVector = { x: 0, y: 0 }
        client.handleKeyboardInput({ code: "KeyD", repeat: false } as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, { x: 1, y: 0 })
    })
})

describe("Testing ClientGameHandler Socket Events", () => {
    test("Game tick with non-existent player should trigger the add Player logic", () => {
        const mockPlayerDto: PlayerDTO = { id: "some_player_id", position: { x: 0, y: 0 }, aimDirection: {x: 0, y: 0}  }
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const addPlayerMock = vi.fn()
        client.addPlayer = addPlayerMock
        client.gameTick({ mockPlayerDto }, {})
        expect(addPlayerMock).toHaveBeenCalledTimes(1)
    })

    test("Game tick with non-existent projectile should trigger the add Projectile logic", () => {
        const mockProjectileDto: ProjectileDTO = { id: "some_projectile_id", position: { x: 0, y: 0 }, direction: {x: 0, y: 0} }
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const addProjectileMock = vi.fn()
        client.addProjectile = addProjectileMock
        client.gameTick({}, { mockProjectileDto })
        expect(addProjectileMock).toHaveBeenCalledTimes(1)
    })

    test("Game tick with existent player should trigger the remove player logic", () => {
        const playerId = "some_id"
        const mockPlayerDto: PlayerDTO = { id: playerId, position: { x: 0, y: 0 }, aimDirection: {x: 0, y: 0} }
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const removePlayerMock = vi.fn()
        client.removePlayer = removePlayerMock
        const player = new Player(client.game.stage, mockPlayerDto)
        client.players = { [playerId]: player }
        client.playerLeave({ [playerId]: mockPlayerDto })
        expect(removePlayerMock).toHaveBeenCalledTimes(1)
    })

    test("Game tick with non-existent player should NOT trigger the remove player logic", () => {
        const playerId = "some_id"
        const mockPlayerDto: PlayerDTO = { id: playerId, position: { x: 0, y: 0 }, aimDirection: {x: 0, y: 0}  }
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const removePlayerMock = vi.fn()
        client.removePlayer = removePlayerMock
        client.players = {}
        client.playerLeave({ [playerId]: mockPlayerDto })
        expect(removePlayerMock).toHaveBeenCalledTimes(0)
    })
})

function createMockedClient(socketId: string) {
    const socketMock = {
        on: () => { },
        id: socketId
    }
    return new ClientGameHandler({ game: {
        stage: {
            sortChildren: vi.fn(),
            addChild: () => {}
        },
        
    } as unknown as Application<HTMLCanvasElement>,
    socket: socketMock as unknown as Socket,
    canvasSize: {x: 1280, y: 720} });
}