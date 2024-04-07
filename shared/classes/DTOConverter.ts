import { PlayerDTO, ProjectileDTO } from '../'

export class DTOConverter {
    static toPlayerDTO(player: PlayerDTO): PlayerDTO {
        return {
            aimDirection: player.aimDirection,
            id: player.id,
            position: player.position,
            level: player.level,
            score: player.score,
        }
    }

    static toProjectileDTO(projectile: ProjectileDTO): ProjectileDTO {
        return {
            direction: projectile.direction,
            id: projectile.id,
            position: projectile.position,
            sourcePlayerId: projectile.sourcePlayerId,
        }
    }
}

export default DTOConverter
