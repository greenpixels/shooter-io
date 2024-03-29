import { ProjectileDTO } from '@shared/dtos/ProjectileDTO'
import { DTOMap } from '../../types/DTOMap'
import { Projectile } from '../../classes/Projectile'
import { Application } from 'pixi.js'

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

    handleProjectileDestroyEvent(affectedProjectiles: DTOMap<ProjectileDTO>) {
        Object.keys(affectedProjectiles).forEach((id) => {
            if (this.projectiles[id] !== undefined) {
                this.projectiles[id].cleanup(this.application.stage)
                delete this.projectiles[id]
            }
        })
    }
}
