# shooter-io: Coding Guidelines
---
1. **Features or changes MUST be created in seperate feature branches**
    All changes need to go through the automated testing, linting and building lifecycle. Changes will only be merged when the GitHub pipeline succesfully completes. To create a new change or feature, create new branch from the latest main-branch.

2. **Commits SHOULD detail the intend with a type-key and include a short message**
    If possible, commits should be structured as `{TYPE}: {SHORT_MESSAGE}`
    e.g:
    - **`feat:`** `add sprite rotation to player class`
    - **`refactor:`** `move collision logic into a seperate entity`
    - **`fix:`** `remove invisible wall at start area`
    - **`test:`** `add additional test cases for respawn logic`
    - **`chore:`** `remove unused imports`
    - **`ci:`** `change target IP for deployment`
    - **`build:`** `configure esbuild to treat .js files as .jsx`
    - **`docs:`** `remove typos in the coding guidelines`