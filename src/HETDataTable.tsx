import React, { useEffect, useState } from 'react';

interface HETDataTableProps {
  datasetUrl: string;
  title?: string;
  subtitle?: string;
  demographicField?: string;
  metricFields?: string[];
  columnHeaders?: string[];
  timeFilter?: string;
  showAllRow?: boolean;
}

interface DataRow {
  [key: string]: any;
}

const HETDataTable: React.FC<HETDataTableProps> = ({
  datasetUrl,
  title = 'Summary',
  subtitle = '',
  demographicField = 'race_and_ethnicity',
  metricFields = ['hiv_prevalence_per_100k', 'hiv_prevalence_pct_share', 'population_pct'],
  columnHeaders = ['HIV prevalence per 100k people', 'Share of total HIV prevalence', 'Population share (ages 13+)'],
  timeFilter = '2021',
  showAllRow = true
}) => {
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

  // Separate "All" from other categories
  const allData = filteredData.find(d => d[demographicField] === 'All');
  let otherData = filteredData.filter(d => d[demographicField] !== 'All');

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
    <div style={{ 
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
            {columnHeaders.map((header, idx) => (
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
              {metricFields.map((field, fieldIdx) => {
                const value = row[field];
                const additionalInfo = getAdditionalInfo(row, field);
                
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
          Note. (NH) indicates 'Non-Hispanic'. View methodology.
        </p>
        <p style={{ margin: '5px 0' }}>
          Sources: CDC NCHHSTP AtlasPlus (data from {timeFilter}).
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