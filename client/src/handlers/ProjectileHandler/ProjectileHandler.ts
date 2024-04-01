import { ProjectileDTO } from '@shared/dtos/ProjectileDTO'
import { DTOMap } from '../../types/DTOMap'
import { Projectile } from '../../classes/Projectile'
import { Application } from 'pixi.js'
import { ProjectileExplosionEffect } from '../../classes/effects/ProjectileExplosionEffect'

export class ProjectileHandler {
    projectiles: { [key: string]: Projectile } = {}
    application: Application
    constructor(application: Application) {
        this.application = application
    }

    handleProjectileTickEvent(currentProjectiles: DTOMap<ProjectileDTO>) {
        Object.entries(currentProjectiles).forEach(([id, projectileDto]) => {
            if (this.projectiles[id] !== undefined) {
                this.projectiles[id].sync(projectileDto)
            } else {
                this.addProjectile(id, currentProjectiles[id])
            }
        })
    }

    addProjectile(id: string, dto: ProjectileDTO) {
        const newProjectile = new Projectile(this.application.stage, dto)
        this.projectiles = { ...this.projectiles, ...{ [id]: newProjectile } }
    }

    handleProjectileSpawnEvent(affectedProjectiles: DTOMap<ProjectileDTO>) {
        Object.keys(affectedProjectiles).forEach((id) => {
            if (this.projectiles[id] === undefined) {
                this.addProjectile(id, affectedProjectiles[id])
            }
        })
    }

    handleProjectileDestroyEvent(affectedProjectiles: DTOMap<ProjectileDTO & { hasCollision: boolean }>) {
        Object.keys(affectedProjectiles).forEach((id) => {
            const projectileDTO = affectedProjectiles[id]
            const projectile = this.projectiles[id]
            if (projectile !== undefined) {
                projectile.cleanup(this.application.stage)
                if (projectileDTO.hasCollision) {
                    new ProjectileExplosionEffect(this.application.stage, projectileDTO.position)
                }
                delete this.projectiles[id]
            }
        })
    }
}
