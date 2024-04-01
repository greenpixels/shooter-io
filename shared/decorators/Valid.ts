/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ZodSchema } from 'zod'
/**
 * A decorator function that takes an array of ZodSchema's to validate against the method arguments
 *
 * The first Schema will validate the first argument, the second Schema will validate the second argument and so on ...
 *
 * If a method argument **should not be validated** then pass _null_ as the schema
 * @param schemas An array of ZodSchema that will be matched in-order against the method arguments
 * @returns
 */
export function Valid(...schemas: Array<ZodSchema>): any {
    return function decorator(originalMethod: any) {
        function replacementMethod(this: any, ...args: any[]) {
            try {
                for (let index = 0; index < args.length; index++) {
                    const schema = schemas[index]
                    if (schema === null) continue
                    schema.parse(args[index])
                }
                const result = originalMethod.call(this, ...args)
                return result
            } catch (error) {
                console.error('There was an issue parsing an argument using a zod-Schema.')
                console.debug(String(error))
            }
        }
        return replacementMethod
    }
}
