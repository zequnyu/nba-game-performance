import { useEffect, useContext, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";

import { NBAContext } from '../lib/utils';

import Dropdown from '../components/Dropdown';
import Message from '../components/Message';

import world from '../public/countries-50m.json';

import styles from '../styles/Choropleth.module.css';

function ChoroplethMap() {
    const svgRef = useRef();
    const [g] = useContext(NBAContext);
    const [isChecked, setIsChecked] = useState(true); 

    const [country, setCountry] = useState(null);

    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentPlayers, setCurrentPlayers] = useState([]);

    const abnormal = {};

    const gTeams = g.season.teams;
    const gKey = g.season.key;

    g.season.players.forEach(player=>{
        var flag = true;
        world.objects.countries.geometries.forEach(country=>{
            if(player.country===country.properties.name) flag = false;
        })
        if(flag) {
            if(Object.prototype.hasOwnProperty.call(abnormal, player.country)){} 
            else {
                abnormal[player.country] = [player.country];   
            }
        }
    })
    let data = [];

    useEffect(()=>{
        if(!isChecked) {abnormal.USA = "United States of America";} 
        // not include USA
        else {abnormal.USA = "USA";}

        abnormal['South Sudan'] = "S. Sudan";
        abnormal['Democratic Republic of the Congo'] = "Dem. Rep. Congo";
        abnormal['Dominican Republic'] = "Dominican Rep.";
        abnormal['Bosnia and Herzegovina'] = "Bosnia and Herz.";
        abnormal['Czech Republic'] = "Czechia";

        world.objects.countries.geometries.forEach(country=>{
            const obj = {
                country: country.properties.name,
                players: g.season.players
                    .filter(player=>{
                        if (Object.keys(abnormal).includes(player.country))
                            {return abnormal[player.country]===country.properties.name;}
                        else {return player.country===country.properties.name;}
                    }),
                population: g.season.players
                    .filter(player=>{
                        if (Object.keys(abnormal).includes(player.country))
                            {return abnormal[player.country]===country.properties.name;}
                        else {return player.country===country.properties.name;}
                    })
                    .length
            };
            data.push(obj);
        });

        // const rangeNum = d3.extent(data,d=>+d.population);
   },[isChecked, currentPlayers, currentPlayer]) 
    
    useEffect(() => {
        /////////////////////////////////////////////////////////////
        //Color Legend code
        function legend({
            color,
            title,
            tickSize = 6,
            width = 320,
            height = 44 + tickSize,
            marginTop = 18,
            marginRight = 0,
            marginBottom = 16 + tickSize,
            marginLeft = 0,
            ticks = width / 64,
            tickFormat,
            tickValues
        } = {}) { 

            const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .style("overflow", "visible")
                .style("display", "block");

            let x;

            // Continuous
            if (color.interpolator) {
                x = Object.assign(color.copy()
                    .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
                    { range() { return [marginLeft, width - marginRight]; } });

                svg.append("image")
                    .attr("x", marginLeft)
                    .attr("y", marginTop)
                    .attr("width", width - marginLeft - marginRight)
                    .attr("height", height - marginTop - marginBottom)
                    .attr("preserveAspectRatio", "none")
                    .attr("xlink:href", ramp(color.interpolator()).toDataURL());

                // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
                if (!x.ticks) {
                    if (tickValues === undefined) {
                        const n = Math.round(ticks + 1);
                        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
                    }
                    if (typeof tickFormat !== "function") {
                        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
                    }
                }
            }

            // Discrete
            else if (color.invertExtent) {
                const thresholds
                    = color.thresholds ? color.thresholds() // scaleQuantize
                        : color.quantiles ? color.quantiles() // scaleQuantile
                            : color.domain(); // scaleThreshold

                const thresholdFormat
                    = tickFormat === undefined ? d => d
                        : typeof tickFormat === "string" ? d3.format(tickFormat)
                            : tickFormat;

                x = d3.scaleLinear()
                    .domain([-1, color.range().length - 1])
                    .rangeRound([marginLeft, width - marginRight]);

                svg.append("g")
                    .selectAll("rect")
                    .data(color.range())
                    .join("rect")
                    .attr("x", (d, i) => x(i - 1))
                    .attr("y", marginTop)
                    .attr("width", (d, i) => x(i) - x(i - 1))
                    .attr("height", height - marginTop - marginBottom)
                    .attr("fill", d => d);

                tickValues = d3.range(thresholds.length);
                tickFormat = i => thresholdFormat(thresholds[i], i);
            }

            svg.append("g")
                .attr("transform", `translate(0, ${height - marginBottom})`)
                .call(d3.axisBottom(x)
                    .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
                    .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
                    .tickSize(tickSize)
                    .tickValues(tickValues))
                .call(g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height))
                .call(g => g.select(".domain").remove())
                .call(g => g.append("text")
                    .attr("y", marginTop + marginBottom - height - 6)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .text(title));

            return svg.node();
        }

        function ramp(color, n = 256) {
            const canvas = DOM.canvas(n, 1);
            const context = canvas.getContext("2d");
            for (let i = 0; i < n; ++i) {
                context.fillStyle = color(i / (n - 1));
                context.fillRect(i, 0, 1, 1);
            }
            return canvas;
        }

        /////////////////////////////////////////////////////////////
        //Choropleth code
        let color;
        if (isChecked) {color = d3.scaleQuantize([0, 12], d3.schemeBlues[6]);}
        else {color = d3.scaleQuantize([-99, 401], d3.schemeBlues[5]);}

        var mapData = Object.assign(new Map(data.map(({country, population}) => [country, +population])));  
        mapData.title = "Number of NBA players";

        // to display players info
        // var mapPlayers = Object.assign(new Map(data.map(({country, players, population}) => [country, players])));  

        var svg = d3.select(svgRef.current)

        svg.selectAll("*").remove();

        svg.attr("viewBox", [0, 0, 1300, 610]);
            
        var projection = d3.geoEquirectangular()
            .translate([650, 305]);  

        var path = d3.geoPath() 
            .projection(projection); 

        svg.append("g")
            .attr('class', styles.countries)
            .selectAll("path")
            .data(topojson.feature(world, world.objects.countries).features)  
            .join("path")
            .attr('class', styles.path)
            .attr("fill", d => {
                if (country === d.properties.name) {
                    return 'pink';
                } else {
                    return color(mapData.get(d.properties.name))
                }
            })  
            .attr("d", path)
            .on('click', (e) => {
                const thisCountry = e.target.textContent;
                setCountry(thisCountry);

                const countryData = data.filter(item => item.country === thisCountry)[0];

                const playersData = countryData.players.map(player => {
                    return {
                        key: player.personId,
                        fullName: `${player.firstName} ${player.lastName}`,
                        teamName: gTeams.find(team => team.teamId === player.teamId).fullName,
                        photoUrl: `/${gKey}/player_pic/${player.personId}.png`
                    }
                });
                playersData.sort();
                const player = (playersData.length > 0) ? playersData[0] : null;
                setCurrentPlayers(playersData);
                setCurrentPlayer(player);

            })
            .append("title")
            .text(d => d.properties.name);

        svg.append("path")
            .attr('class', styles['country-borders'])
            .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))  
            .attr("d", path);

        svg.append("g")
            .attr("transform", "translate(580,400)")
            .append(() => legend({ color, title: mapData.title, width: 260 }));
    }, [data])

    const toggleCheck = () => {
        setCurrentPlayers([]);
        setCurrentPlayer(null);
        setCountry(null);
        setIsChecked(!isChecked);
    }

    return (
        <div>
            <Message localKey="choropleth" />
            <div>
                {/* Draw SVG chart here */}
                <div className={styles.container}>
                    <label className={styles.checkbox}>
                        <div className={styles.label}>International Players only</div>
                        <input className={styles.input} type="checkbox" checked={isChecked} onChange={toggleCheck}></input>
                    </label>
                </div>
             
                <div className={styles.container}>
                    <svg ref={svgRef} width="1300" height="610"></svg>

                    <div>  
                        <div className={styles.alert}>
                            {country && <div>Country: {country}</div>}
                            {country && <div>Number of Players: {currentPlayers ? currentPlayers.length : 0}</div>}

                            {currentPlayers.length > 0 && currentPlayer && <div className={styles.playerBox}>
                                <div className={styles.dropdownDiv}>
                                    <Dropdown 
                                        items={currentPlayers} 
                                        activeKey={(currentPlayer ? currentPlayer.key : "")} 
                                        setActiveKey={(key) => {
                                            setCurrentPlayer(currentPlayers.find(player => player.key === key));
                                        }}
                                        disabled={currentPlayers.length === 0}
                                    />
                                </div>
                                
                                <div className={styles.cardDiv}>
                                    <figure className={styles.image}>
                                        <img src={currentPlayer.photoUrl} alt="Player image" />
                                        Team: {currentPlayer.teamName}
                                    </figure>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChoroplethMap;
