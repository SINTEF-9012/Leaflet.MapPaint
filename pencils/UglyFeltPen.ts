module MapPaint {
	export var UglyFeltPen: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {

			ctx.beginPath();
			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);
			//ctx.closePath();

			ctx.strokeStyle = sketch.color;
			ctx.lineWidth = 10; 
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			ctx.stroke();

			ctx.lineWidth = 8; 
			ctx.strokeStyle = sketch.colorFull;

			ctx.stroke();
		}
	};
}
