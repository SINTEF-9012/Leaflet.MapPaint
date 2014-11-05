Leaflet.MapPaint
================

Bitmap painting for [Leaflet](http://leafletjs.com).

## [Demo](http://sintef-9012.github.io/MapPaint/)

### Requirements

 * Leaflet 0.7
 * HTML5 browser with canvas support
  * Tested with Safari iOS8, Firefox 33, Chrome 38 and Internet Explorer 11



### Installation

[Download the archive](https://github.com/SINTEF-9012/MapPaint/archive/master.zip) or use bower :

```
bower install map-paint
```

You need to include the JavaScript file and the CSS file. Feel free to improve the CSS file.

### Usage

```javascript
leafletMap.MapPaint.enable();
...
leafletMap.MapPaint.disable();
```

You can also use control switch
```javascript
leafletMap.addControl(new MapPaint.SwitchControl());
```

### Saving

By default the drawing is added to the map as a [L.ImageOverlay](http://leafletjs.com/reference.html#imageoverlay). You can setup a different save method :

```javascript
leafletMap.MapPaint.saveMethod = function(image, bounds) {
}
```
__image__ is a PNG file as a base64 string

__bounds__ are the [L.LatLngBounds](http://leafletjs.com/reference.html#latlngbounds) of the drawing.

### Acknowledgements

This library is developed in context of the [BRIDGE](http://www.bridgeproject.eu/en) project.

### Licence

The source code of this library is licenced under the MIT License.
