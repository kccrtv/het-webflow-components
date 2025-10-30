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
    timeFilter: props.Text({
      name: "Time Period",
      defaultValue: "2021",
    }),
    showAllRow: props.Boolean({
      name: "Show 'All' Row",
      defaultValue: true,
    }),
  },
});