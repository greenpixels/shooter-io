import { useCallback, useEffect, useState } from 'react'
import Style from './GameUserInterface.module.css'
import PlayerList from './PlayerList/PlayerList'
import { GameInformation } from '../../types/GameInformation'

export default function GameUserInterface() {
    const [gameInfo, setGameInfo] = useState<GameInformation | undefined>(undefined)

    const handleGameStateChange = useCallback((ev: Event) => {
        const typedEvent = ev as unknown as { detail: GameInformation }
        setGameInfo(() => typedEvent.detail)
    }, [])

    useEffect(() => {
        window.addEventListener('ongamestatechange', handleGameStateChange)
        return () => {
            window.removeEventListener('ongamestatechange', handleGameStateChange)
        }
    }, [handleGameStateChange])

    if (gameInfo === undefined) return
    return (
        <div className={Style.container}>
            <PlayerList
                players={gameInfo.players}
                ownId={gameInfo.ownId}
            />
        </div>
    )
}
