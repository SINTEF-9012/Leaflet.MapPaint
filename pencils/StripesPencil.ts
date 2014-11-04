module MapPaint {

	export var drawPatternPencil = (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy, pattern: CanvasPattern, widthRatio: number = 1.0) => {
			var sdx = previousPoint.x - point.x,
				sdy = previousPoint.y - point.y,
				speed = Math.sqrt(sdx * sdx + sdy * sdy);

			var xa = 0,
				ya = 26,
				xb = 80,
				yb = 60;

			var w = widthRatio * Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));

			ctx.beginPath();
			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);
			//ctx.closePath();

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			// Remove the eventual previous pattern
			// It improves the smoothing of the shapes
			var tmpGlobalCompositeOperation = ctx.globalCompositeOperation;
			ctx.globalCompositeOperation = 'destination-out';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = w - 1;

			ctx.stroke();

			// Stroke using a pattern
			ctx.strokeStyle = pattern;
			ctx.lineWidth = w;

			ctx.globalCompositeOperation = tmpGlobalCompositeOperation;

			ctx.stroke();
	}

	var stripesPencilPattern: CanvasPattern,
		stripesPencilColor: string,
		stripesPencilGetPattern = (color: string) => {
			if (stripesPencilPattern && stripesPencilColor === color) {
				return stripesPencilPattern;
			}

			stripesPencilColor = color;

			var patternCanvas = document.createElement('canvas'),
				ctx: CanvasRenderingContext2D = patternCanvas.getContext('2d');

			patternCanvas.width = patternCanvas.height = 12;
			ctx.strokeStyle = color;
			ctx.lineWidth = 4;
			ctx.beginPath();

			ctx.moveTo(-6, 6);
			ctx.lineTo(6, -6);

			ctx.moveTo(-6, 18);
			ctx.lineTo(18, -6);

			ctx.moveTo(6, 18);
			ctx.lineTo(18, 6);

			ctx.closePath();
			ctx.stroke();
			return stripesPencilPattern = ctx.createPattern(patternCanvas, 'repeat');
	};

	export var StripesPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {
			var pattern = stripesPencilGetPattern(sketch.colorFull);
			drawPatternPencil(ctx, point, previousPoint, sketch, pattern);
		}
	}
}
