import { useState, useRef, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import * as d3 from 'd3';
import moment from 'moment';

import { NBAContext } from '../../lib/utils';
import { connectToDatabase } from '../../lib/mongodb';

import DatePicker from '../../components/DatePicker';
import Dropdown from '../../components/Dropdown';
import ScoreBox from '../../components/ScoreBox';
import Loading from '../../components/Loading';
import Message from '../../components/Message';

import styles from '../../styles/ShootingMap.module.css';

import dates2018 from '../../public/2018/game_dates.json';

const initShowOptions = {
    "hMade": true,
    "hMiss": true,
    "vMade": true,
    "vMiss": true
};

function ShootingMap({ date, shootingData }) {
    const svgRef = useRef();
    const [g] = useContext(NBAContext);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [showOptions, setShowOptions] = useState(initShowOptions);

    const currentDate = moment(date.toString(), 'YYYYMMDD').toDate();

    const games = Object.keys(shootingData).map(key => {
        const matchId = `${shootingData[key][0]['Game Date']}_${shootingData[key][0]['Team ID']}`

        const gameInfo = g.season.schedule.find(game => {
            const matches = [
                `${game.startDateEastern}_${game.hTeam.teamId}`,
                `${game.startDateEastern}_${game.vTeam.teamId}`
            ]
            return matches.includes(matchId);
        });

        const h = g.season.teams.find(team => team.teamId === gameInfo.hTeam.teamId).tricode;
        const v = g.season.teams.find(team => team.teamId === gameInfo.vTeam.teamId).tricode;

        return {
            key,
            fullName: `${v} (V) : ${h} (H)`,
            ...gameInfo
        }
    });

    const [game, setGame] = useState(games[0]);
    
    useEffect(() => {
        setLoading(false);
        setGame(games[0]);
        setShowOptions(initShowOptions);
    }, [shootingData])

    const homeTeam = {
        ...g.season.teams.find(team => team.teamId === game.hTeam.teamId),
        score: game.hTeam.score,
        photoUrl: `/teams/${game.hTeam.teamId}.gif`
    };
    const visitTeam = { 
        ...g.season.teams.find(team => team.teamId === game.vTeam.teamId),
        score: game.vTeam.score,
        photoUrl: `/teams/${game.vTeam.teamId}.gif`
    };
    const svgElement = <svg ref={svgRef} width="500" height="500"></svg>;

    const content = (games.length > 0) ? (
        <div className={styles.shootingMapDiv}>
            <div className={styles.shootingMapDivLeft}>
                <div className={styles.dropdowns}>
                    <DatePicker 
                        minDateStr={g.season.startDate} 
                        maxDateStr={g.season.endDate} 
                        selectedDate={currentDate}
                        setSelectedDate={ (date) => { 
                            setLoading(true);
                            const d = moment(date).format('YYYYMMDD');
                            router.push(`/shooting/`+d);
                        }}
                        disabledDatesStr={g.season.disabledDates}
                    />
                    <Dropdown 
                        key={game.key}
                        items={games}
                        activeKey={game.key}
                        setActiveKey={(key) => {
                            const newGame = games.find(game => game.key === key);
                            setGame(newGame);
                            setShowOptions(initShowOptions);
                        }}
                    />
                </div>
                <ScoreBox home={homeTeam} visit={visitTeam} />
            </div>
            {svgElement}
        </div>
    ) : <div>No game in selected date</div>;

    useEffect(() => {
        const data = shootingData[game.key];

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        svg.append("image")
            .attr("xlink:href","/nba_court.svg")
            .attr("width","500")
            .attr("height","500");
        const radius = 4;

        const setTeamColor = (d) => {
            const t = g.season.teams.find(team => team.teamId === d["Team ID"].toString());
            return t.tricode === d["Home Team"] ? d3.schemeSet1[0] : d3.schemeSet1[1];
        };
        
        const shots = svg.append("g")
            .selectAll(".circle")
            .data(data
                .filter(d => d["Shot Made Flag"])
                .filter(d => {
                    if (d["Team ID"].toString() === homeTeam.teamId) {
                        return showOptions.hMade
                    } else {
                        return showOptions.vMade
                    }
                })
            )
            .enter()
            .append("g");
    
        shots
            .append("circle")
            .attr("class", "shot")
            .attr("cx", (d) => 250 - d["X Location"])
            .attr("cy", (d) => 450 - d["Y Location"])
            .attr("r", radius)
            .style("fill", setTeamColor);
        
        const misses = svg.append("g")
            .selectAll(".line")
            .data(data
                .filter(d => !d["Shot Made Flag"])
                .filter(d => {
                    if (d["Team ID"].toString() === homeTeam.teamId) {
                        return showOptions.hMiss
                    } else {
                        return showOptions.vMiss
                    }
                })
            )
            .enter()
            .append("g");
        
        misses
            .attr("class", "miss")
            .append("line")
            .attr("x1", (d) => 250 - d["X Location"] - radius)
            .attr("y1", (d) => 450 - d["Y Location"] - radius)
            .attr("x2", (d) => 250 - d["X Location"] + radius)
            .attr("y2", (d) => 450 - d["Y Location"] + radius)
            .attr("stroke-width", radius / 2)
            .style("stroke", setTeamColor);
        misses
            .attr("class", "miss")
            .append("line")
            .attr("x1", (d) => 250 - d["X Location"] + radius)
            .attr("y1", (d) => 450 - d["Y Location"] - radius)
            .attr("x2", (d) => 250 - d["X Location"] - radius)
            .attr("y2", (d) => 450 - d["Y Location"] + radius)
            .attr("stroke-width", radius / 2)
            .style("stroke", setTeamColor);
        
        const legendData = [
            {"name": homeTeam.tricode, "color": d3.schemeSet1[0], "type": "h"},
            {"name": visitTeam.tricode, "color": d3.schemeSet1[1], "type": "v"}
        ];
        
        const legend = svg.append("g");

        legend.selectAll("."+styles.legend)
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", styles.legend)
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => 41 + i*20)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("font-weight", "bold")
            .text(d => d.name);
          
        legend.selectAll("."+styles.legend)
            .append("circle")
            .attr("cx", 60)
            .attr("cy", (d, i) => 40 + i*20)
            .attr("r", radius*1.5)
            .attr("fill", d => d.color)
            .on("click", (e, d) => {
                if (d.type === "h") {
                    const hMade = !showOptions.hMade;
                    setShowOptions({ ...showOptions, hMade })
                } else {
                    const vMade = !showOptions.vMade;
                    setShowOptions({ ...showOptions, vMade })
                }
            });

        legend.selectAll("."+styles.legend)
            .append("text")
            .attr("x", 85)
            .attr("y", (d, i) => 41 + i*20)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("text-decoration", d => {
                if (d.type === "h") {
                    return showOptions.hMade ? "none": "line-through"
                } else {
                    return showOptions.vMade ? "none": "line-through"
                }
            })
            .text("Made");
        
        legend.selectAll("."+styles.legend)
            .append("line")
            .attr("x1", 120 - radius*1.2)
            .attr("y1", (d, i) => 40 - radius*1.2 + i*20)
            .attr("x2", 120 + radius*1.2)
            .attr("y2", (d, i) => 40 + radius*1.2 + i*20)
            .attr("stroke-width", radius)
            .style("stroke", d => d.color)
            .on("click", (e, d) => {
                if (d.type === "h") {
                    const hMiss = !showOptions.hMiss;
                    setShowOptions({ ...showOptions, hMiss })
                } else {
                    const vMiss = !showOptions.vMiss;
                    setShowOptions({ ...showOptions, vMiss })
                }
            });

        legend.selectAll("."+styles.legend)
            .append("line")
            .attr("x1", 120 - radius*1.2)
            .attr("y1", (d, i) => 40 + radius*1.2 + i*20)
            .attr("x2", 120 + radius*1.2)
            .attr("y2", (d, i) => 40 - radius*1.2 + i*20)
            .attr("stroke-width", radius)
            .style("stroke", d => d.color)
            .on("click", (e, d) => {
                if (d.type === "h") {
                    const hMiss = !showOptions.hMiss;
                    setShowOptions({ ...showOptions, hMiss })
                } else {
                    const vMiss = !showOptions.vMiss;
                    setShowOptions({ ...showOptions, vMiss })
                }
            });

        legend.selectAll("."+styles.legend)
            .append("text")
            .attr("x", 142)
            .attr("y", (d, i) => 41 + i*20)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("text-decoration", d => {
                if (d.type === "h") {
                    return showOptions.hMiss ? "none": "line-through"
                } else {
                    return showOptions.vMiss ? "none": "line-through"
                }
            })
            .text("Miss");
    
    }, [game, showOptions]);

    return (
        <div className={"container "+styles.shootingDiv}>
            <Message localKey="shooting" />
            <div>
                {content}
            </div>
            <Loading isActive={loading} />
        </div>
    );
}

export async function getStaticProps(context) {
    const date = parseInt(context.params.date);

    const { client } = await connectToDatabase();
  
    const isConnected = await client.isConnected();
    console.log("MongoDB connection: " + isConnected);

    const db = client.db("nba");
    const collection = db.collection("shooting");

    const query = { "Game Date": date };
    const cursor = collection.find(query);

    const shootingData = {};
    
    await cursor.forEach(item => {
        delete item._id;
        const gameId = item["Game ID"];

        if (Object.prototype.hasOwnProperty.call(shootingData, gameId)) {
            shootingData[gameId].push(item);
        }
        else {
            shootingData[gameId] = [item];
        }
    });

    return {
      props: { date, shootingData },
    }
}

export async function getStaticPaths() {
    const days2018 = dates2018.dates;

    return {
        paths: days2018.map(day => {
            return { params: { date: day } }
        }),
        fallback: false
    };
}

export default ShootingMap;
