# shooter-io: Overview

---

-   **Overview**
-   [Project Structure](./ProjectStructure.md)
-   [Coding Guidelines](./CodingGuidelines.md)

---

## Project Description

`shooter-io` is a simple, competetive open-source HTML5 shooter-game.
You can play the latest deployed version by visiting **[this web page](http://217.160.53.253/)**.

## Technology Stack

-   **`Project`**
    -   **`Client`** : _TypeScript, React, PixiJS, Vite, Socket-IO-Client_
    -   **`Server`** : _TypeScript, ExpressJS, Socket-IO_
    -   **`Shared`** : _TypeScript_

## How to start developing

1. Install and set up [git](https://git-scm.com/)
2. Install and set up [docker](https://docs.docker.com/compose/install/)
3. Install and set up the [latest node release](https://nodejs.org/en)
4. On your system, use `git clone https://github.com/greenpixels/shooter-io.git` in a folder of your choice
5. Navigate into the project folder and execute `npm install` to install all dependencies of this project
6. Generate all necessary project files by executing `npm run generate`. For more information, see [What is Zod?](./shared/dtos/WhatIsZod.md)
7. Start the client and server:
    - To **start the server**, navigate into `/server` and excecute `npm run dev`
        - To debug (only VSC): Activate debugger-attaching in VSC via --inspect flag and run `npm run debug` [Documentation](https://code.visualstudio.com/Docs/editor/debugging)
    - To **start the web client**, navigate into `/client` execute `npm run dev`
        - To debug (only VSC): Press **`F5`** in Visual Studio Code to initiate debug mode
8. Visit http://localhost:3000 to playtest
9. **That's it!**
    > For more information on how to write code for this project, please see [Coding Guidelines](./CodingGuidelines.md)
