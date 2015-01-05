/*
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
  var jpip;

  $.fn.jpipViewer = function(image, options) {
    return this.each(function() {
      new jpipViewer(this, $.extend(options, {image: image}))
    });
  }

  var jpipViewer = function(element, options) {
    /*
     * Initialize the member variables
     */
    this.element = element || $('#jpipViewer');
    this.server = options['server'] || 'http://localhost:8080/adore-djatoka/resolver';
    this.image = options['image'] || alert('Image location must be set!');
    this.scale = options['scale'] || null;
    this.initialZoom = options['zoom'] || 1;
    this.showNavButtons = options['showNavButtons'] || true;
    this.maxWidth = 0;
    this.maxHeight = 0;
    this.minX = 0;
    this.minY = 0;
    this.width = 0;
    this.height = 0;
    this.maxZoom = this.initialZoom;
    this.topLeftX = 0;
    this.topLeftY = 0;
    this.numLevels = 0;
    this.level = 0;
    this.regionWidth = 0;
    this.regionHeight = 0;
    this.regionX = 0;
    this.regionY = 0;
    this.xFit = 0;
    this.yFit = 0;
    this.viewportPosition = [0,0];
    this.svcValFmt = 'info:ofi/fmt:kev:mtx:jpeg2000';
    this.svcId = 'info:lanl-repo/svc/getRegion';

  	jpip = this;

    var url = this.server + '?url_ver=Z39.88-2004&rft_id=' + this.image + '&svc_id=info:lanl-repo/svc/getMetadata';
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = setup;
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);

    function setup() {
      // Only process once we're ready
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        var jsonData = $.parseJSON(xmlHttp.response);

        var divWidth = $(jpip.element).width();
        var divHeight = $(jpip.element).height();

        jpip.maxWidth = Math.round(parseInt(jsonData.width));
        jpip.maxHeight = Math.round(parseInt(jsonData.height));
        jpip.numLevels = parseInt(jsonData.levels);
        jpip.level = jpip.numLevels;

        calculateMins(divWidth, divHeight);
        createNavigationWindow();

        var target = document.createElement("div");
        target.id = 'target';

        jpip.element.appendChild(target);

        $('#target').dblclick(function() {
          zoom();
        })

        jpip.regionWidth = divWidth;
        jpip.regionHeight = divHeight;

        recenter();

        $(window).resize(function() {
          window.location = window.location;
        });

        if(jpip.scale) {
          var scale = document.createElement("div");
          scale.id = 'scale';
          jpip.source.appendChild(scale);
        }

        for(var i = 0; i < jpip.initialZoom; i++) {
          zoomIn();
        }

        zoomOut();
        getImage();
        positionViewport();

      }
    }

    /*
     * Calculate the minimum image sizes based on the div size
     */
    function calculateMins(divWidth, divHeight) {
      var x = jpip.maxWidth;
      var y = jpip.maxHeight;
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

      var level = jpip.level;
      while (x > thumbnailSize) {
        x = x / 2;
        y = y / 2;
        if ( --level == 1) {
          break;
        }
      }

      jpip.minX = Math.round(x);
      jpip.minY = Math.round(y);

      x = jpip.maxWidth;
      y = jpip.maxHeight;
      while (x > divWidth && y > divHeight) {
        x = x / 2;
        y = y / 2;
        jpip.level--;
      }
      jpip.width = Math.round(x);
      jpip.height = Math.round(y);
      jpip.level--;

    }

    /*
     * This will create the necessary components for the navigation div
     */
    function createNavigationWindow() {

      // Set up the container for our navigation window
      var container = document.createElement("div");
      container.id = 'jpipContainer';
      container.style.width = jpip.minX;
      container.style.height = 20;


      // Set up a div to slide toggle the UI
      var toolbar = document.createElement("div");
      toolbar.id = 'toolbar';
      toolbar.style.width = jpip.minX;
      toolbar.addEventListener('ondblclick', $('navUI').slideToggle());

      container.appendChild(toolbar);

      // Set up the main navigation div
      var div = document.createElement("div");
      div.id = 'jpipNavigation';
      div.style.width = jpip.minX;
      div.style.height = jpip.minY;

      container.appendChild(div);

      // Get our thumbnail image
      var image = document.createElement("img");
      image.id = 'navigationImage';
      image.src = jpip.server + '?url_ver=Z39.88-2004&rft_id=' + encode(jpip.image) + '&svc_id=' + jpip.svcId
             + '&svc_val_fmt=' + jpip.svcValFmt + '&svc.format=image/jpeg&svc.scale=' + jpip.minX + ',' + jpip.minY;

      div.appendChild(image);

      // Div so we can see where we are when we are zoomed in
      var viewport = document.createElement("div");
      viewport.id = 'viewport';
      viewport.style.width = Math.floor(jpip.minX / 2);
      viewport.style.height = Math.floor(jpip.minY / 2);

      div.appendChild(viewport);

      // Set up the UI for navigation
      var navigationUI = document.createElement("div");
      navigationUI.id = 'navUI';
      navigationUI.innerHTML = '<a id="left" /><a id="up" /><a id="right" /><br/><a id="down" /><br/><a id="zoomIn" /><a id="zoomOut" /><a id="reset" />';

      div.appendChild(navigationUI);

      var t = jpip.element;

      t.appendChild(container);

      // Attach event handlers to make the UI functional
      $('#zoomIn').click(function() {
        zoomIn()
      });
      $('#zoomOut').click(function() {
        zoomOut()
      });
      $('#left').click(function() {
        left()
      });
      $('#up').click(function() {
        up()
      });
      $('#right').click(function() {
        right()
      });
      $('#down').click(function() {
        down()
      });
      $('#reset').click(function() {
        reset()
      });

      //Set up our draggable viewport **NOTE: Requires jQuery UI
      $('#viewport').draggable({
        containment: $("#navigationImage"),
        start: function() {
          var offset = $('#viewport').offset();
          jpip.viewportPosition = [offset.left, offset.top];
        },
        stop: function(event, ui) {
          scrollNavigation(ui);
        }
      });
    }

    function getImage() {
      var src = jpip.server + '?url_ver=Z39.88-2004&rft_id=' + encode(jpip.image) + '&svc_id=' + jpip.svcId
                + '&svc_val_fmt=' + jpip.svcValFmt + '&svc.format=image/png&svc.level=' + jpip.level
                + '&svc.rotate=0&svc.region=' + Math.round(jpip.viewportPosition[0] * 16) + ',' + Math.round(jpip.viewportPosition[1] * 16) + ',' + jpip.height + ',' + jpip.width;

      var mainImage = document.getElementById('mainImage');
      if (mainImage == null) {
        mainImage = document.createElement("img");
        mainImage.id = 'mainImage';
      }

      mainImage.src = src;

      var div = jpip.element;
      div.appendChild(mainImage);
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
      if ((jpip.width <= (jpip.maxWidth / 2)) && (jpip.height <= (jpip.maxHeight / 2))) {
        jpip.level++;
        jpip.width = jpip.maxWidth;
        jpip.height = jpip.maxHeight;

        for (var i = jpip.level; i < jpip.numLevels; i++) {
          jpip.width = Math.floor(jpip.width / 2);
          jpip.height = Math.floor(jpip.height / 2);
        }

        if (jpip.xFit == 1) {
          jpip.regionX = jpip.width / 2 - (jpip.regionWidth / 2);
        }
        else if (jpip.width > jpip.regionWidth) {
          jpip.regionX = jpip.regionX * 2 + jpip.regionWidth / 2;
        }

        if (jpip.regionX > jpip.regionWidth) {
          jpip.regionX = jpip.width - jpip.regionWidth;
        }

        if (jpip.regionX < 0) {
          jpip.regionX = 0;
        }

        if (jpip.yFit == 1) {
          jpip.regionY = jpip.height / 2 - (jpip.regionHeight / 2);
        }
        else if (jpip.height > jpip.regionHeight) {
          jpip.regionY = jpip.regionY * 2 + jpip.regionHeight / 2;
        }

        if (jpip.regionY > jpip.regionHeight) {
          jpip.regionY = jpip.height - jpip.regionHeight;
        }

        if (jpip.regionY < 0) {
          jpip.regionY = 0;
        }

        positionViewport();
        getImage();

      }
    }

    function zoomOut() {
      if ((jpip.width > jpip.regionWidth) || (jpip.height > jpip.regionHeight)) {
        jpip.level--;
        jpip.width = jpip.maxWidth;
        jpip.height = jpip.maxHeight;

        for (var i = jpip.level; i < jpip.numLevels; i++) {
          jpip.width = Math.floor(jpip.width / 2);
          jpip.height = Math.floor(jpip.height / 2);
        }

        jpip.regionX = jpip.regionX / 2 - (jpip.regionWidth / 4);

        if (jpip.regionX + jpip.regionWidth > jpip.width) {
          jpip.regionX = jpip.width - jpip.regionWidth;
        }

        if (jpip.regionX < 0) {
          jpip.xFit = 1;
          jpip.regionX = 0;
        }
        else {
          jpip.xFit = 0;
        }

        jpip.regionY = jpip.regionY / 2 - (jpip.regionHeight / 4);

        if (jpip.regionY + jpip.regionHeight > jpip.height) {
          jpip.regionY = jpip.height - jpip.regionHeight;
        }

        if (jpip.regionY < 0) {
          jpip.yFit = 1;
          jpip.regionY = 0;
        }
        else {
          jpip.yFit = 0;
        }

        positionViewport();
        getImage();

      }
    }

    function checkBounds(x, y) {

      var localX = jpip.regionX + x;
      var localY = jpip.regionY + y;

      if (localX > jpip.width - jpip.regionWidth) {
        localX = jpip.width - jpip.regionWidth;
      }
      if (localY > jpip.height - jpip.regionHeight) {
        localY = jpip.height - jpip.regionHeight;
      }

      if (localX < 0) {
        localX = 0;
      }

      if (localY < 0) {
        localY = 0;
      }

      jpip.regionX = localX;
      jpip.regionY = localY;
    }

    function scrollTo(x, y) {
      if (x || y) {
        checkBounds(x, y);
        positionViewport();
        getImage();
      }
    }

    function left() {
      scrollTo(-jpip.regionWidth/3, 0);
    }

    function up() {
      scrollTo(0, -jpip.regionHeight/3);
    }

    function right() {
      scrollTo(jpip.regionWidth/3, 0);
    }

    function down() {
      scrollTo(0, jpip.regionHeight/3);
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
        if((Math.abs(moveX - jpip.viewportPosition[0]) < 3) && (Math.abs(moveY - jpip.viewportPosition[1]) < 3)) {
          return;
        }
      }

      if (moveX > (jpip.minX - viewportWidth)) {
        moveX = jpip.minX - viewportWidth;
      }
      if (moveY > (jpip.minY - viewportHeight)) {
        moveY = jpip.minY - viewportHeight;
      }

      if (moveX < 0) {
        moveX = 0;
      }
      if (moveY < 0) {
        moveY = 0;
      }

      jpip.regionX = Math.round(moveX * jpip.width / jpip.minX);
      jpip.regionY = Math.round(moveY * jpip.height / jpip.minY);

      jpip.viewportPosition[0] = moveY;
      jpip.viewportPosition[1] = moveX;

      if (e.event) {
        positionViewport();
      }
      getImage();

    }

    function recenter() {
      jpip.regionX = (jpip.width - jpip.regionWidth) / 2;
      jpip.regionY = (jpip.height - jpip.regionHeight) / 2;
    }

    function positionViewport() {
      var left = (jpip.regionX / jpip.width) * (jpip.minX);
      if (left > jpip.minX) {
        left = jpip.minX;
      }
      if (left < 0) {
        left = 0;
      }

      var top = (jpip.regionY / jpip.height) * (jpip.minY);
      if (top > jpip.minY) {
        top = jpip.minY;
      }
      if(top < 0) {
        top = 0;
      }

      var width = (jpip.regionWidth / jpip.width) * (jpip.minX);
      if (left + width > jpip.minX) {
        width = jpip.minX - left;
      }

      var height = (jpip.regionHeight / jpip.height) * (jpip.minY) ;
      if (top + height > jpip.minY) {
        height = jpip.minY - top;
      }

      if (width < jpip.minX) {
        jpip.xFit = 0;
      }
      else {
        jpip.xFit = 1;
      }

      if (height < jpip.minY) {
        jpip.yFit = 0;
      }
      else {
        jpip.yFit = 1;
      }

      top = Math.floor(top);
      left = Math.floor(left);
      width = Math.floor(width);
      height = Math.floor(height);

      jpip.viewportPosition[0] = top;
      jpip.viewportPosition[1] = left;

      var viewport = document.getElementById('viewport');

      var border = viewport.offsetHeight - viewport.clientHeight;

      $('#viewport').animate({
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
