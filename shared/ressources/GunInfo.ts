type GunDetails = {
    /**
     * The key will be used to match it against the sprite on the client (see AssetHelper.ts)
     */
    key: string
    /**
     * How long will the projectile keep around (in ms)
     */
    projectileLife: number
    /**
     * Damage the weapon deals
     */
    damage: number
    /**
     * The delay between shotting the weapon (in ms)
     */
    delay: number
}

export const GunInfo: Array<GunDetails> = [
    {
        damage: 75,
        delay: 1500,
        key: 'M24',
        projectileLife: 700,
    },
    {
        damage: 45,
        delay: 500,
        key: 'AK47',
        projectileLife: 500,
    },
    {
        damage: 35,
        delay: 450,
        key: 'M15',
        projectileLife: 500,
    },
    {
        damage: 60,
        delay: 1000,
        key: 'Shotgun',
        projectileLife: 150,
    },
    {
        damage: 15,
        delay: 200,
        key: 'MP5',
        projectileLife: 300,
    },
    {
        damage: 20,
        delay: 500,
        key: 'Revolver',
        projectileLife: 200,
    },
    {
        damage: 10,
        delay: 500,
        key: 'Luger',
        projectileLife: 200,
    },
    {
        damage: 5,
        delay: 600,
        key: 'M92',
        projectileLife: 200,
    },
]
