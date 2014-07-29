interface Touch {
	identifier: number;
	target: EventTarget;
	screenX: number;
	screenY: number;
	clientX: number;
	clientY: number;
	pageX: number;
	pageY: number;
}

interface TouchList extends Array<Touch> {
	item(index: number): Touch;
	identifiedTouch(identifier: number): Touch;
}

interface TouchEvent extends UIEvent {
	touches: TouchList;
	targetTouches: TouchList;
	changedTouches: TouchList;
	altKey: boolean;
	metaKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	// initTouchEvent (type:string, canBubble:boolean, cancelable:boolean, view:AbstractView, detail:number, ctrlKey:boolean, altKey:boolean, shiftKey:boolean, metaKey:boolean, touches:TouchList, targetTouches:TouchList, changedTouches:TouchList);
}


module MapPaint {

	export interface PaintPoint {
		x: number;
		y: number;
	}

	export interface PaintBounds {
		xMin: number;
		xMax: number;
		yMin: number;
		yMax: number;
	}
	
	export interface PartitionGridPaintPoint extends PaintPoint {
		remove?: boolean;
	}		

	class SimplePartitionGrid {
		private _grid: { [pos: string]: PartitionGridPaintPoint[] } = {};
		private _modifiedAreas: {[pos: string]: boolean} = {};

		constructor(private size: number, private margin: number) {}

		public Add(point: PaintPoint) {
			var posX = Math.floor(point.x / this.size),
				posY = Math.floor(point.y / this.size),
				key = posX + "-" + posY;

			if (this._grid.hasOwnProperty(key)) {
				this._grid[key].push(point);
			} else {
				this._grid[key] = [point];
				this._modifiedAreas[key] = true;
			}
		}

		public ApplyRemove() {
			for (var key in this._grid) {
				var cell = this._grid[key],
					newt = [], change = false;

				for (var i = 0, l = cell.length; i < l; ++i) {
					if (!cell[i].remove) {
						newt.push(i);
					} else {
						change = true;
					}	
				}

				if (change) {
					this._grid[key] = newt;
				}
			}
		}

		private _ConcatWithKey(points: PaintPoint[], key: string) : PaintPoint[] {
			if (this._grid.hasOwnProperty(key)) {
				return points.concat(this._grid[key]);
			}
			return points;
		}

		public FetchArround(point: PaintPoint) : PartitionGridPaintPoint[] {
			var posX = Math.floor(point.x / this.size),
				posY = Math.floor(point.y / this.size),
				startX = posX * this.size,
				startY = posY * this.size,
				key = posX + "-" + posY,
				points = this._grid.hasOwnProperty(key) ? this._grid[key].slice() : [];

			if (point.x - startX < this.margin) {
				points = this._ConcatWithKey(points, (posX - 1) + "-" + posY);
			}

			if (point.y - startY < this.margin) {
				points = this._ConcatWithKey(points, posX + "-" + (posY - 1));
			}

			var upperMargin = this.size - this.margin;
			if (point.x - startX > upperMargin) {
				points = this._ConcatWithKey(points, (posX + 1) + "-" + posY);
			}

			if (point.y - startY > upperMargin) {
				points = this._ConcatWithKey(points, posX + "-" + (posY + 1));
			}

			return points;
		}

		public Clear() {
			this._grid = {};
		}

		public ClearModifiedAreas() {
			this._modifiedAreas = {};
		}

		public GetModifiedAreas() {
			return this._modifiedAreas;
		}

		public GetGridSize() {
			return this.size;
		}
	}

	export class Sketchy {
		private dataGrid: SimplePartitionGrid;
		private context: CanvasRenderingContext2D;
		private previousPoints: { [input: string]: PaintPoint };

		private color: string;
		//private colorFull: string;
		private colorAlternative: string;
		private colorDark: string;

		private eraser: boolean;

		private retina: boolean;

		constructor(context: CanvasRenderingContext2D) {
			this.dataGrid = new SimplePartitionGrid(128, 80);
			this.context = context;
			this.previousPoints = {};
			this.eraser = false;
			this.retina = false;

			this.SetColor(0, 0, 0);
		}

		public SetRetina() {
			this.retina = true;
		}

		public SetColor(r: number, g: number, b: number) {
			var c = 'rgba(' + r + ',' + g + ',' + b;
			this.color = c + ',0.4)';
			//this.colorFull = c + ',0.9)';
			this.colorAlternative = c + ',0.16)';
			this.colorDark = 'rgba('
				+ Math.round(Math.max(0, r * 0.65 - 10)) + ','
				+ Math.round(Math.max(0, g * 0.65 - 10)) + ','
			+ Math.round(Math.max(0, b * 0.65 - 10)) + ',0.07)';
			this.dataGrid.Clear();
		}

