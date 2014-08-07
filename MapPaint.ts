/// <reference path="./bower_components/DefinitelyTyped/leaflet/leaflet.d.ts"/>
 
L.MapPaint = L.Handler.extend({
	includes: L.Mixin.Events,


	addHooks: function () {
		var canvas = this._canvas = <HTMLCanvasElement> document.createElement('canvas');

		var container = <HTMLDivElement> this._map._container;

		canvas.height = container.offsetHeight;
		canvas.width = container.offsetWidth;

		container.appendChild(canvas);

		this.disableMapInteractions();

		this._context = canvas.getContext('2d');

		this.pencil = new MapPaint.Sketchy(this._context);

		this.pencil.retina = this._enhanceContext(this._context);

		this.colorControl = new MapPaint.ColorControl();
		this.colorControl.pencil = this.pencil;
		this._map.addControl(this.colorControl);

		this.saveControl = new MapPaint.SaveControl();
		this.saveControl.pencil = this.pencil;
		this._map.addControl(this.saveControl);

		L.DomEvent.addListener(canvas, 'mousedown', this._onMouseDown, this);
		L.DomEvent.addListener(canvas, 'mouseup', this._onMouseUp, this);
		L.DomEvent.addListener(canvas, 'mouseout', this._onMouseUp, this);

		L.DomEvent.addListener(canvas, 'touchstart', this._onTouchStart, this);
		L.DomEvent.addListener(canvas, 'touchend', this._onTouchEnd, this);
		L.DomEvent.addListener(canvas, 'touchcancel', this._onTouchEnd, this);

		this._map.on('resize', this._onResize, this);
	},

	_onMouseDown: function (e: MouseEvent) {
		this.pencil.Start('mouse', { x: e.clientX, y: e.clientY });

		L.DomEvent.addListener(this._canvas, 'mousemove', this._onMouseMove, this);

		e.preventDefault();
	},

	_onMouseMove: function (e: MouseEvent) {
		this.pencil.Stroke('mouse', { x: e.clientX, y: e.clientY });

		e.preventDefault();
	},

	_onMouseUp: function () {
		this.pencil.Stop('mouse');
		L.DomEvent.removeListener(this._canvas, 'mousemove', this._onMouseMove, this);
	},

	_onTouchStart: function (e: TouchEvent) {

		console.log('LAPPPIN');
		
		for (var i = 0, l = e.touches.length; i < l; ++i) {
			var t = e.touches[i];
			console.log(t.clientX, t.clientY);
			this.pencil.Start("touch"+t.identifier, { x: t.clientX, y: t.clientY });
		}

		L.DomEvent.addListener(this._canvas, 'touchmove', this._onTouchMove, this);

		e.preventDefault();
	},

	_onTouchMove: function(e: TouchEvent) {
		for (var i = 0, l = e.touches.length; i < l; ++i) {
			var t = e.touches[i];
			this.pencil.Stroke("touch"+t.identifier, { x: t.clientX, y: t.clientY });
		}

		e.preventDefault();
	},

	_onTouchEnd: function(e: TouchEvent) {
		for (var i = 0, l = e.touches.length; i < l; ++i) {
			var t = e.touches[i];
			this.pencil.Stop("touch" + t.identifier);
		}

		L.DomEvent.removeListener(this._canvas, 'touchmove', this._onTouchMove);
	},

	disableMapInteractions: function () {
		var map : L.Map = this._map;

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

	restoreMapInteractions: function() {
		var map: L.Map = this._map, interactions = this._interactionsStates;

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
		var canvas : HTMLCanvasElement = this._canvas;
		var ratio = window.devicePixelRatio || 1,
			width = canvas.width,
			height = canvas.height;

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

	_onResize: function (e: L.LeafletResizeEvent) {
		var	canvas = <HTMLCanvasElement> this._canvas,
			ctx = <CanvasRenderingContext2D>this._context,
			imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
			container = <HTMLDivElement> this._map._container;

		canvas.height = container.offsetHeight;
		canvas.width = container.offsetWidth;

		this._enhanceContext();
		this.pencil.ClearDatagrid();

		var center = e.newSize.subtract(e.oldSize).multiplyBy(0.5);

		ctx.putImageData(imageData, center.x, center.y);
	}
});


L.Map.addInitHook('addHandler', 'MapPaint', L.MapPaint);
