import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface HETRateBarChartProps {
  datasetUrl: string;
  title?: string;
  subtitle?: string;
  metricField?: string;
  demographicField?: string;
  timeFilter?: string;
  width?: number;
  height?: number;
  showAllBar?: boolean;
}

interface DataRow {
  [key: string]: any;
}

const HETRateBarChart: React.FC<HETRateBarChartProps> = ({
  datasetUrl,
  title = 'Health Outcomes',
  subtitle = '',
  metricField = 'hiv_prevalence_per_100k',
  demographicField = 'race_and_ethnicity',
  timeFilter = '2021',
  width = 900,
  height = 600,
  showAllBar = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DataRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(datasetUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(jsonData => {
        const dataArray = Array.isArray(jsonData) ? jsonData : jsonData.data || [];
        setData(dataArray);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [datasetUrl]);

  // Render chart
  useEffect(() => {
    if (!data || !containerRef.current || data.length === 0) return;

    // Filter data for the specified time period
    let filteredData = data.filter(d => 
      d.time_period === timeFilter &&
      d[metricField] !== null &&
      d[metricField] !== undefined &&
      !isNaN(Number(d[metricField]))
    );

    if (filteredData.length === 0) {
      setError(`No data available for ${timeFilter}`);
      return;
    }

    // Separate "All" from other categories
    const allData = filteredData.find(d => d[demographicField] === 'All');
    let otherData = filteredData.filter(d => d[demographicField] !== 'All');

    // Sort other data by metric value (descending)
    otherData = otherData.sort((a, b) => b[metricField] - a[metricField]);

    // Combine: All at top, then others
    const chartData = showAllBar && allData ? [allData, ...otherData] : otherData;

    // Clear previous chart
    d3.select(containerRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 80, right: 40, bottom: 80, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const maxValue = d3.max(chartData, d => Number(d[metricField])) || 0;
    const xScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(chartData.map(d => String(d[demographicField])))
      .range([0, innerHeight])
      .padding(0.3);

    // Color scale: orange for "All", teal for others
    const getBarColor = (d: DataRow) => {
      return d[demographicField] === 'All' ? '#F5A623' : '#2C7873';
    };

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('font-family', 'sans-serif')
      .text(title);

    // Add subtitle if provided
    if (subtitle) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 52)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-style', 'italic')
        .style('font-family', 'sans-serif')
        .style('fill', '#666')
        .text(subtitle);
    }

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => {
        const val = Number(d);
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
        return val.toString();
      });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif');

    // Add X axis label
    const metricLabel = metricField.replace(/_/g, ' ').replace('per 100k', 'per 100k');
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', 'sans-serif')
      .style('font-weight', '600')
      .text(metricLabel);

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-family', 'sans-serif')
      .style('font-weight', '600')
      .text(demographicField.replace(/_/g, ' '));

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('text-anchor', 'end');

    // Remove Y axis line
    g.select('.domain').remove();

    // Add gridlines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(6))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1);

    // Add bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(String(d[demographicField])) || 0)
      .attr('width', d => xScale(Number(d[metricField])))
      .attr('height', yScale.bandwidth())
      .attr('fill', getBarColor)
      .attr('rx', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const currentColor = getBarColor(d);
        d3.select(this)
          .attr('fill', d3.color(currentColor)?.darker(0.3)?.toString() || currentColor);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', getBarColor(d));
      });

    // Add value labels at end of bars
    g.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(Number(d[metricField])) + 8)
      .attr('y', d => (yScale(String(d[demographicField])) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .style('fill', '#333')
      .style('font-weight', '500')
      .text(d => {
        const val = Number(d[metricField]);
        if (val >= 1000) {
          return `${val.toLocaleString()} per 100k`;
        }
        return `${Math.round(val)} per 100k`;
      });

  }, [data, width, height, metricField, demographicField, timeFilter, showAllBar]);

  if (loading) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'sans-serif'
      }}>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '20px',
        fontFamily: 'sans-serif'
      }}>
        <div>
          <p><strong>Error loading chart:</strong></p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <div ref={containerRef} />
      <div style={{ 
        marginTop: '20px', 
        fontSize: '11px', 
        color: '#666',
        maxWidth: width 
      }}>
        <p style={{ margin: '5px 0' }}>
          Note: (NH) indicates 'Non-Hispanic'. View methodology.
        </p>
        <p style={{ margin: '5px 0' }}>
          Sources: CDC data from {timeFilter}.
        </p>
        <p style={{ margin: '5px 0' }}>
          Health Equity Tracker. ({new Date().getFullYear()}). Satcher Health Leadership Institute. 
          Morehouse School of Medicine. https://healthequitytracker.org.
        </p>
      </div>
    </div>
  );
};

export default HETRateBarChart;