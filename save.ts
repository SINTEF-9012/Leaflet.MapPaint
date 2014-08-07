 module MapPaint {
	 export class Save {
		 constructor(private context: CanvasRenderingContext2D, private size: number, private retina: number) {

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

		 private static _RecursiveMadness(areas: { [pos: string]: PaintBounds }, x: number, y: number, bounds: PaintBounds) {
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

		 public GetImageData(bounds: PaintBounds): ImageData {
			 var r = this.retina;
			 return this.context.getImageData(
				 bounds.xMin * r, bounds.yMin * r,
				 (bounds.xMax - bounds.xMin) * r,
				 (bounds.yMax - bounds.yMin) * r);
		 }

		 public CropImageData(image: ImageData): PaintBounds {
			 var w = image.width,
				 h = image.height,
				 r = this.retina;

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
					 xMin: xMin / r,
					 xMax: xMax / r,
					 yMin: yMin / r,
					 yMax: yMax / r
				 }
			 } else {
				 return null;
			 }
		 }

		 public CroppedDrawAreas(areas: PaintBounds[]): PaintBounds[] {
			 var newAreas = [];

			 var margin = 8;

			 areas.forEach((area: PaintBounds) => {
				 if (!area) return;
				 console.log(area);
				 var imageData = this.GetImageData(area);
				 console.log(imageData);

				 var croppedBounds = this.CropImageData(imageData);
				 console.log(croppedBounds);
				 if (!croppedBounds) return;

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
			 var images = [], r = this.retina;
			 areas.forEach((area: PaintBounds) => {
				 if (!area) {
					 images.push(null);
					 return;
				 };

				 var imageData = this.GetImageData(area);

				 var tmpCanvas: HTMLCanvasElement = document.createElement('canvas');
				 tmpCanvas.width = (area.xMax - area.xMin) * r;
				 tmpCanvas.height = (area.yMax - area.yMin) * r;

				 tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);

				 images.push(tmpCanvas.toDataURL('image/png'));
			 });

			 return images;
		 }
	 }
 }
