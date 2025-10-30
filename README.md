# HET Webflow Components
# het-webflow-components

## Adding the HET repo as a submodule:
```
git submodule add https://github.com/SatcherInstitute/health-equity-tracker.git het-source
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled d3 react-router react-router-dom react-share jotai jotai-location react-router-hash-link topojson-client data-forge dom-to-image-more just-debounce-it react-animate-height
```


## Install Webflow dependencies:
```
npm install --save-dev @webflow/webflow-cli @webflow/data-types @webflow/react
```

## Create a `webflow.json` config file
```{
    "library": {
        "name": "HET Components",
        "components": ["./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)"]
    }
}
```
Check that your remote is set up correctly
```
git remote -v
```

Should show something like:
```
# origin  https://github.com/YOUR-USERNAME/het-webflow-components.git (fetch)
# origin  https://github.com/YOUR-USERNAME/het-webflow-components.git (push)
```

Check submodule status
```
git submodule status
```
Should show the HET submodule with a commit hash


## Create Webflow components
### Two-file pattern:
#### `Component.tsx` = The actual React component
- Contains the logic and UI
- Can be used anywhere in React apps
- Doesn't know anything about Webflow

#### `Component.webflow.tsx` = The Webflow wrapper/definition
- Tells Webflow how to display the component in the Designer
- Defines which props are configurable in Webflow
- Maps your React component to Webflow's system

## Upload library to Webflow
```
npx webflow library share
```

✔ All webflow packages are updated. To disable update checks, use WEBFLOW_SKIP_UPDATE_CHECKS=true
✔ Initializing
✔ Looking for webflow.json manifest
✔ Collecting metadata
? Code components:
  - HET Data Table (Changed)
  - HET Rate Bar Chart (Changed)

Ready to update HET Components? (Y/n)

✔ Creating code library
✔ Compiling code components
✔ Uploading files
✔ Sharing library
Code library shared successfully: https://webflow.com/dashboard/workspace/shli-workspace/shared-libraries-and-templates