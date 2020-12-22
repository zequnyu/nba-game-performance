import { useState, useRef, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import * as d3 from 'd3';
import moment from 'moment';

import { NBAContext, useBoxScore } from '../../lib/utils';

import DatePicker from '../../components/DatePicker';
import Dropdown from '../../components/Dropdown';
import ScoreBox from '../../components/ScoreBox';
import Loading from '../../components/Loading';
import Message from '../../components/Message';

import dates2018 from '../../public/2018/game_dates.json';

import styles from '../../styles/PieChart.module.css';

function PieChart({ date }) {
    const svgRef = useRef();
    const router = useRouter();
    const [g] = useContext(NBAContext);

    const [loading, setLoading] = useState(false);

    const currentDate = moment(date.toString(), 'YYYYMMDD').toDate();

    const games = g.season.schedule
        .filter(game => game.startDateEastern === date.toString())
        .map(item => {
            const h = g.season.teams.find(team => team.teamId === item.hTeam.teamId).tricode;
            const v = g.season.teams.find(team => team.teamId === item.vTeam.teamId).tricode;

            return {
                key: item.gameId,
                fullName: `${v} (V) : ${h} (H)`
            }
        });
    
    const { boxScoreData, isLoading } = useBoxScore(g.season.key, date.toString(), (games.length > 0));
    const [game, setGame] = useState(games[0]);

    useEffect(() => {
        setLoading(false);
        setGame(games[0]);
    }, [date]);

    let scorebox, content, data;
    if (isLoading) {
        content = <div>Loading data...</div>;
        scorebox = <div></div>;
        data = null;
    } else if (boxScoreData && games.length > 0) {
        content = (
            <Dropdown 
                items={games}
                activeKey={game.key}
                setActiveKey={(key) => {
                    const newGame = games.find(game => game.key === key);
                    setGame(newGame);
                }}
            />
        );

        data = boxScoreData.find(item => item.basicGameData.gameId === game.key);
        
        if (data) {
            const homeTeam = {
                ...g.season.teams.find(team => team.teamId === data.basicGameData.hTeam.teamId),
                score: data.basicGameData.hTeam.score,
                photoUrl: `/teams/${data.basicGameData.hTeam.teamId}.gif`
            };
            const visitTeam = { 
                ...g.season.teams.find(team => team.teamId === data.basicGameData.vTeam.teamId),
                score: data.basicGameData.vTeam.score,
                photoUrl: `/teams/${data.basicGameData.vTeam.teamId}.gif`
            };
            scorebox = (
                <div>
                     <ScoreBox home={homeTeam} visit={visitTeam} />
                </div>
            );
        }
    } else {
        content = <div>No game in selected date.</div>;
        scorebox = <div></div>;
        data = null;
    }

    useEffect(() => { 
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

        let radius;   
        if (data) {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();
            let players = data.stats.activePlayers.filter((player) => {
                return player.points > 0;
            });
            let l = players.length;
            let homescore = data.basicGameData.hTeam.score;
            let awayscore = data.basicGameData.vTeam.score;
            let width = parseInt(svg.style('width'));
            let height = parseInt(svg.style('height'));
            radius = Math.min(width, height) / 4;
            let homeid = data.basicGameData.hTeam.teamId;

            var colorhome = d3.scaleSequential(d3.interpolateReds)
            var coloraway = d3.scaleSequential(d3.interpolateBlues)
            var colorh = d3.scaleQuantize([0, 100], d3.schemeBlues[5])
            var colora = d3.scaleQuantize([0, 100], d3.schemeReds[5])

            svg.attr('width', width)
                .attr('height', height)
                .call(responsive);

            let g = svg.append('g')
                .attr("stroke", "white")
                .attr('transform', 'translate(' + width / 2 + ',' + height / 4 + ')');
            
            var pie = d3.pie()
                .startAngle(Math.PI)
                .endAngle(3*Math.PI) 
                .value(d => d.points)
                .sort(null)  

            var path = d3.arc()  
                .outerRadius(radius)  
                .innerRadius(radius/2); 
            
            var label = d3.arc()  
                .outerRadius(radius + 100)  
                .innerRadius(radius + 100);  
            
            var number = d3.arc()  
                .outerRadius(radius - 40)  
                .innerRadius(radius - 40);

            var arc = g.selectAll('.arc')  
                .data(pie(players))  
                .enter()
                .append('g')
                .attr('class', 'arc')

            var area = arc.append('path')  
                .attr("style", "fill-opacity:0.75;")
                .attr("data", function(d) {
                    return JSON.stringify(d.data);
                })
                .attr('fill', d => d.data.teamId == homeid ? colorhome(d.data.fgp/100) : coloraway((d.data.fgp)/100));
            area.transition()
                .delay(function(d,i) {
                    if(d.data.teamId != homeid){
                        return i*5;
                    }
                    else{
                        return (l-1-i)*5;
                    }
                })
                .duration(function(d) {
                    if(d.data.teamId != homeid){
                        return 2000 + (awayscore - homescore)*30;
                    }
                    else{
                        return 2000 + (homescore - awayscore)*30;
                    }
                })
                .attrTween('d', function(d) {
                    let fi;
                    if (d.data.teamId != homeid) {
                        fi = d3.interpolate(d.startAngle, d.endAngle);
                        return function(t) {
                            d.endAngle = fi(t);
                            return path(d);
                        }
                    }
                    else {
                        fi = d3.interpolate(d.endAngle, d.startAngle);
                        return function(t) {
                            d.startAngle = fi(t);
                            return path(d);
                        }
                    }
                });
                
            arc.append('text')
                .classed("name", true)
                .attr('transform', d => 'translate(' + label.centroid(d) + ')')  
                .attr('dy', '0.35em')
                .text(d => d.data.firstName+' '+ d.data.lastName)
                .style('display', 'none')
            
            arc.append('text')
                .classed("number", true)
                .attr('transform', d => 'translate(' + number.centroid(d) + ')')  
                .attr('dy', '0.35em')
                .text(d => d.data.points)
                .style("font-weight", "bold")
                .style('display', 'none')

            var tooltip = g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 30)
                .attr("id", "tooltip")
                .attr("style", "opacity:0")
                .attr("transform", "translate(-500,-500)");
        
            tooltip.append("rect")
                .attr("id", "tooltipRect")
                .attr("width", 120)
                .attr("height", 80)
                .attr("opacity", 0.8)
                .attr("rx", 5)
                .style("fill", "#000000");
        
            tooltip
                .append("text")
                .attr("id", "tooltipText")
                .attr("x", 30)
                .attr("y", 15)
                .attr("fill", "#fff")
                .style("font-size", 15)
                .style("font-family", "arial")
                .text(function() {
                    return "";
                });
            
           
            area.on("mouseover", function(event) { 
                d3.select(this).attr("stroke", "#000"); 
                d3.select(this).attr("style", "fill-opacity:1;");
                d3.select(this).select('.name')
                .style('display', 'initial');
                d3.select(this).select('.number')
                    .style('display', 'initial');

                var fadeInSpeed = 120;
                d3.select("#tooltip")
                    .transition()
                    .duration(fadeInSpeed)
                    .style("opacity", function() {
                        return 1;
                    });
                d3.select("#tooltip")
                    .attr("transform", function() {
                        var mouseCoords = d3.pointer(event);
                        var xCo = mouseCoords[0] + 10;;
                        var yCo = mouseCoords[1] + 10;
                        return "translate(" + xCo + "," + yCo + ")";
                    });
                
                d3.selectAll("#tooltipText").text("");
                var pdata = JSON.parse(d3.select(this).attr("data"));
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 0).attr("dy", "1.9em").text(pdata.firstName + ' ' + pdata.lastName).style("font-weight", "bold").style("text-anchor", "middle");
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 30).attr("dy", "1.6em").text(pdata.points + " points").style("text-anchor", "middle");
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 40).attr("dy", "2em").text(pdata.totReb + " rebounds").style("text-anchor", "middle");
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 50).attr("dy", "2.4em").text(pdata.assists + " assists").style("text-anchor", "middle");
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 60).attr("dy", "2.8em").text(pdata.steals + " steals").style("text-anchor", "middle");
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 70).attr("dy", "3.2em").text(pdata.blocks + " blocks").style("text-anchor", "middle");
                d3.selectAll("#tooltipText").append("tspan").attr("x", 0).attr("y", 80).attr("dy", "3.6em").text(pdata.fgm+'/'+pdata.fga+' '+ pdata.fgp+"% fgp").style("text-anchor", "middle");
                var dims = helpers.getDimensions("tooltipText");
                d3.selectAll("#tooltipText" + " tspan")
                    .attr("x", dims.w + 2);
        
                d3.selectAll("#tooltipRect")
                    .attr("width", dims.w*2)
                    .attr("height", dims.h + 40);
            });

            area.on("mousemove", function(event) {            
                d3.selectAll("#tooltip")
                    .attr("transform", function() {
                        var mouseCoords = d3.pointer(event);
                        var xCo = mouseCoords[0] + 10;
                        var yCo = mouseCoords[1] + 10;
                        return "translate(" + xCo + "," + yCo + ")";
                    });
            });

            area.on("mouseout", function() { 
                d3.select(this).attr("stroke", null); 
                d3.select(this).attr("style", "fill-opacity:0.75;");
                d3.select(this).select('.name')
                  .style('display', 'none');
                d3.select(this).select('.number')
                    .style('display', 'none');  

                d3.select("#tooltip")
                    .style("opacity", function() {
                        return 0;
                    });
                d3.select("#tooltip").attr("transform", function() {
                    var x = -500;
                    var y = -500;
                    return "translate(" + x + "," + y + ")";
                });
            
            });

            const hCode = data.basicGameData.hTeam.triCode;
            const vCode = data.basicGameData.vTeam.triCode;

            svg.append("g")
                .attr('transform', 'translate(' + width / 10 + ',' + -height / 300 + ')')
                .append(() => legend({color: colorh, title: `Field goal percentage(%) ${vCode}`, width: 260 }));

            svg.append("g")
                .attr('transform', 'translate(' + width*2/3 + ',' + -height / 300 + ')')
                .append(() => legend({color: colora, title: `Field goal percentage(%) ${hCode}`, width: 260}));

            var helpers = {
                getDimensions: function(id) {
                    var el = document.getElementById(id);
                    var w = 0,
                        h = 0;
                    if (el) {
                        var dimensions = el.getBBox();
                        w = dimensions.width;
                        h = dimensions.height;
                    } else {
                        console.log("error: getDimensions() " + id + " not found.");
                    }
                    return {
                        w: w,
                        h: h
                    };
                }
            }   
        }

        function responsive(svg) {
            const container = d3.select('.'+styles.svgDiv),
                width = parseInt(svg.style('width'), 10),
                height = parseInt(svg.style('height'), 10);

            svg.attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMinYMid')
                .call(resize);

            d3.select(window).on(
                'resize.' + container.attr('id'), 
                resize
            );
            
            function resize() {
                const w = container.node().getBoundingClientRect().width*2;
                svg.attr('width', w*0.9);
                svg.attr('height', w);

                if (w < 1000) {
                    svg.selectAll('.number').style('display', 'initial');
                } else{
                    svg.selectAll('.number').style('display', 'none');
                }
            }
        }
    }, [data])

    return (
        <div>
            <Message localKey="pie" />
            <div className={"container " + styles.pieChartDiv}>
                <div className={styles.pieChartDivLeft}>
                    <div className={styles.dropdowns}>
                        <DatePicker 
                            minDateStr={g.season.startDate} 
                            maxDateStr={g.season.endDate} 
                            selectedDate={currentDate}
                            setSelectedDate={ (date) => {
                                setLoading(true); 
                                const d = moment(date).format('YYYYMMDD');
                                router.push(`/pie/`+d);
                            }}
                            disabledDatesStr={g.season.disabledDates}
                        />
                        {content}
                    </div>
                    {scorebox}
                </div>
                <div className={styles.svgDiv}>
                    <svg id='pie' className={styles.svg} ref={svgRef} width='1000' height='1000'></svg>
                </div>
                <Loading isActive={loading} />
            </div>
        </div>
    );
}

export async function getStaticProps(context) {
    const date = parseInt(context.params.date);
    
    return {
        props: { date },
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

export default PieChart;
