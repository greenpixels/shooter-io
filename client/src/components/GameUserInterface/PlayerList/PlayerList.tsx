import { PlayerDTO } from "@shared/dtos/PlayerDTO"
import { useState } from "react"
import Style from "./PlayerList.module.css"
import ChevronDown from "@assets/ui_chevron_down.svg"
import ChevronUp from "@assets/ui_chevron_up.svg"

export interface IPlayerList {
    players: Array<PlayerDTO>,
    ownId: string
}

export default function PlayerList(props: IPlayerList) {
    const [open, setOpen] = useState(true)
    return (
        <div className={Style.container}>
            {
                open ?
                    <>
                        <table>
                            <tbody className={Style.tablebody}>
                            {
                                props.players.map((player) => {
                                    return (
                                        <tr className={Style.tablerow}>
                                            <td className={Style.tabledata}>
                                                {player.id} {props.ownId === player.id ? "(You)" : null}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                        <button className={Style.modalbutton} onClick={() => setOpen(false)}>Close <img aria-hidden src={ChevronUp}/></button>
                    </>

                    :
                    <button className={Style.modalbutton} onClick={() => setOpen(true)}>Players ({props.players.length}) <img aria-hidden src={ChevronDown}/></button>
            }
        </div>
    )

}

