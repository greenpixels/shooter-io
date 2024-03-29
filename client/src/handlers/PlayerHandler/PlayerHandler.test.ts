import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { ApplicationMock } from '../../__mocks__/Application.mock'
import { PlayerHandler } from './PlayerHandler'
import { Player } from '../../classes/Player'
import { DTOMap } from '../../types/DTOMap'

describe(`Testing PlayerHandler`, () => {
    const application = ApplicationMock()

    let playerHandler: PlayerHandler

    playerHandler = new PlayerHandler(() => {}, application)
    createPlayerSyncTest(playerHandler!, playerHandler!.handlePlayerTickEvent)

    playerHandler = new PlayerHandler(() => {}, application)
    createPlayerSyncTest(playerHandler!, playerHandler!.handlePlayerSpawnEvent)

    playerHandler = new PlayerHandler(() => {}, application)
    test('Should remove a player from the client when that player leaves', () => {
        const mockPlayer = createMockPlayer('player_id_first')
        playerHandler.players = { [mockPlayer.id]: { cleanup: () => {} } as unknown as Player }
        playerHandler.handlePlayerLeaveEvent({ [mockPlayer.id]: mockPlayer })
        expect(playerHandler.players).toStrictEqual({})
    })
})

function createPlayerSyncTest(playerHandler: PlayerHandler, handleEvent: (players: DTOMap<PlayerDTO>) => void) {
    const mockPlayer = createMockPlayer('player_id_first')
    test(`${handleEvent.name}: Should add a new player if the player does not yet exist on the client`, () => {
        playerHandler.addPlayer = vi.fn()
        handleEvent.call(playerHandler, { [mockPlayer.id]: mockPlayer })
        expect(playerHandler.addPlayer).toBeCalled()
    })

    test(`${handleEvent.name}: Should sync players if the player already exists on the client`, () => {
        playerHandler.addPlayer = vi.fn()
        const syncMock = vi.fn()
        playerHandler.players = { [mockPlayer.id]: { sync: syncMock } as unknown as Player }
        handleEvent.call(playerHandler, { [mockPlayer.id]: mockPlayer })
        expect(playerHandler.addPlayer).not.toBeCalled()
        expect(syncMock).toBeCalled()
    })
}

function createMockPlayer(id: string) {
    return {
        aimDirection: {
            x: 0,
            y: 0,
        },
        id: id,
    } as PlayerDTO
}
