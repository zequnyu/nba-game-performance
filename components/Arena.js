import styles from '../styles/Arena.module.css';


function Arena({ teamName, teamLogoUrl, arenaName, arenaPhotoUrl, capacity }) {
    return (
        <div className={"box "+ styles.arena}>
            <div className={styles.text}>
                {teamName}
            </div>
            <div>
                <figure className="teamLogo">
                    <img src={teamLogoUrl} alt="Team Logo" />
                </figure>
            </div>
            <hr />
            <div className={styles.text}>
                {arenaName}
            </div>
            <div>
                <figure className={styles.arenaFig}>
                    <img className={styles.arenaImg} src={arenaPhotoUrl} alt="Arena Photo" />
                </figure>
            </div>
            <div className={styles.text}>
                Capacity: {capacity}
            </div>
        </div>
    );
}

export default Arena;
