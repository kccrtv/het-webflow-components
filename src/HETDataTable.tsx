import React, { useEffect, useRef, useState } from 'react';

interface HETDataTableProps {
  datasetUrl: string;
  title?: string;
  subtitle?: string;
  demographicField?: string;
  metricFields?: string; // Comma-separated string
  columnHeaders?: string; // Comma-separated string
  timeFilter?: string;
  showAllRow?: boolean;
  methodologyUrl?: string;
  sourceUrl?: string;
  sourceText?: string;
  dataYear?: string;
}

interface DataRow {
  [key: string]: any;
}

const HETDataTable: React.FC<HETDataTableProps> = ({
  datasetUrl,
  title = 'Summary',
  subtitle = '',
  demographicField = 'race_and_ethnicity',
  metricFields = 'hiv_prevalence_per_100k,hiv_diagnoses_per_100k,hiv_deaths_per_100k',
  columnHeaders = 'HIV prevalence per 100k people,HIV diagnoses per 100k people,HIV deaths per 100k people',
  timeFilter = '2021',
  showAllRow = true,
  methodologyUrl = 'https://healthequitytracker.org/exploredata?mls=1.hiv-3.00&group1=All',
  sourceUrl = 'https://www.cdc.gov/nchhstp/atlas/index.htm',
  sourceText = 'CDC NCHHSTP AtlasPlus',
  dataYear = '2021'
}) => {
  const [data, setData] = useState<DataRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Parse comma-separated strings into arrays
  const metricFieldsArray = metricFields.split(',').map(s => s.trim()).filter(s => s);
  const columnHeadersArray = columnHeaders.split(',').map(s => s.trim()).filter(s => s);

  // Debug logging
  console.log('metricFields:', metricFields);
  console.log('metricFieldsArray:', metricFieldsArray);
  console.log('columnHeaders:', columnHeaders);
  console.log('columnHeadersArray:', columnHeadersArray);

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

  // Track responsive width
  useEffect(() => {
    if (!tableRef.current) return;

    const updateWidth = () => {
      if (tableRef.current) {
        const parentWidth = tableRef.current.parentElement?.clientWidth;
        setContainerWidth(parentWidth || null);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'sans-serif'
      }}>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        fontFamily: 'sans-serif'
      }}>
        <p><strong>Error loading data:</strong> {error}</p>
      </div>
    );
  }

  // Filter data for the specified time period
  let filteredData = data.filter(d => d.time_period === timeFilter);

  if (filteredData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No data available for {timeFilter}</p>
      </div>
    );
  }

  // Debug: log available fields
  console.log('Available fields in data:', Object.keys(filteredData[0]));

  // Separate "All" from other categories
  const allData = filteredData.find(d => d[demographicField] === 'All');
  let otherData = filteredData.filter(d => d[demographicField] !== 'All');

  // Calculate percentage shares if requested but not in data
  if (metricFieldsArray.some(f => f.includes('_pct_share') || f === 'population_pct')) {
    const allPrevalence = allData?.hiv_prevalence_per_100k || 0;
    
    filteredData = filteredData.map(row => {
      const newRow = { ...row };
      
      // Calculate HIV prevalence percent share
      if (metricFieldsArray.includes('hiv_prevalence_pct_share') && !row.hiv_prevalence_pct_share) {
        const prevalence = row.hiv_prevalence_per_100k || 0;
        newRow.hiv_prevalence_pct_share = allPrevalence > 0 ? (prevalence / allPrevalence) * 100 : 0;
      }
      
      // For population_pct, we'd need population data which isn't in this dataset
      // Set to 0 or N/A for now
      if (metricFieldsArray.includes('population_pct') && !row.population_pct) {
        newRow.population_pct = null; // Will show as "—"
      }
      
      return newRow;
    });
    
    // Recalculate allData and otherData after adding calculated fields
    const allDataUpdated = filteredData.find(d => d[demographicField] === 'All');
    otherData = filteredData.filter(d => d[demographicField] !== 'All');
  }

  // Sort alphabetically by demographic
  otherData = otherData.sort((a, b) => 
    String(a[demographicField]).localeCompare(String(b[demographicField]))
  );

  // Combine: All at top, then others
  const tableData = showAllRow && allData ? [allData, ...otherData] : otherData;

  // Format value helper
  const formatValue = (value: any, fieldName: string): string => {
    if (value === null || value === undefined) return '—';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);

    // Percentage fields
    if (fieldName.includes('pct') || fieldName.includes('share')) {
      return `${numValue.toFixed(1)}%`;
    }
    
    // Per 100k fields
    if (fieldName.includes('per_100k')) {
      return `${Math.round(numValue)}`;
    }

    // Count fields
    if (fieldName.includes('count') || fieldName.includes('total')) {
      return numValue.toLocaleString();
    }

    return numValue.toLocaleString();
  };

  // Get additional context for per 100k values (count and population)
  const getAdditionalInfo = (row: DataRow, fieldName: string): string => {
    if (!fieldName.includes('per_100k')) return '';
    
    // Try to find related count and population fields
    const baseFieldName = fieldName.replace('_per_100k', '');
    const countField = `${baseFieldName}_count`;
    const popField = 'population';
    
    const count = row[countField];
    const population = row[popField];
    
    if (count !== undefined && count !== null && population !== undefined && population !== null) {
      return ` ( ${Number(count).toLocaleString()} Individuals living with HIV / ${Number(population).toLocaleString()} Total population )`;
    }
    
    return '';
  };

  return (
    <div 
      ref={tableRef}
      style={{ 
        fontFamily: 'sans-serif', 
        padding: '20px',
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
      {/* Title */}
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '5px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        {title}
      </h3>
      
      {/* Subtitle */}
      {subtitle && (
        <p style={{ 
          textAlign: 'center', 
          marginTop: '0',
          marginBottom: '20px',
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#666'
        }}>
          {subtitle}
        </p>
      )}

      {/* Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              borderBottom: '2px solid #ddd',
              fontWeight: '600',
              fontSize: '13px',
              color: '#333'
            }}>
              {demographicField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </th>
            {columnHeadersArray.map((header, idx) => (
              <th key={idx} style={{
                padding: '12px',
                textAlign: 'left',
                borderBottom: '2px solid #ddd',
                fontWeight: '600',
                fontSize: '13px',
                color: '#333'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx} style={{
              backgroundColor: rowIdx % 2 === 0 ? 'white' : '#f9f9f9'
            }}>
              <td style={{
                padding: '12px',
                borderBottom: '1px solid #e0e0e0',
                fontSize: '13px',
                fontWeight: row[demographicField] === 'All' ? '600' : '400'
              }}>
                {row[demographicField]}
              </td>
              {metricFieldsArray.map((field, fieldIdx) => {
                const value = row[field];
                const additionalInfo = getAdditionalInfo(row, field);
                
                // Debug logging for first row
                if (rowIdx === 0) {
                  console.log(`Field: ${field}, Value: ${value}`);
                }
                
                return (
                  <td key={fieldIdx} style={{
                    padding: '12px',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '13px'
                  }}>
                    <span style={{ fontWeight: row[demographicField] === 'All' ? '600' : '400' }}>
                      {formatValue(value, field)}
                    </span>
                    {additionalInfo && (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        display: 'block',
                        marginTop: '4px'
                      }}>
                        {additionalInfo}
                      </span>
                    )}
                    {field.includes('per_100k') && !additionalInfo && value !== null && (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        marginLeft: '4px'
                      }}>
                        per 100k
                      </span>
                    )}
                    {field.includes('prevalence') && field.includes('pct') && (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        marginLeft: '4px'
                      }}>
                        of HIV prevalence
                      </span>
                    )}
                    {field.includes('population') && field.includes('pct') && (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        marginLeft: '4px'
                      }}>
                        of population
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer notes */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '11px', 
        color: '#666',
        lineHeight: '1.6'
      }}>
        <p style={{ margin: '5px 0' }}>
          Note. (NH) indicates 'Non-Hispanic'. {methodologyUrl && (
            <a 
              href={methodologyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#0066cc', textDecoration: 'none' }}
            >
              View methodology
            </a>
          )}
          {!methodologyUrl && 'View methodology'}
          .
        </p>
        <p style={{ margin: '5px 0' }}>
          Sources: {sourceUrl ? (
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#0066cc', textDecoration: 'none' }}
            >
              {sourceText}
            </a>
          ) : sourceText} (data from {dataYear}).
        </p>
        <p style={{ margin: '5px 0' }}>
          Health Equity Tracker. ({new Date().getFullYear()}). Satcher Health Leadership Institute. 
          Morehouse School of Medicine. https://healthequitytracker.org.
        </p>
      </div>
    </div>
  );
};

export default HETDataTable;