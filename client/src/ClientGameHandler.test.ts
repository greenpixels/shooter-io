
import { Application, Sprite } from "pixi.js";
import { ClientGameHandler } from "./ClientGameHandler"
import { Socket } from "socket.io-client";
import { MOVE_DIRECTION } from "@shared/enums/MoveDirection";
import { PlayerDTO } from "@shared/dtos/PlayerDTO";
import { ProjectileDTO } from "@shared/dtos/ProjectileDTO";
import { Player } from "./types/Player";
const MOCK_SOCKET_CLIENT_ID = "some_id"

describe("Testing ClientGameHandler Input Handling", () => {
    test("Holding arrow-down or S should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock =  vi.fn()
        client.playerMove = playerMoveMock;
        client.handleInput({code: "ArrowDown", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.DOWN, true)
        client.handleInput({code: "KeyS", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.DOWN, true)
    })

    test("Holding key-up or W should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock =  vi.fn()
        client.playerMove = playerMoveMock;
        client.handleInput({code: "ArrowUp", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.UP, true)
        client.handleInput({code: "KeyW", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.UP, true)
    })

    test("Holding key-left or A should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock =  vi.fn()
        client.playerMove = playerMoveMock;
        client.handleInput({code: "ArrowLeft", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.LEFT, true)
        client.handleInput({code: "KeyA", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.LEFT, true)
    })

    test("Holding key-right or D should trigger the player-move with the correct arguments", () => {
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID)
        const playerMoveMock =  vi.fn()
        client.playerMove = playerMoveMock;
        client.handleInput({code: "ArrowRight", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(1, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.RIGHT, true)
        client.handleInput({code: "KeyD", repeat: false} as KeyboardEvent, true)
        expect(playerMoveMock).toHaveBeenNthCalledWith(2, MOCK_SOCKET_CLIENT_ID, MOVE_DIRECTION.RIGHT, true)
    })
})

describe("Testing ClientGameHandler Socket Events", () => {
    test("Game tick with non-existent player should trigger the add Player logic", () => {
        const mockPlayerDto : PlayerDTO = {id: "some_player_id", position: {x: 0, y: 0}}
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const addPlayerMock = vi.fn()
        client.addPlayer = addPlayerMock
        client.gameTick({mockPlayerDto}, {})
        expect(addPlayerMock).toHaveBeenCalledTimes(1)
    })

    test("Game tick with non-existent projectile should trigger the add Projectile logic", () => {
        const mockProjectileDto : ProjectileDTO = {id: "some_projectile_id", position: {x: 0, y: 0}, rotation: 0}
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const addProjectileMock = vi.fn()
        client.addProjectile = addProjectileMock
        client.gameTick({}, {mockProjectileDto})
        expect(addProjectileMock).toHaveBeenCalledTimes(1)
    })

    test("Game tick with existent player should trigger the remove player logic", () => {
        const playerId = "some_id"
        const mockPlayerDto : PlayerDTO = {id: playerId, position: {x: 0, y: 0}}
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const removePlayerMock = vi.fn()
        client.removePlayer = removePlayerMock
        const player = new Player({position: {_x: 0, _y: 0}} as Sprite, mockPlayerDto)
        // @ts-expect-error we don't care about private access when mocking
        client.players  = {[playerId] : player}
        client.playerLeave({[playerId] : mockPlayerDto})
        expect(removePlayerMock).toHaveBeenCalledTimes(1)
    })

    test("Game tick with non-existent player should NOT trigger the remove player logic", () => {
        const playerId = "some_id"
        const mockPlayerDto : PlayerDTO = {id: playerId, position: {x: 0, y: 0}}
        const client = createMockedClient(MOCK_SOCKET_CLIENT_ID);
        const removePlayerMock = vi.fn()
        client.removePlayer = removePlayerMock
        // @ts-expect-error we don't care about private access when mocking
        client.players  = {}
        client.playerLeave({[playerId] : mockPlayerDto})
        expect(removePlayerMock).toHaveBeenCalledTimes(0)
    })
})

function createMockedClient(socketId: string) {
    const socketMock = {
        on: () => {},
        id: socketId
    }
    return new ClientGameHandler({game: {} as unknown as Application<HTMLCanvasElement>, socket: socketMock as unknown as Socket});
}