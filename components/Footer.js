import styles from '../styles/Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div>
                <a className={"button is-white "+styles.link} 
                    href="https://github.com/DSCI-554/project-first-vis-aid" 
                    target="_blank"
                    rel="noreferrer"
                >
                    <i className="fab fa-github"></i>
                </a>
                <a className={"button is-white "+styles.link} 
                    href="/first_vis_aid_paper_.pdf" 
                    target="_blank"
                    rel="noreferrer"
                >
                    <i className="fas fa-file-pdf"></i>
                </a>
                <a className={"button is-white "+styles.link} 
                    href="https://youtu.be/9iNS43uMiOM" 
                    target="_blank"
                    rel="noreferrer"
                >
                    <i className="fab fa-youtube"></i>
                </a>
                <div className={styles.copyright}>
                    Copyright © 2020&nbsp;<strong>First-Vis-Aid</strong>&nbsp;
                </div>
            </div>
      </footer>
    )
}

export default Footer;
