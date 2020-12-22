import styles from '../styles/Header.module.css';

function Header() {
    return (
        <div className={styles.header}>
            <h3 className={styles["text-reflect"]+" "+styles.title}>
                NBA Game Performance
            </h3>
            <div className={styles.imgDiv}>
                <figure className="image">
                    <img src="/shooting.gif" />
                </figure>
            </div>
        </div>
        
    );
}


export default Header;
