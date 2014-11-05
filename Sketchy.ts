module MapPaint {
	export class Sketchy {
		private dataGrid: SimplePartitionGrid;
		private context: CanvasRenderingContext2D;
		private previousPoints: { [input: string]: PaintPoint };
		public tapOrClick: {[input: string]: boolean};

		public color: string;
		public colorFull: string;
		public colorAlternative: string;
		public colorDark: string;

		public retina: number;

		private eraser: boolean;

		public modeFiller: boolean;

		public pencil: Pencil;


		constructor(context: CanvasRenderingContext2D) {
			this.dataGrid = new SimplePartitionGrid(128, 80);
			this.context = context;
			this.previousPoints = {};
			this.tapOrClick = {};
			this.eraser = false;
			this.retina = 1.0;

			this.modeFiller = false;

			this.SetColor(0, 0, 0);

			this.pencil = CrayonPencil;
		}

		public SetColor(r: number, g: number, b: number) {
			var c = 'rgba(' + r + ',' + g + ',' + b;
			this.color = c + ',0.45)';
			this.colorFull = c + ',1.0)';
			this.colorAlternative = c + ',0.16)';
			this.colorDark = 'rgba('
				+ Math.round(Math.max(0, r * 0.65 - 10)) + ','
				+ Math.round(Math.max(0, g * 0.65 - 10)) + ','
				+ Math.round(Math.max(0, b * 0.65 - 10)) + ',0.07)';
			this.dataGrid.Clear();
		}

		public EnableFiller() {
			this.modeFiller = true;
			this.dataGrid.Clear();
		}

		public DisableFiller() {
			this.modeFiller = false;
			this.dataGrid.Clear();
		}

		public EnableEraser() {
			this.eraser = true;
			this.dataGrid.Clear();
		}

		public DisableEraser() {
			this.eraser = false;
			this.dataGrid.Clear();
		}

		public Start(input: string, point: PaintPoint) {
			this.previousPoints[input] = point;
			this.tapOrClick[input] = true;

			//if (!this.eraser) {
			this.dataGrid.Add(point);
			//}
		}

		public Stroke(input: string, point: PaintPoint) {
			this.tapOrClick[input] = false;

			var ctx = this.context,
				previousPoint = this.previousPoints[input];

			ctx.globalCompositeOperation = this.modeFiller ? 'destination-over' : 'source-over';

			if (this.eraser) {
				MapPaint.Rubber.draw(ctx, point, previousPoint, this);
			} else {
				this.pencil.draw(ctx, point, previousPoint, this);
			}

			this.previousPoints[input] = point;

			this.dataGrid.Add(point);

			// If it's a retina screen, add a second point in the middle
			// (it smooths a bit the draw)
			if (this.retina > 1.0) {
				var middlePoint: PaintPoint = {
					x: (point.x + previousPoint.x) / 2,
					y: (point.y + previousPoint.y) / 2
				};

				this.dataGrid.Add(middlePoint);
			}


		}

		public Stop(input: string) {

			if (this.tapOrClick[input]) {
				var previousPoint = this.previousPoints[input],
					point = {
						x: previousPoint.x + 1,
						y: previousPoint.y + 1
					};
				this.Stroke(input, point);
			}
			delete this.previousPoints[input];
			if (this.eraser) {
				this.dataGrid.ApplyRemove();
			}
		}

		public Clear() {
			this.context.canvas.width = this.context.canvas.width;
			this.context.scale(this.retina, this.retina);
			this.dataGrid.Clear();
			this.dataGrid.ClearModifiedAreas();
		}

		public ClearDatagrid() {
			this.dataGrid.Clear();
		}

		public FetchPointsArround(point: PaintPoint): PartitionGridPaintPoint[] {
			return this.dataGrid.FetchArround(point);
		}

		public SavePicture(map: L.Map, callback: (image: string, bounds: L.LatLngBounds) => void) : boolean {
			var context = this.context;
			var s = new MapPaint.Save(context, 128, this.retina);

			var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
			var croppedSize = s.CropImageData(imageData);

			if (!croppedSize) {
				return false;
			}

			var png = s.CreatePngs([croppedSize]); 
			if (png.length && png[0]) {
				var leafletBounds = new L.LatLngBounds(
					map.containerPointToLatLng(new L.Point(croppedSize.xMin, croppedSize.yMin)),
					map.containerPointToLatLng(new L.Point(croppedSize.xMax, croppedSize.yMax))
				);

				callback(png[0], leafletBounds);
			}

			this.Clear();

			return true;
		}
	}
}
