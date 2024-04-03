import DTOConverter from '../../../shared/classes/DTOConverter'
import { Vector2 } from '../../../shared/classes/Vector2'
import { ProjectileDTO } from '../../../shared/dtos/ProjectileDTO'
import { projectileDTOSchema } from '../../../shared/dtos/ProjectileDTO.zod'
import { lengthdirX, lengthdirY } from '../../../shared/helpers/trigonometry'
import { KeyMap } from '../../../shared/types/KeyMap'
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
        projectile.position.x += lengthdirX(baseSpeed, angle)
        projectile.position.y += lengthdirY(baseSpeed, angle)
        if (Date.now() - projectile.createdAt > 500) {
            this.removeProjectile(projectile.id, false)
            isRemoved = true
        }

        /**
         * This could be a big potential bottle neck and is only a temporary solution
         *
         * Collisions should be refactored into another class eventually and
         * also utilize some sort of mapped grid system to not check every existing player for collisions
         */
        Object.keys(this.gameEventHandler.players).forEach((id) => {
            if (id !== projectile.sourcePlayerId && !isRemoved) {
                const player = this.gameEventHandler.players[id]
                const distance = new Vector2(player.position).sub(projectile.position).length()
                if (distance <= 18) {
                    this.removeProjectile(projectile.id, true)
                    this.gameEventHandler.playerHurtEvent({ [id]: player })
                }
            }
        })
        if (isRemoved) return
        projectileDtoMap[projectile.id] = DTOConverter.toProjectileDTO(projectile)
    }

    removeProjectile(projectileID: string, hasCollision: boolean) {
        this.gameEventHandler.projectileDestroyEvent({
            [projectileID]: { ...this.projectiles[projectileID], hasCollision: hasCollision },
        })
        delete this.projectiles[projectileID]
    }
}
