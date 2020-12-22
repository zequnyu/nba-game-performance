import { useRouter } from 'next/router'

import styles from '../styles/HomeButton.module.css';

function HomeButton() {
    const router = useRouter();

    return (
        <div className={styles.buttonDiv}>
            <button className={"button is-white " + styles.homeButton} onClick={() => {
                router.push('/');
            }}>
                <i className="fas fa-home" />
            </button>
        </div>
    );
}

export default HomeButton;
