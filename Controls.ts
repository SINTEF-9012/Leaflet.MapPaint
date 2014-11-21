/// <reference path="./bower_components/DefinitelyTyped/leaflet/leaflet.d.ts"/>

module MapPaint {
	export var SwitchControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},

		onAdd: function(map: L.Map) {
			// create the control container with a particular class name
			var container = L.DomUtil.create('div', 'leaflet-bar mappaint-switch');

			var mapPaint = (<any>map).MapPaint;

			if (mapPaint.enabled()) {
				container.classList.add("enabled");
			}

			container.onclick = () => {
				if (mapPaint.enabled()) {
					mapPaint.disable();
					container.classList.remove("enabled");
				} else {
					mapPaint.enable();
					container.classList.add("enabled");
				}
				return false;
			};

			return container;

		}
	});

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
				{ r: 96, g: 125, b: 139 },
				{ r: 178, g: 168, b: 163 },
				{ r: 255, g: 128, b: 171 }
			]
		},

		onAdd: function (/*map*/) {
			// create the control container with a particular class name
			var parentContainer = L.DomUtil.create('div', 'mappaint-control');
			var container = L.DomUtil.create('div', '');
			parentContainer.appendChild(container);

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

			return parentContainer;
		}
	});

	export var ActionControl = L.Control.extend({
		options: {
			position: 'topleft',
			pencils: [
				{ name: "Procedural", obj: "ProceduralPencil" },
				{ name: "Crayon", obj: "CrayonPencil" },
				{ name: "Felt", obj: "UglyFeltPen" },
				{ name: "Circles", obj: "CirclesPencil" },
				{ name: "Stripes", obj: "StripesPencil" }
			]
		},

		onAdd: function(map: L.Map) {
			// create the control container with a particular class name
			var parentContainer = L.DomUtil.create('div', 'mappaint-control');
			var container = L.DomUtil.create('div', '');
			parentContainer.appendChild(container);

			var btnSave = L.DomUtil.create('button', 'action-button action-button-save');
			btnSave.appendChild(document.createTextNode('Save'));

			L.DomEvent.addListener(btnSave, 'click', () => {
				var pencil : MapPaint.Sketchy = this.pencil;
				pencil.SavePicture(map, (image, bounds) => {
					this.mappaint.saveMethod(image, bounds);
				});

				/*s = new MapPaint.Save(pencil.context, 128, pencil.retina)
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

				pencil.Clear();*/

			});

			container.appendChild(btnSave);
			
			/*var filler = L.DomUtil.create('div', 'mappaint-filler');

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

			container.appendChild(filler);*/

			var eraserMode = false,
				fillerMode = false;


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

			this.options.pencils.forEach((pencil) => {
				var c = L.DomUtil.create('div', 'mappaint-pencil mappaint-'+pencil.obj.toLocaleLowerCase());
				c.appendChild(document.createTextNode(pencil.name));
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
					this.pencil.pencil = MapPaint[pencil.obj];

					previousC = c;
					return false;
				}
			});

			var previousC = <HTMLElement> container.children[2];
			previousC.onclick(null);

			return parentContainer;
		}
	});


}
