var MyControl = L.Control.extend({
    options: {
        position: 'topright',
        colors: [
	        {r:0, g:0, b:0},
	        {r:255,g:255,b:255},
	        // {r:255, g:0, b:0},
	        // {r:0, g:255, b:0},
	        // {r:0, g:0, b:255}
	        {r:229, g:28, b:35},
	        {r:156, g:39, b:176},
	        {r:63, g:81, b:181},
	        {r:3, g:169, b:244},
	        {r:0, g:150, b:136},
	        {r:10, g:126, b:7},
	        {r:205, g:220, b:57},
	        {r:255, g:193, b:7},
	        {r:255, g:87, b:34},
	        {r:121, g:85, b:72},
	        {r:96, g:125, b:139}
	    ]
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'mappaint-control');

        var eraserMode = false;

        this.options.colors.forEach(function(color) {
        	var c = L.DomUtil.create('div', 'mappaint-color');
        	c.style.background = 'rgb('+color.r+','+color.g+','+color.b+')';
        	container.appendChild(c);
        	c.onclick = function() {
        		if (eraserMode) {
        			pencil.DisableEraser();
        			eraserMode = false;
        		}

        		if (previousC) {
        			previousC.classList.remove('selected');	
        		}
        		
        		c.classList.add('selected');
        		window.pencil.SetColor(color.r, color.g, color.b);

        		previousC = c;
        		return false;
        	}
        });

        var previousC = container.firstChild;
        previousC.click();

        var eraser = L.DomUtil.create('div', 'mappaint-eraser');
       	eraser.appendChild(document.createTextNode('\u232B'));
       	
       	eraser.onclick = function() {
       		pencil.EnableEraser();
       		eraserMode = true;
       		eraser.classList.add('selected');
    		if (previousC) {
    			previousC.classList.remove('selected');	
    		}
      		previousC = eraser;

      		return false;
       	} 

       	container.appendChild(eraser);

        return container;
    }
});

