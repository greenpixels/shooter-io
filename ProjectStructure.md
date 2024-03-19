# shooter-io: Project Structure
---
## Repository
This project defines three npm workspaces[^1].

| Workspace | Description |
| ----------- | ----------- |
| [Client](./client/src/ClientGameHandler.ts) | socket-connection to server; renders HTML5 canvas based on server game state; **must** only send input-events and not logic|
| [Server](./server/src/ServerGameHandler.ts) | socket-connection to client**s**; handles client inputs to apply logic to game state | 
| Shared | Contains and exports shared helpers and types between client and server | 

## GameEventHandler
Both the [ClientGameHandler](./client/src/ClientGameHandler.ts) and the [ServerGameHandler](./server/src/ServerGameHandler.ts) extend a common parent called [GameEventHandler](./shared/GameEventHandler.ts).
The GameEventHandler defines abstract, common between client and server events that are triggered or received via the web-socket-connection.

[^1]: Workspaces allow to more easily manage the version, dependencies and configuration among all modules. For more information, please visit [the npm docs](https://docs.npmjs.com/cli/v7/using-npm/workspaces)