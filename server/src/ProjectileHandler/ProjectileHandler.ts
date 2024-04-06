import { DTOConverter, Vector2, ProjectileDTO, projectileDTOSchema, Trigonometry, KeyMap } from '../../../shared/index'
import { CollisionHandler } from '../CollisionHandler/CollisionHandler'
import { ServerGameHandler } from '../ServerGameHandler/ServerGameHandler'
import { GlobalValuesMap } from '../classes/GlobalValuesMap'
import { Projectile } from '../classes/Projectile'

export class ProjectileHandler {
    projectiles: KeyMap<Projectile> = {}
    private gameEventHandler: ServerGameHandler
    constructor(gameEventHandler: ServerGameHandler) {
        this.gameEventHandler = gameEventHandler
    }
    handleProjectilesTickEvent(visibleProjectiles: KeyMap<Projectile>) {
        const projectileDtoMap: { [key: string]: ProjectileDTO } = {}
        Object.keys(visibleProjectiles).forEach((id) => {
            const original = visibleProjectiles[id]
            if (original) {
                this.projectileTick(original, projectileDtoMap)
            }
        })
        return projectileDtoMap
    }

    projectileTick(projectile: Projectile, projectileDtoMap: KeyMap<ProjectileDTO>) {
        let isRemoved = false
        projectileDTOSchema.parse(projectile)
        const angle = new Vector2(projectile.direction).angle()
        const baseSpeed = GlobalValuesMap.PROJECTILE_BASE_SPEED
        const oldPosition = projectile.position
        projectile.position.x += Trigonometry.lengthdirX(baseSpeed, angle)
        projectile.position.y += Trigonometry.lengthdirY(baseSpeed, angle)
        CollisionHandler.setCollisionCell(oldPosition, projectile.position, projectile.id, 'projectile')
        if (Date.now() - projectile.createdAt > 500) {
            this.removeProjectile(projectile.id, false)
            isRemoved = true
        }

        CollisionHandler.getAllRelevant(projectile.position, 'players').forEach((id) => {
            if (id !== projectile.sourcePlayerId && !isRemoved) {
                const player = this.gameEventHandler.players[id]
                if (!player) return
                const distance = new Vector2(player.position).sub(projectile.position).length()
                if (distance <= 18) {
                    this.removeProjectile(projectile.id, true)
                    this.gameEventHandler.playerHurtEvent({ [id]: player })
                    isRemoved = true
                }
            }
        })
        if (isRemoved) return
        projectileDtoMap[projectile.id] = DTOConverter.toProjectileDTO(projectile)
    }

    removeProjectile(projectileID: string, hasCollision: boolean) {
        const projectile = this.projectiles[projectileID]
        this.gameEventHandler.projectileDestroyEvent({
            [projectileID]: { ...projectile, hasCollision: hasCollision },
        })
        CollisionHandler.removeFromCollisionGrid(projectile.position, projectile.id, 'projectiles')
        delete this.projectiles[projectileID]
    }
}
