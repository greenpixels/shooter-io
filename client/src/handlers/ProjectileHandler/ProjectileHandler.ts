import { ProjectileDTO, KeyMap } from '@shared/index'
import { Projectile } from '../../classes/Projectile'
import { Application } from 'pixi.js'
import { ProjectileExplosionEffect } from '../../classes/effects/ProjectileExplosionEffect'

export class ProjectileHandler {
    projectiles: { [key: string]: Projectile } = {}
    application: Application
    constructor(application: Application) {
        this.application = application
    }

    handleProjectileTickEvent(currentProjectiles: KeyMap<ProjectileDTO>) {
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

    handleProjectileSpawnEvent(affectedProjectiles: KeyMap<ProjectileDTO>) {
        Object.keys(affectedProjectiles).forEach((id) => {
            if (this.projectiles[id] === undefined) {
                this.addProjectile(id, affectedProjectiles[id])
            }
        })
    }

    handleProjectileDestroyEvent(affectedProjectiles: KeyMap<ProjectileDTO & { hasCollision: boolean }>) {
        console.log(String(Date.now()) + ' Projectile destrosy event')
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
