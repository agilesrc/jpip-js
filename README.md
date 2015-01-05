# jpip.js

A lightweight jQuery plugin for viewing JPIP images.

*© 2001-2014 AgileSrc LLC.*

## Introduction
Welcome to AgileSrc's lightweight JPIP viewer. We assume that you have a basic understanding of the JPEG2000 streaming protocol (JPIP). The goal when designing this script was to have a lightweight yet user-friendly user interface for viewing JPIP images on a variety of devices. To ensure this goal was met, we have utilized both the core jQuery library as well as the jQuery UI library.

This script was built using the [adore-djatoka server](http://sourceforge.net/apps/mediawiki/djatoka/index.php?title=Main_Page) as the backend.

If you have any questions, please feel free to contact us at [support@agilesrc.com](mailto:support@agilesrc.com). Thanks!

## Installation
```
bower install jpip --save
```

If you're using a tool like [wiredep](https://github.com/taptapship/wiredep.git), that's all you'll need to do. However, if you're manually including assets in your HTML, you'll need these two files:

```html
<script src="bower_components/jpip/dist/jquery.jpip.js"></script>
<link rel="stylesheet" href="bower_components/jpip/dist/jquery.jpip.css" />
```

## Usage

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
