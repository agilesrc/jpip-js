jpip.js
	A lightweight JPIP image viewer utilizing the jQuery library
	
	Copyright 2001-2012, AgileSrc LLC
	
	***********************************************************************
	*                                                                     *
	*                           readme.txt                                *
	*                                                                     *
	***********************************************************************
	
	Table of Contents
	
	1. Introduction
	2. Basic usage
	3. Options
	
	1. Introduction
		Welcome to AgileSrc's lightweight JPIP viewer. We assume that you have
		a basic understanding of the JPEG2000 streaming protocol (JPIP.) The 
		goal when designing this script was to have a lightweight, yet user-
		friendly, user interface for viewing JPIP images on a variety of devices.
		To ensure this goal was met, we have utilized both the core jQuery library
		as well as the jQuery UI library.
		
		This script was built using the adore-djatoka server as the backend.
		Djatoka is a very nice, open source server, and more information can be
		found about it at
		http://sourceforge.net/apps/mediawiki/djatoka/index.php?title=Main_Page
		
		We hope you find this script easy to use. If you have any questions,
		please feel free to contact us at support@agilesrc.com. Thanks and enjoy
		using jpip.js!
		
		
	2. Basic usage
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
			
		You must include both jQuery and jQuery UI on you page before you
		call the script, otherwise none of the functionality will be there.
		This script was tested using the latest versions of both at the time of
		this document, 1.8.1 for jQuery and 1.8.23 for jQuery UI.
		
		Additionally, the Jcrop plugin for jQuery is required. This allows for the drag
		and drop functionality.
		
		The script is easily instantiated within your page, as there is only
		one basic option you need to set, the 'image' option.
		
		Example:
		 <script>
        	var jpip = new jpipViewer({
        		divId: 'large_img',
        		image: "http://memory.loc.gov/gmd/gmd433/g4330/g4330/np000066.jp2"
        	});
        </script>
        
        NOTE: the name of the variable MUST BE jpip for the script to work.
        
        As you can see, there is very little effort involved in calling into the
        class itself.
        
    3. Options
    
    	divId (String): informs the script what div to set up the viewer into
    		default: 'jpipViewer'
    	
    	server (String): allows you to specify the path to where your copy of the
    	Djatoka server is running. The default option is set up to allow
    	for easy testing on a local machine
    		default: 'http://localhost:8080/adore-djatoka/resolver'
		
		image (String): The path to the J2 image you want to be displayed. THIS MUST BE
		SET. ex. http://memory.loc.gov/gmd/gmd433/g4330/g4330/np000066.jp2
			
		zoom (Integer): Allows you to set an initial zoom value different from the default
			default: 1
			
		showNavButtons (Boolean): Specify whether you want the button portion of the
		navigation to show up.
			default: true
			
	