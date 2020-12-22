import { useState } from 'react';

import Loading from '../components/Loading';
import Message from '../components/Message';

import styles from '../styles/Home.module.css';

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.container}>
      <Message localKey="index" />
      <main className={styles.main}>
        <div className={styles.grid}>
          <a href="/shooting/20181017" className={styles.card} onClick={() => {
              setLoading(true);
          }}>
            <h3><i className="fas fa-basketball-ball"></i></h3>
            <span className="tag is-primary">Interactive</span>
            <p>Find in-depth information about a player&apos;s shooting performance in Shooting Map</p>
          </a>

          <a href="/pie/20181017" className={styles.card} onClick={() => {
              setLoading(true);
          }}>
            <h3><i className="fas fa-chart-pie"></i></h3>
            <span className="tag is-primary">Interactive</span>
            <span className="tag is-link">Responsive</span>
            <p>Learn about how much a player contributed to the team in a game in Donut Chart</p>
          </a>

          <a
            href="/circle"
            className={styles.card}
          >
            <h3><i className="fas fa-dot-circle"></i></h3>
            <span className="tag is-primary">Interactive</span>
            <span className="tag is-warning">Layout</span>
            <p>Discover the region-team-player relationship in Circle Packing Layout Chart</p>
          </a>

          <a
            href="/bar"
            className={styles.card}
          >
            <h3><i className="fas fa-signal"></i></h3>
            <span className="tag is-primary">Interactive</span>
            <span className="tag is-danger">Animated</span>
            <p>
              Get to know teams performance comparison in various of aspects in Bar Chart
            </p>
          </a>

          <a
            href="/choropleth"
            className={styles.card}
          >
            <h3><i className="fas fa-globe-americas"></i></h3>
            <span className="tag is-primary">Interactive</span>
            <span className="tag is-success">Map</span>
            <p>
              See where NBA players come from in Choropleth Map 
            </p>
          </a>
          
          <a
            href="/mapbox"
            className={styles.card}
          >
            <h3><i className="fas fa-map-marker-alt"></i></h3>
            <span className="tag is-primary">Interactive</span>
            <span className="tag is-dark">Mapbox</span>
            <p>
              A Mapbox map containing NBA team arenas location
            </p>
          </a>
        </div>
      </main>

      <Loading isActive={loading} />
    </div>
  )
}
