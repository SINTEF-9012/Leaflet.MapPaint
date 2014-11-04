module MapPaint {

	var circlesPencilPattern: CanvasPattern,
		circlesPencilColor: string,
		circlesPencilGetPattern = (color: string) => {
			if (circlesPencilPattern && circlesPencilColor === color) {
				return circlesPencilPattern;
			}

			circlesPencilColor = color;

			var patternCanvas = document.createElement('canvas'),
				ctx: CanvasRenderingContext2D = patternCanvas.getContext('2d'),
				doublePI = Math.PI * 2,
				radius = 4,
				size = 20;

			patternCanvas.width = patternCanvas.height = size;
			ctx.fillStyle = color;
			ctx.beginPath();

			ctx.beginPath();
			ctx.arc(0, 0, radius, 0, doublePI);
			ctx.fill();

			ctx.beginPath();
			ctx.arc(0, size, radius, 0, doublePI);
			ctx.fill();

			ctx.beginPath();
			ctx.arc(size, size, radius, 0, doublePI);
			ctx.fill();

			ctx.beginPath();
			ctx.arc(size, 0, radius, 0, doublePI);
			ctx.fill();

			ctx.beginPath();
			ctx.arc(size/2, size/2, radius+1, 0, doublePI);
			ctx.fill();

			//ctx.closePath();
			//ctx.fill();
			return circlesPencilPattern = ctx.createPattern(patternCanvas, 'repeat');
		};

	export var CirclesPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {
			var pattern = circlesPencilGetPattern(sketch.colorFull);
			drawPatternPencil(ctx, point, previousPoint, sketch, pattern);
		}
	}
} 