		public EnableEraser() {
			this.eraser = true;
			this.dataGrid.Clear();
		}

		public DisableEraser() {
			this.eraser = false;
		} 
		
		public Start(input: string, point: PaintPoint) {
			this.previousPoints[input] = point;

			if (!this.eraser) {
				this.dataGrid.Add(point);
			}
		}

		public Stroke(input:string, point: PaintPoint) {
		
			var ctx = this.context,
				previousPoint = this.previousPoints[input];

			var sdx = previousPoint.x - point.x,
				sdy = previousPoint.y - point.y,
				speed = sdx * sdx + sdy * sdy;

			if (!this.eraser) {
				ctx.globalCompositeOperation = 'source-over';

				/*var w = 1;

				if (!this.retina) {
					var xa = 0,
						ya = 1,
						xb = 255,
						yb = 3;

					w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));
				}

				ctx.lineWidth = w;/

				/*if (w > 1) {
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.strokeStyle = this.colorFull;
				} else {
					ctx.strokeStyle = this.color;
				}*/

				ctx.beginPath();
				ctx.strokeStyle = this.color;
				ctx.lineWidth = 1;

				ctx.moveTo(previousPoint.x, previousPoint.y);
				ctx.lineTo(point.x, point.y);
				ctx.stroke();
				/*ctx.lineCap = 'butt';
				ctx.lineJoin = 'miter';*/

				ctx.strokeStyle = this.colorAlternative;
			} else {
				ctx.globalCompositeOperation = 'destination-out';

				ctx.beginPath();
				ctx.strokeStyle = 'rgba(0,0,0,0.6)';
				ctx.lineWidth = 10;
				ctx.lineCap = 'round';

				ctx.moveTo(previousPoint.x, previousPoint.y);
				ctx.lineTo(point.x, point.y);

				ctx.stroke();
				ctx.lineCap = 'butt';
			}

			if (speed < (this.retina ? 500 : 1200)) {
				var points = this.dataGrid.FetchArround(point);

				var lines = [];
				ctx.beginPath();
				//if (!this.eraser) {
					ctx.strokeStyle = this.colorDark;
				//}
				ctx.lineWidth = 2;

				for (var i = 0, l = points.length; i < l; ++i) {
					var px = points[i].x,
						py = points[i].y,
						dx = px - point.x,
						dy = py - point.y,
						d = dx * dx + dy * dy;

					if (d < 3000) {
						/*if (this.eraser) {
							dataGrid[i].remove = true;
						}*/
						if (Math.random() > d / 1500) {
							lines.push(points[i]);

							if (Math.random() > 0.1) {
								var rl = 0.2 + Math.random() * 0.14,
									mx = dx * rl,
									my = dy * rl;
								ctx.moveTo(point.x + mx, point.y + my);
								ctx.lineTo(px - mx, py - my);
							}
						}

					}
				}

				ctx.stroke();

				ctx.beginPath();
				if (!this.eraser) {
					ctx.strokeStyle = this.colorAlternative;
				}
				ctx.lineWidth = 1;

				for (i = 0, l = lines.length; i < l; ++i) {
					px = lines[i].x;
					py = lines[i].y;
					dx = px - point.x;
					dy = py - point.y;
					rl = 0.2 + Math.random() * 0.14;
					mx = dx * rl;
					my = dy * rl;
					ctx.moveTo(point.x + mx, point.y + my);
					ctx.lineTo(px - mx, py - my);
				}

				ctx.stroke();
			}


			this.previousPoints[input] = point;

			//if (!this.eraser) {
				this.dataGrid.Add(point);
			//}
		}

		public Stop(input: string) {
			delete this.previousPoints[input];
			if (this.eraser) {
				this.dataGrid.ApplyRemove();
			}
		}

		public Clear() {
			this.context.canvas.width = this.context.canvas.width;
			this.dataGrid.Clear();
			this.dataGrid.ClearModifiedAreas();
		}
	}

	export class Save {
		constructor(private context: CanvasRenderingContext2D, private size: number) {
			
		}

		public MergeModifiedAreas(modifiedAreas: { [pos: string]: boolean }) {

			var areas: { [pos: string]: PaintBounds } = {};

			var key;

			for (key in modifiedAreas) {
				areas[key] = null;
			}

			for (key in areas) {
				if (areas[key] === null) {
					var p = key.split('-'),
						x = parseInt(p[0]),
						y = parseInt(p[1]);

					var bounds = {
						xMin: x,
						xMax: x + 1,
						yMin: y,
						yMax: y + 1 
					};

					Save._RecursiveMadness(areas, x, y, bounds);
				}
			}


			var newAreas = [];

			for (key in areas) {
				var area: any = areas[key];
				if (!area._lapin) {
					newAreas.push(area);
					area._lapin = true;
					area.xMin *= this.size;
					area.xMax *= this.size;
					area.yMin *= this.size;
					area.yMax *= this.size;
				}
			}

			return newAreas;
		}

