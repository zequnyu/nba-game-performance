import { useState, useEffect, useContext } from 'react';

import mapboxgl from 'mapbox-gl';

import { NBAContext } from '../lib/utils';

import Marker from '../components/Marker';
import Arena from '../components/Arena';
import Message from '../components/Message';

import arenas from '../public/arena.json';

import styles from '../styles/Mapbox.module.css';

const LAL = "1610612747";

function MapBoxMap() {
    const markers = {};
    let currentMarker;
    const [g] = useContext(NBAContext);

    const teams = g.season.teams;
    const [arena, setArena] = useState(null);

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiYmVhcjAwMDc3NyIsImEiOiJja2drYjVoMHQwMHN6MnNwMGp4ZnE3bzFqIn0.jUctjUT5dgtkf-rsJU6G8g';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-97.5151, 35.4634],
            zoom: 2.8
        });

        arenas.slice(1).forEach(arena=>{
            const arenaName=arena[0], teamName=arena[2], capacity=arena[3];
            const lng=arena[5], lat=arena[6], id=arena[7];
            const [r, g, b] = teams.find(tm => tm.teamId === id).primaryColor;

            const marker = new Marker({ color: `rgba(${r}, ${g}, ${b}, 0.5)` })
                .setLngLat([lng, lat])
                .addTo(map);

            markers[id] = { marker, id, arenaName, teamName, capacity, lng, lat };
            
            if (id === LAL) {
                setArena(markers[id]);
                currentMarker = new Marker({ color: `rgb(${r}, ${g}, ${b}, 1)` })
                .setLngLat([lng, lat])
                .addTo(map);
            }

            marker.onClick(() => {
                setArena(markers[id]);
                currentMarker.remove();
                currentMarker = new Marker({ color: `rgb(${r}, ${g}, ${b}, 1)` })
                .setLngLat([lng, lat])
                .addTo(map);
            });
        });
    }, [])

    const content = (arena ? (
        <Arena 
            teamName={arena.teamName}
            teamLogoUrl={`/teams/${arena.id}.gif`}
            arenaName={arena.arenaName}
            arenaPhotoUrl={`/arena_pic/${arena.id}.jpg`}
            capacity={arena.capacity}
        />
    ) : null)

    return ( 
        <div>
            <Message localKey="mapbox" />
            <div className={styles.mapbox_container}>
                <div className={styles.map} id='map'></div>
                <div className={styles.arena}>
                    <div>
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MapBoxMap;

