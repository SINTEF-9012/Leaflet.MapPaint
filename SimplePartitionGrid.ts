module MapPaint {
	export class SimplePartitionGrid {
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
}
