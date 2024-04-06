import { KeyMap, Vector2DTO } from '../../../shared'

interface ICollisionGripMap {
    players: { [key: string]: KeyMap<true> }
    projectiles: { [key: string]: KeyMap<true> }
}

/**
 * This Singleton contains a Grid based on the game map divided by 32 pixels.
 * Every player (and projectiles and so on) will be put into the grid and updated when moving.
 * When looking for a collision, we only check instances that inside the current grid-cell and the surrounding grid-cells
 * to improve performance. This way we don't need to check every existing player, projectile and so on
 */
export class CollisionHandler {
    private constructor() {}
    static readonly CELL_SIZE = 32
    private static collisionGridMap: ICollisionGripMap = {
        players: {},
        projectiles: {},
    }

    /**
     * Use this function to register and/or update the collision object
     * @param oldPosition
     * @param newPosition
     */
    static setCollisionCell(
        oldPosition: Vector2DTO,
        newPosition: Vector2DTO,
        id: string,
        type: 'player' | 'projectile'
    ) {
        const oldKey = this.getGridCellKeyByPosition(oldPosition)
        const newKey = this.getGridCellKeyByPosition(newPosition)
        const relatedMapName: 'players' | 'projectiles' = `${type}s`
        const oldMap = this.collisionGridMap[relatedMapName][oldKey]
        if (oldMap) {
            delete oldMap[id]
        }
        const newMap = this.collisionGridMap[relatedMapName][newKey]
        if (!newMap) {
            this.collisionGridMap[relatedMapName][newKey] = {}
        }
        this.collisionGridMap[relatedMapName][newKey][id] = true
    }

    static getAllRelevant(position: Vector2DTO, type: 'players' | 'projectiles'): Array<string> {
        const ids: Array<string> = []
        const offsets: Array<Vector2DTO> = [
            { x: 0, y: 0 }, // MIDDLE-CENTER
            { x: 0, y: this.CELL_SIZE }, // MIDDLE-BOTTOM
            { x: 0, y: -this.CELL_SIZE }, // MIDDLE-TOP
            { x: this.CELL_SIZE, y: 0 }, // CENTER-RIGHT
            { x: -this.CELL_SIZE, y: 0 }, // CENTER-LEFT
            { x: this.CELL_SIZE, y: this.CELL_SIZE }, // BOTTOM-RIGHT
            { x: -this.CELL_SIZE, y: this.CELL_SIZE }, // BOTTOM-LEFT
            { x: this.CELL_SIZE, y: -this.CELL_SIZE }, // TOP-RIGHT
            { x: -this.CELL_SIZE, y: -this.CELL_SIZE }, // TOP-LEFT
        ]
        offsets.forEach((offset) => {
            const cell =
                this.collisionGridMap[type][
                    this.getGridCellKeyByPosition({ x: position.x + offset.x, y: position.y + offset.y })
                ]
            if (cell) {
                ids.push(...Object.keys(cell))
            }
        })
        return ids
    }

    static getGridCellKeyByPosition(position: Vector2DTO) {
        const x = Math.floor(Math.abs(position.x) / CollisionHandler.CELL_SIZE)
        const y = Math.floor(Math.abs(position.y) / CollisionHandler.CELL_SIZE)
        return `${Math.sign(position.x) * x}|${Math.sign(position.y) * y}`
    }

    static cleanup() {
        this.collisionGridMap = {
            players: {},
            projectiles: {},
        }
    }
}
