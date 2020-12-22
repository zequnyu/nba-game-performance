import { useState } from 'react';

import styles from '../styles/Message.module.css';

const getText = (localKey) => {
    switch(localKey) {
        case 'shooting':
            return "The point on the canvas represents the shot position. When the circle or cross in legend is clicked, the map will be shown with a filter to hide made or/and missed shots for a team.";
        case 'pie':
            return "The length of the arc represents the scores for each player. The chart utilizing saturation of color shows field goal percentage and hue of color to compare scoring data between two teams.";
        case 'circle':
            return "The size of outer circles represent the aspects chosen in different NBA regions and when a specific circle is clicked, the circle will be zoomed. The size of the inner circle shows the aspects for each player in teams which belong to the outer circle regions. Different aspects for NBA players’ performance can be selected by the dropdown menu to show on the graph.";
        case 'bar':
            return "The height of each bar represents the NBA teams’ average performance. Different aspects can be selected through the dropdown menu.";
        case 'choropleth':
            return "After checking the checkbox on 'International player only', the map will show the number of NBA players outside the USA by saturation of color. When the country is clicked, a profile container besides map can be used to switch and identify players from this country.";
        case 'mapbox':
            return "The map anchors markers to NBA team arenas. Click the marker to show detailed information.";
        default:
            return "The charts use data containing NBA season 2018-2019."
    }
}

function Message({ localKey }) {
    const [display, setDisplay] = useState((typeof window !== 'undefined' && localStorage.getItem(localKey)) ? false : true);

    return (
        <div>
            {display && <article className={"message "+styles.message}>
                <div className={"message-header "+styles.messageHeader}>
                    <p>Information</p>
                    <button 
                        className={"delete "+styles.deleteButton} 
                        aria-label="delete" 
                        onClick={() => { 
                            setDisplay(false);
                            localStorage.setItem(localKey, true);
                        }}
                    />
                </div>
                <div className="message-body">
                    {getText(localKey)}
                </div>
            </article>}
        </div>
        
    );
}

export default Message;
