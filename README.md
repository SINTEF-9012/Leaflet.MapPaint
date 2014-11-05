Leaflet MapPaint
================

Bitmap painting for [Leaflet](http://leafletjs.com).

[Demo](http://sintef-9012.github.io/MapPaint/)

### Usage

```javascript
leafletMap.MapPaint.enable();
...
leafletMap.MapPaint.disable();
```

Or use the control switch
```javascript
leafletMap.addControl(new MapPaint.SwitchControl());
```

### Saving

By default the drawing is added to the map. You can setup a different save method :

```javascript
leafletMap.MapPaint.saveMethod = function(image, bounds) {
}
```
__image__ is a PNG file as a base64 string

__bounds__ are the [L.LatLngBounds](http://leafletjs.com/reference.html#latlngbounds) of the drawing.

### Installation

```
bower install map-paint
```

### Acknowledgements

This library is developed in context of the [BRIDGE](http://www.bridgeproject.eu/en) project.

### Licence

The source code of this library is licenced under the MIT License.
