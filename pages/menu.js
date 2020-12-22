import { useState, useContext } from 'react';

import { NBAContext } from '../lib/utils';

import Card from '../components/Card';
import Dropdown from '../components/Dropdown';

import styles from '../styles/Menu.module.css';

function Menu() {
    const [g] = useContext(NBAContext);

    const playerItems = g.season.players.map(player => {
        return {
            key: player.personId,
            fullName: `${player.firstName} ${player.lastName}`,
            teamName: g.season.teams.find(team => team.teamId === player.teamId).fullName,
            photoUrl: `/${g.season.key}/player_pic/${player.personId}.png`
        }
    })

    const [player, setPlayer] = useState(playerItems[0]);

    const content = (
        <Card 
            key={player.key} 
            title={player.fullName} 
            subTitle={player.teamName} 
            photoUrl={player.photoUrl}
        />
    );

    return (
        <div className={styles.container}>
            <Dropdown 
                items={playerItems} 
                activeKey={player.key} 
                setActiveKey={(key) => {
                    setPlayer(playerItems.find(player => player.key === key))
                }}
            />
            <div>
                {content}
            </div>
        </div>
    );
}

export default Menu;
