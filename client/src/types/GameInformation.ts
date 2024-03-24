import { PlayerDTO } from '@shared/dtos/PlayerDTO'

export interface GameInformation {
    players: Array<PlayerDTO>
    ownId: string
}
