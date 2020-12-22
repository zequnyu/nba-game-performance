import { useState, useEffect, useContext, useRef } from 'react';
import * as d3 from 'd3';

import { NBAContext, BAR_CATEGORIES } from '../lib/utils';

import Dropdown from '../components/Dropdown';
import Message from '../components/Message';

import styles from '../styles/Bar.module.css';

function BarChart() {
    const svgRef = useRef();
    const [g] = useContext(NBAContext);
    const [category, setCategory] = useState(BAR_CATEGORIES[0]);
    
    const data = g.season.teamStats.map(team => {
        const t = g.season.teams.find(tm => tm.teamId === team.teamId);
        return {
            name: team.abbreviation,
            value: team[category.key].avg,
            primaryColor: t.primaryColor,
            secondaryColor: t.secondaryColor,
            teamId: t.teamId,
            fullName: t.fullName
        }
    })

    useEffect(() => {
        var margin = { top: 80, left: 75, bottom: 50, right: 50 },
            width = 1200 - margin.left - margin.right,
            height = 650 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);

        svg.selectAll("*").remove();

        svg.attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr("viewBox", [-margin.left, -margin.top, width + margin.left + margin.right, height + margin.top + margin.bottom])
            .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
        
        var x = d3.scaleBand();
        var y = d3.scaleLinear();

        var delay = function (d, i) {
            return i * 50;
        };

        var all, closer, farther;
        var current, sortMode; 
        var xAxis; // make xAxis global variable
        var all_indicator;
        
        all = data.slice();
        
        all.sort((a, b) => d3.ascending(a.value, b.value));
        closer = all.slice(0, 10); //set closer to the 10 teams with smallest values 
        farther = all.slice(-10); //set farther to the 10 teams with largest values 

        filter('#all');
        sort('#alphabetic');

        toggleFilter('#all');
        toggleSort('#alphabetic');

        draw();

        //enable clicking for all buttons 
        function pe_auto() { 
            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'auto');
        }

        //sort event handlers
        d3.select('#alphabetic')
        .on('click', () => {
            sort('#alphabetic');
            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking      
            transition();
            setTimeout(pe_auto, 1000); // enable clicking after 1 second 
            toggleSort('#alphabetic');
        });

        d3.select('#ascending')
        .on('click', () => {
            sort('#ascending');
            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking      
            transition();
            setTimeout(pe_auto, 1000); // enable clicking after 1 second 
            toggleSort('#ascending');
        });

        d3.select('#descending')
        .on('click', () => {
            sort('#descending');
            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking       
            transition();
            setTimeout(pe_auto, 1000); // enable clicking after 1 second 
            toggleSort('#descending');
        });

        //filter event handlers
        d3.select('#all')
            .on('click', () => {
                filter('#all');
                sort(sortMode);

                toggleSort(sortMode);
                toggleFilter('#all');

                d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking      
                redraw();
                setTimeout(pe_auto, 1000); // enable clicking after 1 second 
        });

        d3.select('#closer')
        .on('click', () => {
            filter('#closer');
            sort(sortMode);

            toggleSort(sortMode);
            toggleFilter('#closer');

            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking       
            redraw();
            setTimeout(pe_auto, 1000); // enable clicking after 1 second 
        });

        d3.select('#farther')
        .on('click', () => {
            filter('#farther');
            sort(sortMode);

            toggleSort(sortMode);
            toggleFilter('#farther');
            
            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking        
            redraw();
            setTimeout(pe_auto, 1000); // enable clicking after 1 second 
        });

        // reset to all 10 teams ordered alphabetic by name
        d3.select('#reset')
        .on('click', () => {
            filter('#all');
            sort('#alphabetic');

            toggleSort('#alphabetic');
            toggleFilter('#all');

            d3.selectAll('.filter,#reset,.sort').style('pointer-events', 'none'); // disable all buttons from clicking       
            redraw();
            setTimeout(pe_auto, 1000); // enable clicking after 1 second 
        });

        function filter(mode) {
            if (mode === '#all') {
                current = JSON.parse(JSON.stringify(all));
                all_indicator = true;
            } else if (mode === '#closer') {
                current = JSON.parse(JSON.stringify(closer));
                all_indicator = false; 
            } else if (mode === '#farther') {
                current = JSON.parse(JSON.stringify(farther));
                all_indicator = false;
            }
        }
        
        function sort(mode) {
            if (mode === '#alphabetic') {
                current.sort((a, b) => d3.ascending(a.name, b.name));
            } else if (mode === '#ascending') {
                current.sort((a, b) => d3.ascending(a.value, b.value));
            } else if (mode === '#descending') {
                current.sort((a, b) => d3.descending(a.value, b.value));
            }
            x.domain(current.map(d => d.name));
            sortMode = mode;
        }
        
        //highlight buttons with class 'sort' 
        function toggleSort(id) {
            d3.selectAll('.sort')
                .attr('class', 'button is-light sort');
            d3.select(id)
                .attr('class', 'button is-info is-light sort');
        }
        
        //highlight buttons with class 'filter' 
        function toggleFilter(id) {
            d3.selectAll('.filter')
                .attr('class', 'button is-light filter');
            d3.select(id)
                .attr('class', 'button is-info is-light filter');
        }
        
        function redraw() {
            //update scale
            x.domain(current.map(d => d.name));
        
            // update x axis so that make a team label transition
            svg.transition()
                .duration(750)
                .select('.axis')
                .call(xAxis);
        
            ////////////////////////////////
            // DATA JOIN FOR BARS.
            var bars = svg.selectAll('.'+styles.bar)
                .data(current, d => d.name);
        
            // UPDATE.
            bars.transition()
                .duration(750)
                .delay(delay)
                .attr('x', d => x(d.name))
                .attr('width', x.bandwidth());
        
            // ENTER.
            bars.enter()
                .append('rect')
                .attr('x', d => x(d.name))  
                .attr('y', y(0))
                .attr('width', x.bandwidth())
                .transition()  
                .duration(750)  
                .attr('class', styles.bar)
                .attr('x', d => x(d.name))
                .attr('y', d => y(d.value))  
                .attr('width', x.bandwidth()) 
                .attr('height', d => height - y(d.value))
                .attr("fill", d => {
                    const [r, g, b] = d.primaryColor;
                    return `rgba(${r}, ${g}, ${b}, 0.5)`;
                });
        
            // EXIT.
            bars.exit()
                .transition()  
                .duration(750)  
                .style('opacity', 0)  
                .remove();  
        
            ////////////////////////////////
            // DATA JOIN FOR Logos.
            var logo = svg.selectAll('.logo')
                .data(current, d => d.name);
        
            // UPDATE.
            logo.transition()
                .duration(750)
                .delay(delay)
                .attr('cx', d => x(d.name) + x.bandwidth() / 2)
                .attr('cy', d => {
                    if(all_indicator) return y(d.value) - 15;
                    else return y(d.value) - 42;
                })
                .attr('r', ()=>{
                    if(all_indicator) return 15;
                    else return 42;
                });
        
            // ENTER.
            var patternImg = svg.selectAll('.pattern-img')
                .data(current, d => d.name);
            
            patternImg
                .attr("height", ()=>{
                    if(all_indicator) return 30;
                    else return 84;
                })
                .attr("width", ()=>{
                    if(all_indicator) return 30;
                    else return 84;
                });
            
            logo.enter()
                .append('circle')
                .style('opacity', 0)
                .transition()
                .duration(1000)
                .attr('class', 'logo')
                .attr('style', d => d.name)
                .attr('cx', d => x(d.name) + x.bandwidth() / 2)
                .attr('cy', d => {
                    if(all_indicator) return y(d.value) - 15;
                    else return y(d.value) - 42;
                }) 
                .attr('r', ()=>{
                    if(all_indicator) return 15;
                    else return 42;
                })
                .style("fill", function(d) { return ("url(#"+d.teamId+"-img)");})
                .style('opacity', 1);

        
            // EXIT.
            logo.exit()
                .transition()
                .duration(750)
                .style('opacity', 0)
                .remove();
        }
        
        function transition() {
            var transition = svg.transition()
                .duration(750);
        
            transition.selectAll('.'+styles.bar)
                .delay(delay)
                .attr('x', d => x(d.name));
        
            transition.selectAll('.logo')
                .delay(delay)
                .attr('cx', d => x(d.name) + x.bandwidth() / 2);
        
            // update x scale and x axis 
            x.domain(current.map(d => d.name));
            transition                   
                .select(".axis")   
                .call(xAxis);
        }
        
        function draw() {
            x.domain(current.map(d => d.name))
                .range([0, width])
                .paddingInner(0.2)
                .paddingOuter(0.2); // add outer padding to scaleBand
        
            y.domain([+d3.min(current, d => d.value)-0.01, d3.max(current, d => d.value)])
                .range([height, 0])
                .nice();
        
            svg.selectAll('.'+styles.bar)
                .data(current)
                .enter()
                .append('rect')
                .attr('class', styles.bar)
                .attr('x', d => x(d.name))
                .attr('y', d => y(d.value))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d.value))
                .attr("fill", d => {
                    const [r, g, b] = d.primaryColor;
                    return `rgba(${r}, ${g}, ${b}, 0.5)`;
                });

            svg.selectAll('.pattern')
                .data(current)
                .enter()
                .append('pattern')
                .attr('id', function(d) { return (d.teamId+"-img");}) 
                .attr('width', 1)
                .attr('height', 1)
                .attr('patternUnits', 'objectBoundingBox')
                .append("image")
                .attr('class', 'pattern-img')
                .attr('x', 0)
                .attr('y', 0)
                .attr("xlink:href", function(d) { return ('/teams/'+d.teamId+'.gif');}) 
                .attr("height", ()=>{
                    if(all_indicator) return 30;
                    else return 84;
                })
                .attr("width", ()=>{
                    if(all_indicator) return 30;
                    else return 84;
                });

            svg.selectAll('.logo')
                .data(current)
                .enter()
                .append('circle')
                .attr('class', 'logo')
                .attr('style', d => d.name)
                .attr('cx', d => x(d.name) + x.bandwidth() / 2)
                .attr('cy', d => {
                    if(all_indicator) return y(d.value) - 15;
                    else return y(d.value) - 42;
                })
                .attr('r', ()=>{
                    if(all_indicator) return 15;
                    else return 42;
                })
                .style("fill", function(d) { return ("url(#"+d.teamId+"-img)");});
        
            xAxis = d3.axisBottom()
                .scale(x); // show team tick mark labels
        
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);
        
            svg.append('text')
                .attr('class', styles.xlabel)
                .text('From')
                .attr('y', height + 40); 
        
            svg.append('text')
                .attr('class', styles.xlabel)
                .text('to')
                .attr('x', width - 50)
                .attr('y', height + 40); 
        
            var yAxis = d3.axisLeft()
                .scale(y)
                .ticks(5);
        
            svg.append('g')
                .attr('class', 'axis')
                .call(yAxis);
        
            svg.append('text')
                .attr('x', - height / 2)
                .attr('y', - margin.left * 0.7)
                .attr('transform', 'rotate(-90)')
                .attr('class', styles.ylabel)
                .append('tspan').text(category.fullName);
        }
    }, [data])

    return (
        <div className="container">
            <Message localKey="bar" />
            <div className={styles.dropdown}>
                <Dropdown 
                    items={BAR_CATEGORIES} 
                    activeKey={category.key} 
                    setActiveKey={(key) => {
                        setCategory(BAR_CATEGORIES.find(c => c.key === key))
                    }}                
                />
            </div>
            <div>
                {/* Draw SVG chart here */}
                

                <div className={styles.commands}>
                    <button className="button is-light" id='reset'>Reset</button>
                </div>

                <div className={styles.commands}>
                    <button className="button is-light filter" id="all">All</button>
                    <button className="button is-light filter" id="farther">Filter top 10 by value</button>
                    <button className="button is-light filter" id="closer">Filter bottom 10 by value</button>
                </div>

                <div className={styles.commands}>
                    <button className="button is-light sort" id="alphabetic">Order alphabetic by name</button>
                    <button className="button is-light sort" id="ascending">Order ascending by value</button>
                    <button className="button is-light sort" id="descending">Order descending by value</button>
                </div>

                <div className={styles.divSvg}>
                    <svg ref={svgRef} align="center"></svg>
                </div>
            </div>
        </div>
    );
}

export default BarChart;