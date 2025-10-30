import HETDataTable from './HETDataTable';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

export default declareComponent(HETDataTable, {
  name: 'HET Data Table',
  description: 'Health Equity Tracker style data table with demographic breakdowns',
  group: 'Health Equity Tracker',
  props: {
    datasetUrl: props.Text({
      name: "Dataset URL",
      defaultValue: "https://healthequitytracker.org/api/dataset?name=cdc_hiv_data-race_and_ethnicity_national_historical.json",
    }),
    title: props.Text({
      name: "Table Title",
      defaultValue: "Summary for HIV prevalence in the United States by race/ethnicity",
    }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue: "Ages 13+",
    }),
    demographicField: props.Text({
      name: "Demographic Field Name",
      defaultValue: "race_and_ethnicity",
    }),
    metricFields: props.Text({
      name: "Metric Fields (comma-separated)",
      defaultValue: "hiv_prevalence_per_100k,hiv_diagnoses_per_100k,hiv_deaths_per_100k",
    }),
    columnHeaders: props.Text({
      name: "Column Headers (comma-separated)",
      defaultValue: "HIV prevalence per 100k people,HIV diagnoses per 100k people,HIV deaths per 100k people",
    }),
    timeFilter: props.Text({
      name: "Time Period",
      defaultValue: "2021",
    }),
    showAllRow: props.Boolean({
      name: "Show 'All' Row",
      defaultValue: true,
    }),
    methodologyUrl: props.Text({
      name: "Methodology Link",
      defaultValue: "https://healthequitytracker.org/exploredata?mls=1.hiv-3.00&group1=All",
    }),
    sourceUrl: props.Text({
      name: "Data Source Link",
      defaultValue: "https://www.cdc.gov/nchhstp/atlas/index.htm",
    }),
    sourceText: props.Text({
      name: "Source Name",
      defaultValue: "CDC NCHHSTP AtlasPlus",
    }),
    dataYear: props.Text({
      name: "Data Year",
      defaultValue: "2021",
    }),
  },
});