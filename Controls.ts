/// <reference path="./bower_components/DefinitelyTyped/leaflet/leaflet.d.ts"/>

module MapPaint {
	export var ColorControl = L.Control.extend({
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

		onAdd: function (/*map*/) {
			// create the control container with a particular class name
			var container = L.DomUtil.create('div', 'mappaint-control');

			var eraserMode = false,
				fillerMode = false;

			this.options.colors.forEach((color) => {
				var c = L.DomUtil.create('div', 'mappaint-color');
				c.style.background = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
				container.appendChild(c);
				c.onclick = () => {
					if (eraserMode) {
						this.pencil.DisableEraser();
						eraserMode = false;
					}

					if (previousC) {
						previousC.classList.remove('selected');
					}

					c.classList.add('selected');
					this.pencil.SetColor(color.r, color.g, color.b);

					previousC = c;
					return false;
				}
			});

			var previousC = <HTMLElement> container.firstChild;
			previousC.onclick(null);

			var eraser = L.DomUtil.create('div', 'mappaint-eraser');

			eraser.onclick = () => {
				this.pencil.EnableEraser();
				eraserMode = true;
				if (previousC) {
					previousC.classList.remove('selected');
				}
				eraser.classList.add('selected');
				previousC = eraser;

				return false;
			}

			container.appendChild(eraser);

			var filler = L.DomUtil.create('div', 'mappaint-filler');

			filler.onclick = () => {
				fillerMode = !fillerMode;
				if (fillerMode) {
					this.pencil.EnableFiller();
					filler.classList.add('enabled');
				} else {
					this.pencil.DisableFiller();
					filler.classList.remove('enabled');
				}

				return false;
			};

			container.appendChild(filler);

			return container;
		}
	});

	export var SaveControl = L.Control.extend({
		options: {
			position: 'topleft'
		},

		onAdd: function(map: L.Map) {
			// create the control container with a particular class name
			var container = L.DomUtil.create('div', 'leaflet-bar leaflet-mappaint');
			/*
			var btn = L.DomUtil.create('button', 'lol');
			btn.appendChild(document.createTextNode('plop'));

			L.DomEvent.addListener(btn, 'click', () => {
				var pencil : MapPaint.Sketchy = this.pencil;
				s = new MapPaint.Save(pencil.context, 128, pencil.retina)
				a = s.MergeModifiedAreas(pencil.dataGrid._modifiedAreas)
				b = s.CroppedDrawAreas(a)
				s.DrawAreas(b);

				var images = s.CreatePngs(b);

				for (var i = 0, l = b.length; i < l; ++i) {
					var bounds : MapPaint.PaintBounds = b[i],
						image: string = images[i];

					if (!image) {
						continue;
					}

					var leafletBounds = new L.LatLngBounds(
						map.containerPointToLatLng(new L.Point(bounds.xMin, bounds.yMin)),
						map.containerPointToLatLng(new L.Point(bounds.xMax, bounds.yMax))
					);

					L.imageOverlay(image, leafletBounds).addTo(map);
				}

				pencil.Clear();
			});

			container.appendChild(btn);*/

			return container;
		}
	});


}
