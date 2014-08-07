module MapPaint {
	export var ProceduralPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy, maxAngle?: number) => {
			var sdx = previousPoint.x - point.x,
				sdy = previousPoint.y - point.y,
				speed = sdx * sdx + sdy * sdy;

			/*var w = 1;

			if (!this.retina) {
				var xa = 0,
					ya = 1,
					xb = 255,
					yb = 3;

				w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));
			}

			ctx.lineWidth = w;/

			/*if (w > 1) {
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.strokeStyle = this.colorFull;
			} else {
				ctx.strokeStyle = this.color;
			}*/

			ctx.beginPath();
			ctx.strokeStyle = sketch.color;
			ctx.lineWidth = 1;
			ctx.lineCap = 'butt';
			ctx.lineJoin = 'miter';

			ctx.moveTo(previousPoint.x, previousPoint.y);
			ctx.lineTo(point.x, point.y);

			// It was a bad idea :-)
			/*for (var ii = 0, ll = Math.round(Math.random() * 2) + 2; ii < ll; ++ii) {
				var randomX = Math.random() * 2 - 1,
					randomY = Math.random() * 2 - 1;
				ctx.moveTo(previousPoint.x + randomX, previousPoint.y + randomY);
				ctx.lineTo(point.x + randomY, point.y + randomY);
			}*/

			ctx.stroke();
			//ctx.lineCap = 'round';
			//ctx.lineJoin = 'round';

			ctx.strokeStyle = sketch.colorAlternative;

			if (maxAngle) {
				var angleCst = Math.atan2(previousPoint.x - point.x, previousPoint.y - point.y);
				var doublePI = Math.PI + Math.PI,
					limitAngleMax = doublePI - maxAngle,
					limitAngleMin = maxAngle;
			}

			if (speed < (sketch.retina > 1.0 ? 2200 : 800)) {
				var points = sketch.FetchPointsArround(point);

				var lines = [];
				ctx.beginPath();
				ctx.strokeStyle = sketch.modeFiller ? sketch.colorAlternative : sketch.colorDark;
				ctx.lineWidth = 2;

				for (var i = 0, l = points.length; i < l; ++i) {
					var px = points[i].x,
						py = points[i].y,
						dx = px - point.x,
						dy = py - point.y,
						d = dx * dx + dy * dy;

					if (d < 2684) {

						if (maxAngle) {
							var angle = Math.atan2(px - point.x, py - point.y) - angleCst;
							if (angle < 0) {
								angle += doublePI;
							} else if (angle > doublePI) {
								angle -= doublePI;
							}
						}
						if ((!maxAngle || (angle > limitAngleMax || angle < limitAngleMin)) && Math.random() > d / 1342) {
							lines.push(points[i]);

							if (sketch.modeFiller || Math.random() > 0.3) {
								var rl = 0.2 + Math.random() * 0.14,
									mx = dx * rl,
									my = dy * rl;
								ctx.moveTo(point.x + mx, point.y + my);
								ctx.lineTo(px - mx, py - my);
							}
						}

					}
				}

				//ctx.closePath();
				ctx.stroke();

				ctx.beginPath();
				ctx.strokeStyle = sketch.modeFiller ? sketch.colorDark : sketch.colorAlternative;
				ctx.lineWidth = 1;

				for (i = 0, l = lines.length; i < l; ++i) {
					if (!sketch.modeFiller || Math.random() > 0.3) {
						px = lines[i].x;
						py = lines[i].y;
						dx = px - point.x;
						dy = py - point.y;
						rl = 0.2 + Math.random() * 0.14;
						mx = dx * rl;
						my = dy * rl;
						ctx.moveTo(point.x + mx, point.y + my);
						ctx.lineTo(px - mx, py - my);
					}
				}

				//ctx.closePath();
				ctx.stroke();
			}
		}
	}

	export var RestrainedProceduralPencil: Pencil = {
		draw: (ctx: CanvasRenderingContext2D, point: PaintPoint, previousPoint: PaintPoint, sketch: Sketchy) => {
			(<any>ProceduralPencil).draw(ctx, point, previousPoint, sketch, 0.2);
		}
	}
}
