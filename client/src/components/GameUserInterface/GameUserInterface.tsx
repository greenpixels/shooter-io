import { GameInformation } from '../../types/GameInformation'
import Style from './GameUserInterface.module.css'
import PlayerList from './PlayerList/PlayerList'

export interface IGameUserInterfaceProps {
    gameInfo: GameInformation
}

export default function GameUserInterface(props: IGameUserInterfaceProps) {
    return (
        <div className={Style.container}>
            <PlayerList
                players={props.gameInfo.players}
                ownId={props.gameInfo.ownId}
            />
        </div>
    )
}
