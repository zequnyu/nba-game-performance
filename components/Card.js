import styles from '../styles/Card.module.css';

function Card({ title, subTitle = '', photoUrl = '' }) {
    return (
        <div className={styles.card + " card"}>
            <div className="card-content">
                <div className="media">
                <figure className={styles.image}>
                    <img src={photoUrl} alt="Placeholder image" />
                </figure>
                </div>
            </div>
        </div>
    );
}

export default Card;
