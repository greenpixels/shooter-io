import { glob } from 'glob'
import { exec } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

const GLOB_PATTERN = 'dtos/*.ts' // Where to search for typescript definitions?
const GLOB_IGNORE_PATTERNS = ['node_modules/**', '**/*.zod.ts'] // What should be ignored?
const VERBOSE = false // Should native ts-to-zod logs be printed?
const FILES = await glob(GLOB_PATTERN, { ignore: GLOB_IGNORE_PATTERNS })
const ESLINT_DISABLE_COMMENT = '/* eslint-disable */'
const TYPESCRIPT_DISABLE_COMMENT = '// @ts-nocheck'
const zodFilePaths = []
const execPromises = []
FILES.forEach((filePath) => {
    const { base, dir, name } = path.parse(filePath)
    const FILE_PATH_NORMAL = path.join(dir, base)
    const FILE_NAME = name
    const ZOD_EXTENSION = '.zod.ts'
    console.log(`Generating Zod-Files for ${FILE_NAME}`)
    execPromises.push(
        new Promise((resolve) => {
            exec(
                `npx ts-to-zod ${FILE_PATH_NORMAL} ${FILE_PATH_NORMAL.replace('.ts', ZOD_EXTENSION)} --config=${FILE_NAME}`,
                (error, stdout, stderr) => {
                    if (error && VERBOSE) {
                        console.error(error.message)
                    }
                    if (stdout && VERBOSE) {
                        console.log(stdout)
                    }
                    if (stderr && VERBOSE) {
                        console.error(stderr)
                    }
                    console.log(` ✔ Generated Zod-File for ${FILE_NAME}`)
                    resolve()
                }
            )
        })
    )

    zodFilePaths.push(path.join(dir, name + ZOD_EXTENSION))
})

await Promise.all(execPromises)

zodFilePaths.forEach((zodFilePath) => {
    console.log(`Adding es-lint and typescript-ignore comments to ${zodFilePath}`)
    prependESLintAndTypeScriptIgnoreComments(zodFilePath)
})

function prependESLintAndTypeScriptIgnoreComments(file) {
    const data = fs.readFileSync(file)
    const fd = fs.openSync(file, 'w+')
    const insert = Buffer.from(`${ESLINT_DISABLE_COMMENT}\n${TYPESCRIPT_DISABLE_COMMENT}\n`)
    fs.writeSync(fd, insert, 0, insert.length, 0)
    fs.writeSync(fd, data, 0, data.length, insert.length)
    fs.close(fd, (err) => {
        if (err) throw err
    })
}
