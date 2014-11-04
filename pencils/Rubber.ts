/// <reference path="uglyfeltpen.ts" />
 module MapPaint {
	export var Rubber: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {

			var sdx = previousPoint.x - point.x,
				sdy = previousPoint.y - point.y,
				speed = Math.sqrt(sdx * sdx + sdy * sdy);

			var xa = 0,
				ya = 26,
				xb = 80,
				yb = 120;

			var w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));
			ctx.globalCompositeOperation = 'destination-out';

			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.lineWidth = w; 
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);

			//ctx.closePath();
			ctx.stroke();
		}
	};
 }
