import { PlayerDTO, ProjectileDTO } from '../'

export class DTOConverter {
    static toPlayerDTO(player: PlayerDTO) {
        return {
            aimDirection: player.aimDirection,
            id: player.id,
            position: player.position,
        }
    }

    static toProjectileDTO(projectile: ProjectileDTO) {
        return {
            direction: projectile.direction,
            id: projectile.id,
            position: projectile.position,
            sourcePlayerId: projectile.sourcePlayerId,
        }
    }
}

export default DTOConverter
