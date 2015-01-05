# jpip.js

A lightweight JPIP image viewer jQuery plugin

*Copyright 2001-2014 AgileSrc LLC*

## Introduction
Welcome to AgileSrc's lightweight JPIP viewer. We assume that you have a basic understanding of the JPEG2000 streaming protocol (JPIP). The goal when designing this script was to have a lightweight yet user-friendly user interface for viewing JPIP images on a variety of devices. To ensure this goal was met, we have utilized both the core jQuery library as well as the jQuery UI library.

This script was built using the [adore-djatoka server](http://sourceforge.net/apps/mediawiki/djatoka/index.php?title=Main_Page) as the backend.

If you have any questions, please feel free to contact us at [support@agilesrc.com](mailto:support@agilesrc.com). Thanks!

## Installation
```
bower install jpip --save
```

## Usage
```
Requirements:
  |
  - css
  | |
  | - agile.css - the CSS for the jpipViewer class
  |
  - img
  | |
  | - down.png    - the PNG for the down icon
  | - left.png    - the PNG for the left icon
  | - reset.png   - the PNG to reset the view
  | - right.png   - the PNG for the right icon
  | - up.png      - the PNG for the up icon
  | - zoomIn.png  - the PNG to zoom in
  | - zoomOut.png - the PNG to zoom out
  |
  - js
  | |
  | jpip.js - the reason you're reading this
```

Example:

```html
<script>
  // Call once DOM is loaded
  $('#jpipViewer').jpipViewer('http://memory.loc.gov/gmd/gmd433/g4330/g4330/np000066.jp2');
</script>
```

### Additional options

| Option           | Description
| ------           | -----------
| `server`         | allows you to specify the path to where your copy of the Djatoka server is running. The default option is set up to allow for easy testing on a local machine at `http://localhost:8080/adore-djatoka/resolver`
| `zoom`           | Allows you to set an initial zoom value different from the default (which is 1)
| `showNavButtons` | Specify whether you want the button portion of the navigation to show up (default: true)
