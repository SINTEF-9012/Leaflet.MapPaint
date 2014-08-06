/// <reference path="./bower_components/DefinitelyTyped/leaflet/leaflet.d.ts"/>
var MyControl = L.Control.extend({
    options: {
        position: 'topright',
        colors: [
            { r: 0, g: 0, b: 0 },
            { r: 255, g: 255, b: 255 },
            { r: 229, g: 28, b: 35 },
            { r: 156, g: 39, b: 176 },
            { r: 63, g: 81, b: 181 },
            { r: 3, g: 169, b: 244 },
            { r: 0, g: 150, b: 136 },
            { r: 10, g: 126, b: 7 },
            { r: 205, g: 220, b: 57 },
            { r: 255, g: 193, b: 7 },
            { r: 255, g: 87, b: 34 },
            { r: 121, g: 85, b: 72 },
            { r: 96, g: 125, b: 139 }
        ]
    },
    onAdd: function (map) {
        var _this = this;
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'mappaint-control');

        var eraserMode = false, fillerMode = false;

        this.options.colors.forEach(function (color) {
            var c = L.DomUtil.create('div', 'mappaint-color');
            c.style.background = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
            container.appendChild(c);
            c.onclick = function () {
                if (eraserMode) {
                    _this.pencil.DisableEraser();
                    eraserMode = false;
                }

                if (previousC) {
                    previousC.classList.remove('selected');
                }

                c.classList.add('selected');
                _this.pencil.SetColor(color.r, color.g, color.b);

                previousC = c;
                return false;
            };
        });

        var previousC = container.firstChild;
        previousC.onclick(null);

        var eraser = L.DomUtil.create('div', 'mappaint-eraser');

        eraser.onclick = function () {
            _this.pencil.EnableEraser();
            eraserMode = true;
            if (previousC) {
                previousC.classList.remove('selected');
            }
            eraser.classList.add('selected');
            previousC = eraser;

            return false;
        };

        container.appendChild(eraser);

        var filler = L.DomUtil.create('div', 'mappaint-filler');

        filler.onclick = function () {
            fillerMode = !fillerMode;
            if (fillerMode) {
                _this.pencil.EnableFiller();
                filler.classList.add('enabled');
            } else {
                _this.pencil.DisableFiller();
                filler.classList.remove('enabled');
            }

            return false;
        };

        container.appendChild(filler);

        return container;
    }
});

var MyControl2 = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        var _this = this;
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-mappaint');

        var btn = L.DomUtil.create('button', 'lol');
        btn.appendChild(document.createTextNode('plop'));

        L.DomEvent.addListener(btn, 'click', function () {
            var pencil = _this.pencil;
            s = new MapPaint.Save(pencil.context, 128, pencil.retina);
            a = s.MergeModifiedAreas(pencil.dataGrid._modifiedAreas);
            b = s.CroppedDrawAreas(a);
            s.DrawAreas(b);

            var images = s.CreatePngs(b);

            for (var i = 0, l = b.length; i < l; ++i) {
                var bounds = b[i], image = images[i];

                if (!image) {
                    continue;
                }

                var leafletBounds = new L.LatLngBounds(map.containerPointToLatLng(new L.Point(bounds.xMin, bounds.yMin)), map.containerPointToLatLng(new L.Point(bounds.xMax, bounds.yMax)));

                L.imageOverlay(image, leafletBounds).addTo(map);
            }

            pencil.Clear();
        });

        container.appendChild(btn);

        return container;
    }
});

var L;
(function (L) {
    L.MapPaint;
})(L || (L = {}));

