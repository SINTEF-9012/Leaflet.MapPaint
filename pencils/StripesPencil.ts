module MapPaint {
	var _stripesPencilPattern: CanvasPattern,
		_stripesPencilColor: string,
		_stripesPencilGetPattern = (color: string) => {
			if (_stripesPencilPattern && _stripesPencilColor === color) {
				return _stripesPencilPattern;
			}

			_stripesPencilColor = color;

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
			return _stripesPencilPattern = ctx.createPattern(patternCanvas, 'repeat');
	};

	var _circlesPencilPattern: CanvasPattern,
		_circlesPencilColor: string,
		_circlesPencilGetPattern = (color: string) => {
			if (_circlesPencilPattern && _circlesPencilColor === color) {
				return _circlesPencilPattern;
			}

			_circlesPencilColor = color;

			var patternCanvas = document.createElement('canvas'),
				ctx: CanvasRenderingContext2D = patternCanvas.getContext('2d'),
				doublePI = Math.PI * 2,
				radius = 4,
				size = 12;

			patternCanvas.width = patternCanvas.height = size;
			ctx.fillStyle = color;
			ctx.beginPath();

			//ctx.arc(0, 0, radius, 0, doublePI);
			//ctx.arc(0, size, radius, 0, doublePI);
			//ctx.arc(size, size, radius, 0, doublePI);
			//ctx.arc(size, 0, radius, 0, doublePI);
			ctx.arc(size/2, size/2, radius, 0, doublePI);

			ctx.closePath();
			ctx.fill();
			return _circlesPencilPattern = ctx.createPattern(patternCanvas, 'repeat');
	};

	export var StripesPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy, circle?: boolean) => {

			var sdx = previousPoint.x - point.x,
				sdy = previousPoint.y - point.y,
				speed = Math.sqrt(sdx * sdx + sdy * sdy);

			var xa = 0,
				ya = 26,
				xb = 80,
				yb = 60;

			var w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));

			ctx.beginPath();
			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);
			ctx.closePath();

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
			ctx.strokeStyle = circle ? _circlesPencilGetPattern(sketch.colorFull) : _stripesPencilGetPattern(sketch.colorFull);
			ctx.lineWidth = w;

			ctx.globalCompositeOperation = tmpGlobalCompositeOperation;

			ctx.stroke();
		},

	}

	// Bonus
	export var CirclesPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {
			(<any>StripesPencil).draw(ctx, point, previousPoint, sketch, true);
		}
	}
}
