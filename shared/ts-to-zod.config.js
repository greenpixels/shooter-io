/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */
module.exports = [
    { name: 'Vector2DTO', input: './dtos/Vector2DTO.ts', output: './dtos/Vector2DTO.zod.ts' },
    { name: 'EntityDTO', input: './dtos/EntityDTO.ts', output: './dtos/EntityDTO.zod.ts' },
    { name: 'ProjectileDTO', input: './dtos/ProjectileDTO.ts', output: './dtos/ProjectileDTO.zod.ts' },
    { name: 'PlayerDTO', input: './dtos/PlayerDTO.ts', output: './dtos/PlayerDTO.zod.ts' },
]
