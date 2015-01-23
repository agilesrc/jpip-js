# jpip.js

A lightweight jQuery plugin for viewing JPIP images.

## Introduction
The goal when designing jpip.js was to have a lightweight yet user-friendly user interface for viewing JPIP images on a variety of devices.

### Note
This plugin requires an [adore-djatoka JPIP server](http://sourceforge.net/apps/mediawiki/djatoka/index.php?title=Main_Page) to be available for use, and assumes that you have a basic understanding of the JPEG2000 streaming protocol (JPIP).

If you have any questions, please feel free to contact us at [support@agilesrc.com](mailto:support@agilesrc.com). Thanks!

## Installation
```
bower install jpip-js --save
```

If you're using a dependency injection tool like [wiredep](https://github.com/taptapship/wiredep.git), that's all you'll need to do. However, if you're manually including assets in your HTML, you'll need these files:

```html
<!-- External -->
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/jquery-ui/jquery-ui.min.js"></script>
<script src="bower_components/Jcrop/js/jquery.Jcrop.min.js"></script>

<!-- JPIP -->
<script src="bower_components/jpip/dist/jquery.jpip.js"></script>
<link rel="stylesheet" href="bower_components/jpip/dist/jquery.jpip.css" />
```

## Usage
It's easy! Just call `$(element).jpipViewer(imageUrl, options)`.

```js
// Call once DOM is loaded
$('#jpipViewer').jpipViewer('some_image.jp2', { /* options */ });
```

### Options
| Option           | Type    | Default                                          | Description
| ------           | ------- | -------                                          | -----------
| `server`         | String  | `"http://localhost:8080/adore-djatoka/resolver"` | The path to where your copy of the Djatoka server is running.
| `initialZoom`    | Number  | `1`                                              | An integer greater than or equal to 1 stating how much the view should initially be zoomed in
| `showNavButtons` | Boolean | `true`                                           | Whether or not the navigation portion of the UI should be visible

## License

*Copyright © 2001-2015 AgileSrc LLC.*

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