		private static _RecursiveMadness(areas: {[pos:string]: PaintBounds}, x: number, y: number, bounds: PaintBounds) {
			var key = x + '-' + y;

			if (areas.hasOwnProperty(key) && areas[key] === null) {

				bounds.xMin = Math.min(x, bounds.xMin);
				bounds.xMax = Math.max(x + 1, bounds.xMax);
				bounds.yMin = Math.min(y, bounds.yMin);
				bounds.yMax = Math.max(y + 1, bounds.yMax);

				areas[key] = bounds;

				this._RecursiveMadness(areas, x - 1, y, bounds);
				this._RecursiveMadness(areas, x, y - 1, bounds);
				this._RecursiveMadness(areas, x + 1, y, bounds);
				this._RecursiveMadness(areas, x, y + 1, bounds);
				this._RecursiveMadness(areas, x - 1, y - 1, bounds);
				this._RecursiveMadness(areas, x + 1, y - 1, bounds);
				this._RecursiveMadness(areas, x + 1, y + 1, bounds);
				this._RecursiveMadness(areas, x - 1, y + 1, bounds);
			}
		}

		public DrawAreas(areas: PaintBounds[]) {
			this.context.fillStyle = 'rgba(255,128,64,0.25)';

			for (var key in areas) {
				var bounds = areas[key];

				this.context.fillRect(
					bounds.xMin, bounds.yMin,
					bounds.xMax - bounds.xMin,
					bounds.yMax - bounds.yMin);
			}
		}

		public GetImageData(bounds: PaintBounds) : ImageData {
			return this.context.getImageData(
					bounds.xMin, bounds.yMin,
					bounds.xMax - bounds.xMin,
					bounds.yMax - bounds.yMin);
		}

		public CropImageData(image: ImageData) : PaintBounds {
			var w = image.width,
				h = image.height;

			var xMin = Number.MAX_VALUE,
				xMax = -Number.MAX_VALUE,
				yMin = Number.MAX_VALUE,
				yMax = -Number.MAX_VALUE,
				found = false;

			// It's not the fastest algorithm, lets see if it's enough
			for (var y = 0; y < h; ++y) {
				for (var x = 0; x < w; ++x) {

					var pixelPosition = (y * w + x) * 4 + 3,
						pixelAlpha = image.data[pixelPosition];

					// If we have something
					if (pixelAlpha > 0) {
						found = true;
						if (y < yMin) {
							yMin = y;
						}
						if (y > yMax) {
							yMax = y;
						}
						if (x > xMax) {
							xMax = x;
						}
						if (x < xMin) {
							xMin = x;
						}
					}
				}
			}

			if (found) {
				return {
					xMin: xMin,
					xMax: xMax,
					yMin: yMin,
					yMax: yMax
				}
			} else {
				return null;
			}
		}

		public CroppedDrawAreas(areas: PaintBounds[]): PaintBounds[] {
			var newAreas = [];

			var margin = 8;

			areas.forEach((area: PaintBounds) => {
				if (area === null) return;
				console.log(area);
				var imageData = this.GetImageData(area);
				console.log(imageData);

				var croppedBounds = this.CropImageData(imageData);
				console.log(croppedBounds);
				if (croppedBounds === null) return;

				var newBounds = {
					xMin: Math.max(0, area.xMin + croppedBounds.xMin - margin),
					xMax: area.xMin + croppedBounds.xMax + margin,
					yMin: Math.max(0, area.yMin + croppedBounds.yMin - margin),
					yMax: area.yMin + croppedBounds.yMax + margin
				};



				newAreas.push(newBounds);
			});

			return newAreas;
		}

		public CreatePngs(areas: PaintBounds[]): string[] {
			var images = [];
			areas.forEach((area: PaintBounds) => {
				if (area === null) {
					images.push(null);
					return;
				};

				var imageData = this.GetImageData(area);

				var tmpCanvas: HTMLCanvasElement = document.createElement('canvas');
				tmpCanvas.width = area.xMax - area.xMin;
				tmpCanvas.height = area.yMax - area.yMin;

				tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);

				images.push(tmpCanvas.toDataURL('image/png'));
			});

			return images;
		}
	}
}

function lol() {
	s = new MapPaint.Save(pencil.context, 128)
	a = s.MergeModifiedAreas(pencil.dataGrid._modifiedAreas)
	b = s.CroppedDrawAreas(a)
	s.DrawAreas(b)
}
