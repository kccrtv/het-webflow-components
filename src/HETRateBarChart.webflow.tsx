import HETRateBarChart from './HETRateBarChart';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

export default declareComponent(HETRateBarChart, {
  name: 'HET Rate Bar Chart',
  description: 'Health Equity Tracker style rate bar chart with demographic breakdowns',
  group: 'Health Equity Tracker',
  props: {
    datasetUrl: props.Text({
      name: "Dataset URL",
      defaultValue: "https://healthequitytracker.org/api/dataset?name=cdc_hiv_data-race_and_ethnicity_national_historical.json",
    }),
    title: props.Text({
      name: "Chart Title",
      defaultValue: "HIV prevalence in the United States",
    }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue: "Ages 13+",
    }),
    metricField: props.Text({
      name: "Metric Field Name",
      defaultValue: "hiv_prevalence_per_100k",
    }),
    demographicField: props.Text({
      name: "Demographic Field Name",
      defaultValue: "race_and_ethnicity",
    }),
    timeFilter: props.Text({
      name: "Time Period",
      defaultValue: "2021",
    }),
    width: props.Number({
      name: "Max Width",
      defaultValue: 900,
    }),
    height: props.Number({
      name: "Height",
      defaultValue: 600,
    }),
    showAllBar: props.Boolean({
      name: "Show 'All' Category",
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