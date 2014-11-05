MapPaint
========

Procedural painting for Leaflet maps.

[Demo](http://sintef-9012.github.io/MapPaint/)

### Usage

```javascript
leafletMap.MapPaint.enable();
```

```javascript
leafletMap.MapPaint.disable();
```

### Saving

By default the drawing is added to the map. You can setup a different save method :

```javascript
leafletMap.MapPaint.saveMethod = function(image, bounds) {
}
```
__image__ is a PNG file in base64 string

__bounds__ are the [L.LatLngBounds](http://leafletjs.com/reference.html#latlngbounds) of the drawing.

### Installation

```
bower install map-paint
```

### Acknowledgements

This library is developed in context of the [BRIDGE](http://www.bridgeproject.eu/en) project.

### Licence

The source code of this library is licenced under the MIT License.
