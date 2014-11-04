module MapPaint {

	var crayonPencilPattern: CanvasPattern,
		crayonPencilColor: string,
		crayonPencilPattern2: CanvasPattern,
		crayonPencilColor2: string,
		crayonPencilGetPattern = (color: string, mode: number) => {
			if (mode === 1 && crayonPencilPattern && crayonPencilColor === color) {
				return crayonPencilPattern;
			}

			if (mode === 2 && crayonPencilPattern2 && crayonPencilColor2 === color) {
				return crayonPencilPattern2;
			}

			if (mode === 1) {
				crayonPencilColor = color;
			} else if (mode == 2) {
				crayonPencilColor2 = color;
			}

			var patternCanvas = document.createElement('canvas'),
				ctx: CanvasRenderingContext2D = patternCanvas.getContext('2d'),
				size = 40;

			patternCanvas.width = patternCanvas.height = size;

			ctx.fillStyle = color;
			ctx.fillRect(0, 0, size, size);

			var imageData = ctx.getImageData(0, 0, size, size),
				random = Math.random,
				pixels = imageData.data;

			for (var i = 0, n = pixels.length; i < n; i += 4) {
				pixels[i + 3] = (random() * 256) | 0;
			}

			ctx.putImageData(imageData, 0, 0);

			var rogerCanvas : HTMLCanvasElement = document.createElement('canvas'),
				rogerCtx: CanvasRenderingContext2D = rogerCanvas.getContext('2d');

			var biggerSize = size * 2;
			rogerCanvas.width = rogerCanvas.height = biggerSize;

			rogerCtx.drawImage(patternCanvas, 0, 0, size, size, 0, 0, biggerSize, biggerSize);

			size = biggerSize;

			imageData = rogerCtx.getImageData(0, 0, size, size);
			pixels = imageData.data;

			var max = mode === 1 ? 142 : 202;

			var lockupCurveTable = new Array(256);

			var iL = 0;
			for (; iL < max - 25; ++iL) {
				lockupCurveTable[iL] = 255;
			}

			for (var cptIL = 0; iL < max + 25; ++iL & ++cptIL) {
				lockupCurveTable[iL] = 255 - cptIL * 5;
			}

			for (; iL < 256; ++iL) {
				lockupCurveTable[iL] = 0;
			}

			for (var x = 0; x < size; ++x) {
				for (var y = 0; y < size; ++y) {
					var i = ((x * size + y) << 2) + 3;
					pixels[i] = lockupCurveTable[pixels[i]];
				}
			}
			rogerCtx.putImageData(imageData, 0, 0);
			//ctx.closePath();
			//ctx.fill();
			if (mode === 1) {
				return crayonPencilPattern = ctx.createPattern(rogerCanvas, 'repeat');
			} else {
				return crayonPencilPattern2 = ctx.createPattern(rogerCanvas, 'repeat');
			}
		};

	export var CrayonPencil : Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {
			var r = sketch.retina > 1.0 ? 0.66 : 1.0;
			var pattern = crayonPencilGetPattern(sketch.colorFull, 1);
			drawPatternPencil(ctx, point, previousPoint, sketch, pattern, 0.25 * r);

			pattern = crayonPencilGetPattern(sketch.colorFull, 2);
			drawPatternPencil(ctx, point, previousPoint, sketch, pattern, 0.15 * r);
		}
	};
 }