L.MapPaint = L.Handler.extend({
    includes: L.Mixin.Events,
    addHooks: function () {
        var canvas = this._canvas = document.createElement('canvas');

        var container = this._map._container;

        canvas.height = container.offsetHeight;
        canvas.width = container.offsetWidth;

        container.appendChild(canvas);

        this.disableMapInteractions();

        this._context = canvas.getContext('2d');

        this.pencil = new MapPaint.Sketchy(this._context);

        this.pencil.retina = this._enhanceContext(this._context);

        this.control = new MyControl();
        this.control.pencil = this.pencil;
        this._map.addControl(this.control);

        this.control2 = new MyControl2();
        this.control2.pencil = this.pencil;
        this._map.addControl(this.control2);

        L.DomEvent.addListener(canvas, 'mousedown', this._onMouseDown, this);
        L.DomEvent.addListener(canvas, 'mouseup', this._onMouseUp, this);

        L.DomEvent.addListener(canvas, 'touchstart', this._onTouchStart, this);
        L.DomEvent.addListener(canvas, 'touchend', this._onTouchEnd, this);
        L.DomEvent.addListener(canvas, 'touchcancel', this._onTouchEnd, this);

        this._map.on('resize', this._onResize, this);
    },
    _onMouseDown: function (e) {
        this.pencil.Start('mouse', { x: e.clientX, y: e.clientY });

        L.DomEvent.addListener(this._canvas, 'mousemove', this._onMouseMove, this);

        e.preventDefault();
    },
    _onMouseMove: function (e) {
        this.pencil.Stroke('mouse', { x: e.clientX, y: e.clientY });

        e.preventDefault();
    },
    _onMouseUp: function () {
        this.pencil.Stop('mouse');
        L.DomEvent.removeListener(this._canvas, 'mousemove', this._onMouseMove, this);
    },
    _onTouchStart: function (e) {
        console.log('LAPPPIN');

        for (var i = 0, l = e.touches.length; i < l; ++i) {
            var t = e.touches[i];
            console.log(t.clientX, t.clientY);
            this.pencil.Start("touch" + t.identifier, { x: t.clientX, y: t.clientY });
        }

        L.DomEvent.addListener(this._canvas, 'touchmove', this._onTouchMove, this);

        e.preventDefault();
    },
    _onTouchMove: function (e) {
        for (var i = 0, l = e.touches.length; i < l; ++i) {
            var t = e.touches[i];
            this.pencil.Stroke("touch" + t.identifier, { x: t.clientX, y: t.clientY });
        }

        e.preventDefault();
    },
    _onTouchEnd: function (e) {
        for (var i = 0, l = e.touches.length; i < l; ++i) {
            var t = e.touches[i];
            this.pencil.Stop("touch" + t.identifier);
        }

        L.DomEvent.removeListener(this._canvas, 'touchmove', this._onTouchMove);
    },
    disableMapInteractions: function () {
        var map = this._map;

        this._interactionsStates = {
            dragging: map.dragging.enabled(),
            touchZoom: map.touchZoom.enabled(),
            doubleClickZoom: map.doubleClickZoom.enabled(),
            scrollWheelZoom: map.scrollWheelZoom.enabled(),
            boxZoom: map.boxZoom.enabled(),
            keyboard: map.keyboard.enabled(),
            tap: map.tap && map.tap.enabled()
        };

        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        map.tap && map.tap.disable();
    },
    restoreMapInteractions: function () {
        var map = this._map, interactions = this._interactionsStates;

        if (interactions.dragging) {
            map.dragging.enable();
        }

        if (interactions.touchZoom) {
            map.touchZoom.enable();
        }

        if (interactions.doubleClickZoom) {
            map.doubleClickZoom.enable();
        }

        if (interactions.scrollWheelZoom) {
            map.scrollWheelZoom.enable();
        }

        if (interactions.boxZoom) {
            map.boxZoom.enable();
        }

        if (interactions.keyboard) {
            map.keyboard.enable();
        }

        if (interactions.tap) {
            map.tap.enable();
        }
    },
    _enhanceContext: function () {
        var canvas = this._canvas;
        var ratio = window.devicePixelRatio || 1, width = canvas.width, height = canvas.height;

        if (ratio > 1) {
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            this._context.scale(ratio, ratio);
            return ratio;
        }
        return 1.0;
    },
    _onResize: function (e) {
        var canvas = this._canvas, ctx = this._context, imageData = ctx.getImageData(0, 0, canvas.width, canvas.height), container = this._map._container;

        canvas.height = container.offsetHeight;
        canvas.width = container.offsetWidth;

        this._enhanceContext();
        this.pencil.ClearDatagrid();

        var center = e.newSize.subtract(e.oldSize).multiplyBy(0.5);

        ctx.putImageData(imageData, center.x, center.y);
    }
});

L.Map.addInitHook('addHandler', 'MapPaint', L.MapPaint);
//# sourceMappingURL=leaflet.js.map
