import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { useState } from 'react'
import Style from './PlayerList.module.css'
import ChevronDown from '@assets/ui_chevron_down.svg'
import ChevronUp from '@assets/ui_chevron_up.svg'

export interface IPlayerList {
    players: Array<PlayerDTO>
    ownId: string
}

export default function PlayerList(props: IPlayerList) {
    const [open, setOpen] = useState(false)
    return (
        <div className={Style.container}>
            {open
                ? renderPlayerList(props.players, props.ownId, setOpen)
                : renderToggleButton(true, setOpen, props.players.length)}
        </div>
    )
}

function renderPlayerList(
    players: Array<PlayerDTO>,
    ownId: string,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
    return (
        <table>
            <tbody className={Style.tablebody}>
                {players.map((player) => {
                    return (
                        <tr
                            key={player.id}
                            className={Style.tablerow}>
                            <td className={Style.tabledata}>
                                {player.id} {ownId === player.id ? '(You)' : null}
                            </td>
                        </tr>
                    )
                })}
                {renderToggleButton(false, setOpen, players.length)}
            </tbody>
        </table>
    )
}

function renderToggleButton(
    shouldOpen: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    playerCount: number
) {
    const label = shouldOpen ? `Players (${playerCount})` : 'Close'
    const icon = shouldOpen ? ChevronDown : ChevronUp
    return (
        <button
            className={Style.modalbutton}
            onClick={() => setter(shouldOpen)}>
            {label + ' '}
            <img
                aria-hidden
                src={icon}
            />
        </button>
    )
}
