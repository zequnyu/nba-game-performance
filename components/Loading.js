import styles from '../styles/Loading.module.css';

function Loading({ isActive }) {
    return (
        <div className={"modal" + (isActive ? " is-active" : "") }>
            <div className="modal-background"></div>
            <div className={"modal-content "+ styles.centerDiv}>
                <div className={styles['lds-roller']}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}

export default Loading;
