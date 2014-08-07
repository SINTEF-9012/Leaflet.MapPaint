module MapPaint {
	var _stripesPencilPattern: CanvasPattern,
		_stripesPencilColor: string,
		_stripesPencilGetPattern = (color: string) => {
			if (_stripesPencilPattern && _stripesPencilColor === color) {
				return _stripesPencilPattern;
			}

			_stripesPencilColor = color;

			var patternCanvas = document.createElement('canvas'),
				dotWidth = 20,
				dotDistance = 5,
				ctx = patternCanvas.getContext('2d');

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

	export var StripesPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {

			var sdx = previousPoint.x - point.x,
				sdy = previousPoint.y - point.y,
				speed = Math.sqrt(sdx * sdx + sdy * sdy);

			var xa = 0,
				ya = 30,
				xb = 75,
				yb = 120;

			var w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));

			ctx.beginPath();
			ctx.strokeStyle = _stripesPencilGetPattern(sketch.colorFull);
			ctx.lineWidth = w; //30;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			ctx.moveTo(previousPoint.x, previousPoint.y);
			//ctx.lineTo(point.x, point.y);
			ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);

			ctx.stroke();
		},

	}
}
