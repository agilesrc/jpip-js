/**
 * Copyright 2001-2012 AgileSrc LLC
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * This file is a part of the jpip-js project, which is licensed under Version 3 of the GNU General
 * Public License, a copy of which can be found in LICENSE.txt at the root of the project directory,
 * or at http://www.gnu.org/licenses/gpl.txt.
 */
(function ($) {
  $.fn.jpipViewer = function(image, options) {
    return this.each(function() {
      new JPIPViewer(this, $.extend({}, options, {image: image}))
    });
  }

  function JPIPViewer(element, options) {
    options = $.extend({
      element: element || $('#jpipViewer'),
      server: 'http://localhost:8080/adore-djatoka/resolver',
      scale: null,
      initialZoom: 1,
      showNavButtons: true,
      maxWidth: 0,
      maxHeight: 0,
      minX: 0,
      minY: 0,
      width: 0,
      height: 0,
      maxZoom: this.initialZoom,
      topLeftX: 0,
      topLeftY: 0,
      numLevels: 0,
      level: 0,
      regionWidth: 0,
      regionHeight: 0,
      regionX: 0,
      regionY: 0,
      xFit: 0,
      yFit: 0,
      viewportPosition: [0,0],
      svcValFmt: 'info:ofi/fmt:kev:mtx:jpeg2000',
      svcId: 'info:lanl-repo/svc/getRegion'
    }, options);

    var imageView;

    var url = options.server + '?url_ver=Z39.88-2004&rft_id=' + options.image + '&svc_id=info:lanl-repo/svc/getMetadata';
    $.getJSON(url, setup);

    function setup(data) {
      var divWidth = $(options.element).width();
      var divHeight = $(options.element).height();

      options.maxWidth = Math.round(parseInt(data.width));
      options.maxHeight = Math.round(parseInt(data.height));
      options.numLevels = parseInt(data.levels);
      options.level = options.numLevels;

      calculateMins(divWidth, divHeight);
      createNavigationWindow();

      var target = document.createElement("div");
      target.id = 'target';

      options.element.appendChild(target);

      $('#target').dblclick(function() {
        zoom();
      })

      options.regionWidth = divWidth;
      options.regionHeight = divHeight;

      recenter();

      $(window).resize(function() {
        window.location = window.location;
      });

      if(options.scale) {
        var scale = document.createElement("div");
        scale.id = 'scale';
        options.source.appendChild(scale);
      }

      for(var i = 0; i < options.initialZoom; i++) {
        zoomIn();
      }

      zoomOut();
      getImage();
      positionViewport();
    }

    /*
     * Calculate the minimum image sizes based on the div size
     */
    function calculateMins(divWidth, divHeight) {
      var x = options.maxWidth;
      var y = options.maxHeight;
      var thumbnailSize = 100;

      if (divWidth > divHeight) {
        if (x > 2*y) {
          thumbnailSize = divWidth / 2;
        }
        else {
          thumbnailSize = divWidth / 4;
        }
      }
      else {
        thumbnailSize = divWidth / 4;
      }

      var level = options.level;
      while (x > thumbnailSize) {
        x = x / 2;
        y = y / 2;
        if ( --level == 1) {
          break;
        }
      }

      options.minX = Math.round(x);
      options.minY = Math.round(y);

      x = options.maxWidth;
      y = options.maxHeight;
      while (x > divWidth && y > divHeight) {
        x = x / 2;
        y = y / 2;
        options.level--;
      }
      options.width = Math.round(x);
      options.height = Math.round(y);
      options.level--;

    }

    /*
     * This will create the necessary components for the navigation div
     */
    function createNavigationWindow() {
      // Set up the container for our navigation window
      var container = $('<div class="jpipContainer">');
      container.css({width: options.minX, height: 20});

      // Set up the main navigation div
      var navDiv = $('<div class="jpipNavigation">');
      navDiv.css({width: options.minX, height: options.minY});
      container.append(navDiv);

      // Get our thumbnail image
      var image = $('<img class="jpipViewer-navigationImage">')
      image.attr('src', options.server + '?url_ver=Z39.88-2004&rft_id=' + encode(options.image)
        + '&svc_id=' + options.svcId + '&svc_val_fmt=' + options.svcValFmt
        + '&svc.format=image/jpeg&svc.scale=' + options.minX + ',' + options.minY);

      navDiv.append(image);

      // Div so we can see where we are when we are zoomed in
      var viewport = $('<div class="jpipViewer-viewport" />');
      viewport.css({width: Math.floor(options.minX / 2), height: Math.floor(options.minY / 2)});

      navDiv.append(viewport);

      // Set up the UI for navigation
      var navigationUI = $('<div class="jpipViewer-navUI" />');

      var upButton      = $('<a class="jpipViewer-button jpipViewer-up">'),
          downButton    = $('<a class="jpipViewer-button jpipViewer-down">'),
          leftButton    = $('<a class="jpipViewer-button jpipViewer-left">'),
          rightButton   = $('<a class="jpipViewer-button jpipViewer-right">'),
          zoomInButton  = $('<a class="jpipViewer-button jpipViewer-zoomIn">'),
          zoomOutButton = $('<a class="jpipViewer-button jpipViewer-zoomOut">'),
          resetButton   = $('<a class="jpipViewer-button jpipViewer-reset">');

      var directionControls = $('<div class="jpipViewer-directionControls" />')
      directionControls.append(upButton, downButton, leftButton, rightButton);

      var zoomControls = $('<div class="jpipViewer-zoomControls"/>')
      zoomControls.append(zoomInButton, zoomOutButton);

      navigationUI.append(directionControls, zoomControls, resetButton);
      navDiv.append(navigationUI);

      $(options.element).append(container);

      // Attach event handlers to make the UI functional
      upButton.on('click', up);
      downButton.on('click', down);
      leftButton.on('click', left);
      rightButton.on('click', right);
      zoomInButton.on('click', zoomIn);
      zoomOutButton.on('click', zoomOut);
      resetButton.on('click', reset);

      $('.jpipViewer-viewport').draggable({
        containment: $("#navigationImage"),
        start: function() {
          var offset = $('.jpipViewer-viewport').offset();
          options.viewportPosition = [offset.left, offset.top];
        },
        stop: function(event, ui) {
          scrollNavigation(ui);
        }
      });
    }

    function getImage() {

      var src = options.server + '?url_ver=Z39.88-2004&rft_id=' + encode(options.image) + '&svc_id='
                + options.svcId + '&svc_val_fmt=' + options.svcValFmt
                + '&svc.format=image/png&svc.level=' + options.level + '&svc.rotate=0&svc.region='
                + Math.round(options.viewportPosition[0] * 16) + ','
                + Math.round(options.viewportPosition[1] * 16) + ',' + options.height + ','
                + options.width;

      imageView = imageView || $('<img class="jpipViewer-imageView">');
      imageView.attr('src', src);

      $(options.element).append(imageView);
    }

    function zoom(e) {
      var event = new Event(e);

      if (event.wheel) {
        if (event.wheel > 0) {
          zoomIn();
        }
        else if (event.wheel < 0) {
          zoomOut();
        }
      }
      else if (event.shift) {
        zoomOut();
      }
      else {
        zoomIn();
      }
    }

    function zoomIn() {
      if ((options.width <= (options.maxWidth / 2)) && (options.height <= (options.maxHeight / 2))) {
        options.level++;
        options.width = options.maxWidth;
        options.height = options.maxHeight;

        for (var i = options.level; i < options.numLevels; i++) {
          options.width = Math.floor(options.width / 2);
          options.height = Math.floor(options.height / 2);
        }

        if (options.xFit == 1) {
          options.regionX = options.width / 2 - (options.regionWidth / 2);
        }
        else if (options.width > options.regionWidth) {
          options.regionX = options.regionX * 2 + options.regionWidth / 2;
        }

        if (options.regionX > options.regionWidth) {
          options.regionX = options.width - options.regionWidth;
        }

        if (options.regionX < 0) {
          options.regionX = 0;
        }

        if (options.yFit == 1) {
          options.regionY = options.height / 2 - (options.regionHeight / 2);
        }
        else if (options.height > options.regionHeight) {
          options.regionY = options.regionY * 2 + options.regionHeight / 2;
        }

        if (options.regionY > options.regionHeight) {
          options.regionY = options.height - options.regionHeight;
        }

        if (options.regionY < 0) {
          options.regionY = 0;
        }

        positionViewport();
        getImage();

      }
    }

    function zoomOut() {
      if ((options.width > options.regionWidth) || (options.height > options.regionHeight)) {
        options.level--;
        options.width = options.maxWidth;
        options.height = options.maxHeight;

        for (var i = options.level; i < options.numLevels; i++) {
          options.width = Math.floor(options.width / 2);
          options.height = Math.floor(options.height / 2);
        }

        options.regionX = options.regionX / 2 - (options.regionWidth / 4);

        if (options.regionX + options.regionWidth > options.width) {
          options.regionX = options.width - options.regionWidth;
        }

        if (options.regionX < 0) {
          options.xFit = 1;
          options.regionX = 0;
        }
        else {
          options.xFit = 0;
        }

        options.regionY = options.regionY / 2 - (options.regionHeight / 4);

        if (options.regionY + options.regionHeight > options.height) {
          options.regionY = options.height - options.regionHeight;
        }

        if (options.regionY < 0) {
          options.yFit = 1;
          options.regionY = 0;
        }
        else {
          options.yFit = 0;
        }

        positionViewport();
        getImage();

      }
    }

    function checkBounds(x, y) {

      var localX = options.regionX + x;
      var localY = options.regionY + y;

      if (localX > options.width - options.regionWidth) {
        localX = options.width - options.regionWidth;
      }
      if (localY > options.height - options.regionHeight) {
        localY = options.height - options.regionHeight;
      }

      if (localX < 0) {
        localX = 0;
      }

      if (localY < 0) {
        localY = 0;
      }

      options.regionX = localX;
      options.regionY = localY;
    }

    function scrollTo(x, y) {
      if (x || y) {
        checkBounds(x, y);
        positionViewport();
        getImage();
      }
    }

    function left() {
      scrollTo(-options.regionWidth/3, 0);
    }

    function up() {
      scrollTo(0, -options.regionHeight/3);
    }

    function right() {
      scrollTo(options.regionWidth/3, 0);
    }

    function down() {
      scrollTo(0, options.regionHeight/3);
    }

    function reset() {
      window.location = window.location;
    }

    function scrollNavigation(e) {
      var moveX = 0;
      var moveY = 0;

      var viewportWidth = $('#viewport').width();
      var viewportHeight = $('#viewport').height();

      if (e.event) {
        var position = $('#jpipNavigation').position();
        moveX = e.event.clientX - position.left - viewportWidth / 2;
        moveY = e.event.clientY - position.top - viewportHeight / 2;
      }
      else {
        moveX = e.position.left;
        moveY = e.position.top;
        if((Math.abs(moveX - options.viewportPosition[0]) < 3) && (Math.abs(moveY - options.viewportPosition[1]) < 3)) {
          return;
        }
      }

      if (moveX > (options.minX - viewportWidth)) {
        moveX = options.minX - viewportWidth;
      }
      if (moveY > (options.minY - viewportHeight)) {
        moveY = options.minY - viewportHeight;
      }

      if (moveX < 0) {
        moveX = 0;
      }
      if (moveY < 0) {
        moveY = 0;
      }

      options.regionX = Math.round(moveX * options.width / options.minX);
      options.regionY = Math.round(moveY * options.height / options.minY);

      options.viewportPosition[0] = moveY;
      options.viewportPosition[1] = moveX;

      if (e.event) {
        positionViewport();
      }
      getImage();

    }

    function recenter() {
      options.regionX = (options.width - options.regionWidth) / 2;
      options.regionY = (options.height - options.regionHeight) / 2;
    }

    function positionViewport() {
      var left = (options.regionX / options.width) * (options.minX);
      if (left > options.minX) {
        left = options.minX;
      }
      if (left < 0) {
        left = 0;
      }

      var top = (options.regionY / options.height) * (options.minY);
      if (top > options.minY) {
        top = options.minY;
      }
      if(top < 0) {
        top = 0;
      }

      var width = (options.regionWidth / options.width) * (options.minX);
      if (left + width > options.minX) {
        width = options.minX - left;
      }

      var height = (options.regionHeight / options.height) * (options.minY) ;
      if (top + height > options.minY) {
        height = options.minY - top;
      }

      if (width < options.minX) {
        options.xFit = 0;
      }
      else {
        options.xFit = 1;
      }

      if (height < options.minY) {
        options.yFit = 0;
      }
      else {
        options.yFit = 1;
      }

      top = Math.floor(top);
      left = Math.floor(left);
      width = Math.floor(width);
      height = Math.floor(height);

      options.viewportPosition[0] = top;
      options.viewportPosition[1] = left;

      var viewport = $('.jpipViewer-viewport')[0];

      var border = viewport.offsetHeight - viewport.clientHeight;

      $('.jpipViewer-viewport').animate({
        left: left,
        top: top,
        width: width - border / 2,
        height: height - border / 2
      });
    }

    function encode(uri) {
      if (encodeURIComponent) {
        return encodeURIComponent(uri);
      }

      if (escape) {
        return escape(uri);
      }
    }
  }
})(jQuery);
