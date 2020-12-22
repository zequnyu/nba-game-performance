import styles from '../styles/ScoreBox.module.css';

function ScoreBox({ home, visit }) {
    return (
        <div className={"box " + styles.scoreBox}>
            <div className="container">
                <div className={"has-text-weight-bold " + styles.tricode}>
                    {visit.tricode}
                </div>
                <figure className="image">
                    <img src={visit.photoUrl} alt="Away team logo" />
                </figure>
                <div className={"has-text-weight-bold " + styles.score}>
                    {visit.score}
                </div>
            </div>
            <div className="container">@</div>
            <div className="container">
                <div className={"has-text-weight-bold " + styles.tricode}>
                    {home.tricode}
                </div>
                <figure className="image">
                    <img src={home.photoUrl} alt="Home team logo" />
                </figure>
                <div className={"has-text-weight-bold " + styles.score}>
                    {home.score}
                </div>
            </div>
        </div>
    );
}

export default ScoreBox;
