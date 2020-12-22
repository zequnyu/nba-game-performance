import { useState, useEffect, useContext, useRef } from 'react';
import * as d3 from 'd3';

import Dropdown from '../components/Dropdown';
import Message from '../components/Message';

import { NBAContext, BAR_CATEGORIES } from '../lib/utils';

import styles from '../styles/Circle.module.css';

function CirclePackingChart() {
    const svgRef = useRef();
    const [g] = useContext(NBAContext);
    const [category, setCategory] = useState(BAR_CATEGORIES[0]);

    useEffect(() => {
        const regions = {};
        g.season.teams.forEach(team=>{
            const obj = {
                id: team.teamId,
                name: team.fullName,
                color: team.primaryColor,
                children: g.season.players
                    .filter(player=>player.teamId===team.teamId)
                    .map(player=>{
                        return {
                            name: `${player.firstName} ${player.lastName}`,
                            value: player[category.key],
                            color: team.secondaryColor
                        }
                    })
            };
            if(Object.prototype.hasOwnProperty.call(regions, team.divName)){
                regions[team.divName].push(obj);
            } else {
                regions[team.divName]=[obj];  
            }
        })

        const data = {
            name: 'Bubble',
            children: Object.keys(regions).map(regionName=>{
                return {
                    name: regionName,
                    children: regions[regionName]
                }
            })
        }

        var width = 600;
        var height = width;
     
        var pack = data => d3.pack()
            .size([width, height])
            .padding(3)
            (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

            const root = pack(data);
            let focus = root;
            let view;

            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();
            svg
                .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
                .style("display", "block")
                .style("margin", "0 -14px")
                .style("cursor", "pointer")
                .attr("rx", 25)
                .on("click", (event) => zoom(event, root));

            const node = svg.append("g")
                .selectAll("circle")
                .data(root.descendants().slice(1))
                .join("circle")
                .attr("fill", d => {
                    if(d.depth==2||d.depth==3) {
                        const [r, g, b] = d.data.color;
                        return `rgba(${r}, ${g}, ${b}, 0.3)`;
                    }
                    else {return '#e6e6e6'}
                })
                .attr("pointer-events", d => !d.children ? "none" : null)
                .on("mouseover", function() { d3.select(this).attr("stroke", (d) => {
                    if(d.depth==2||d.depth==3) {
                        const [r, g, b] = d.data.color;
                        return `rgba(${r}, ${g}, ${b}, 0.3)`;
                    }
                    else {return '#e6e6e6'};
                })})
                .on("mouseout", function() { d3.select(this).attr("stroke", null); })
                .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

            const label = svg.append("g")
                .style("font-family", "sans-serif")
                .style("font-size", "16px")
                .style('font-style', 'bold')
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .selectAll("text")
                .data(root.descendants())
                .join("text")
                .style("fill-opacity", d => d.parent === root ? 1 : 0)
                .style("display", d => d.parent === root ? "inline" : "none")
                .text(d => d.data.name);

            zoomTo([root.x, root.y, root.r * 2]);

            function zoomTo(v) {
            const k = width / v[2];

            view = v;

            label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
            }

        function zoom(event, d) {
            focus = d;

            const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", () => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });

            label
            .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }        
    }, [category])


    return (
        <div className="container">
            <Message localKey="circle" />
            <div className={styles.dropdownDiv}>
                <Dropdown 
                    items={BAR_CATEGORIES} 
                    activeKey={category.key} 
                    setActiveKey={(key) => {
                        setCategory(BAR_CATEGORIES.find(c => c.key === key))
                    }}
                />
                <div className={styles.svgDiv}>
                    <svg ref={svgRef} width="600" height="600"></svg>
                </div>
            </div>
        </div>
    );
}


export default CirclePackingChart;