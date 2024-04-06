import { CollisionHandler } from './CollisionHandler'

describe('Testing CollisionHandler', () => {
    beforeEach(() => {
        CollisionHandler.cleanup()
    })

    test('Should return negative position values for negative numbers', () => {
        expect(CollisionHandler.getGridCellKeyByPosition({ x: -64, y: 20 })).toBe(`-2|0`)
    })
    test('Negative and positive values should only differe in the sign', () => {
        expect(CollisionHandler.getGridCellKeyByPosition({ x: 64, y: 20 })).toBe(`2|0`)
        expect(CollisionHandler.getGridCellKeyByPosition({ x: -64, y: 20 })).toBe(`-2|0`)
    })
    test('Should set a cell correctly for players', () => {
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: 0, y: 0 }, 'some-id', 'player')
        // @ts-expect-error Ignore readonly rule
        const playerMap = CollisionHandler.collisionGridMap.players
        expect(Object.keys(playerMap).length).toBe(1)
        expect(playerMap['0|0']).not.toBeUndefined()
        expect(Object.keys(playerMap['0|0']).length).toBe(1)
    })
    test('Should change a cell correctly for players', () => {
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: 0, y: 0 }, 'some-id', 'player')
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: 33, y: 35 }, 'some-id', 'player')
        // @ts-expect-error Ignore readonly rule
        const playerMap = CollisionHandler.collisionGridMap.players
        expect(Object.keys(playerMap).length).toBe(2)
        expect(Object.keys(playerMap['0|0']).length).toBe(0)
        expect(Object.keys(playerMap['1|1']).length).toBe(1)
    })

    test('Should return all players in current and surrounding grid', () => {
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: 0, y: 0 }, 'some-id1', 'player')
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: -33, y: 0 }, 'some-id2', 'player')
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: 33, y: 0 }, 'some-id3', 'player')
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: 33, y: 40 }, 'some-id4', 'player')
        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: -33, y: -40 }, 'some-id5', 'player')

        CollisionHandler.setCollisionCell({ x: 0, y: 0 }, { x: -299, y: -2882 }, 'some-id6', 'player') // Is far away from (0,0)

        const ids = CollisionHandler.getAllRelevant({ x: 0, y: 0 }, 'players')
        expect(ids.length).toBe(5)
        expect(ids).not.toContain('some-id6')
    })
})
