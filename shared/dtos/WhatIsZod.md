# shooter-io: Zod

---

-   [Overview](./ReadMe.md)
-   [Project Structure](./ProjectStructure.md)
-   [Coding Guidelines](./CodingGuidelines.md)
-   **What Is Zod**

---

> Just wanna know how to generate _zod_-Files? [Skip to the end!](#creating-a-new-dto)

## The Problem

TypeScript is a superset of JavaScript that allows us to declare types that help us in the developing process by enabling strict typing and type-checking. While this is in fact really help while develpoing, these types do not exist at runtime and can therefor not be used to check objects or validate anything.

Since client-data is sent via JSON to the server, we don't have any way to guarantee that this data is in fact the data we have asked for. A property of an object could be `undefined` or someone could have manipulated a `string` to an `[Object]`, resulting for unexpected behavior or crashes at runtime.

To validate, we would need to check every DTO that travels from client to server by hand.
As in, `if(typeof player.name !== string || player.name.length > MAX_LENGTH || ...`

But most of the information needed for validation is already inside of our type defintions. So, wouldn't it be cool if we could use our type defintions to validate our data?

## The Zod Solution

[Zod](https://github.com/colinhacks/zod) is a TypeScript-first schema declaration and validation library by [colinhacks](https://github.com/colinhacks). Zod allows us to declare validation schemes and to then parse objects against this validation scheme.

Using `z.infer<typeof my_own_schema>` we can even infer a valid TypeScript-type from our scheme declaration, which is just really cool.

But instead of usinig Zod directly, I wanted to try out a `TypeScript-To-Zod` approach by automatically generating the Zod-schemas from TypeScript-definitions. The idea is to lessen the amount of needed know-how in different libraries for contributors and allow everyone to just stick with simple TypeScript-definitions.

## Code generation via ts-to-zod

[ts-to-zod](https://github.com/fabien0102/ts-to-zod) is as implied a tool for generating Zod-schemas based on TypeScript-definitions. As we only need zod for validating DTOs, the schema-generation is only triggered for the `/dtos`-Folder in `/shared`.

We can even use **JSDoc inside of our type defintions to automatically create validation-logic**:

```ts
// Test.ts
export interface Test {
    /**
     * The name of the hero.
     *
     * @minLength 2
     * @maxLength 50
     */
    name: string
}
```

_... will be used to generate:_

```ts
// Test.zod.ts
export const TestSchema = z.object({
    name: z.string().min(2).max(50),
})
```

In our application we can then use `z.parseAsync()` to check if an object validates without errors against our new Zod-Schema!

```ts
import { TestSchema } from 'path/to/schema'
const parsed = await TestSchema.parseAsync({ name: 'hello!' }) // succeeds, returns the valid object
const notParsed = await TestSchema.parseAsync({ name: 'A' }) // throws because of @minLength 2
```

_Yay_, validation!

## Creating a new DTO

1. Add a new _TypeScript_-Definition to the `/shared/dtos`-Folder, e.g "`CoolGuyDTO.ts`"
2. Optionally, add JSDoc-Validation-Annotations to properties, e.g `@minLength`, `@maxLength`, ... [more](https://github.com/fabien0102/ts-to-zod?tab=readme-ov-file#jsdoc-tag-validators)
3. Add your DTO to the [ts-to-zod.config.js](../ts-to-zod.config.js) (Wanna know [why?](#why-ts-to-zodconfigjs-is-needed))
4. Execute `npm run generate` at the project-root or `npm run zod` inside of `/shared`
    - **Warning:** _Do not commit generated zod-files!_
5. **That's it, done!** Validate to your heart's content.

## Why `ts-to-zod.config.js` is needed:

ts-to-zod is not yet able to resolve import paths automatically, so you need to determine the order in which the files get resolved by hand. If you add another entry, then add it below all the entries that your entry depends on. If your file does not depend on any other Type-definition the order does not matter. Nontheless, your Type/Interface needs to be in that configuration-array, otherwise it can't be converted to a zod-File.

```js
/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */
module.exports = [
    { name: 'Parent', input: './dtos/Parent.ts', output: './dtos/Parent.zod.ts' },
    { name: 'Child', input: './dtos/Child.ts', output: './dtos/Child.zod.ts' },
    { name: 'Orphan', input: './dtos/Orphan.ts', output: './dtos/Orphan.zod.ts' },
]
```
