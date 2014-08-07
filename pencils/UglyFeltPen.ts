module MapPaint {
	export var UglyFeltPen: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {
			ctx.beginPath();
			ctx.strokeStyle = sketch.color;
			ctx.lineWidth = 16; 
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.lineTo(point.x, point.y);

			ctx.stroke();

			ctx.lineWidth = 14; 
			ctx.strokeStyle = sketch.colorFull;

			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.lineTo(point.x, point.y);

			ctx.closePath();
			ctx.stroke();
		}
	};
}
