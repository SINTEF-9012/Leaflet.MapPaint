var MapPaint;
(function (MapPaint) {
    var SimplePartitionGrid = (function () {
        function SimplePartitionGrid(size, margin) {
            this.size = size;
            this.margin = margin;
            this._grid = {};
        }
        SimplePartitionGrid.prototype.Add = function (point) {
            var posX = Math.floor(point.x / this.size), posY = Math.floor(point.y / this.size), key = posX + "-" + posY;

            if (this._grid.hasOwnProperty(key)) {
                this._grid[key].push(point);
            } else {
                this._grid[key] = [point];
            }
        };

        SimplePartitionGrid.prototype.ApplyRemove = function () {
            for (var key in this._grid) {
                var cell = this._grid[key], newt = [], change = false;

                for (var i = 0, l = cell.length; i < l; ++i) {
                    if (!cell[i].remove) {
                        newt.push(i);
                    } else {
                        change = true;
                    }
                }

                if (change) {
                    this._grid[key] = newt;
                }
            }
        };

        SimplePartitionGrid.prototype._ConcatWithKey = function (points, key) {
            if (this._grid.hasOwnProperty(key)) {
                return points.concat(this._grid[key]);
            }
            return points;
        };

        SimplePartitionGrid.prototype.FetchArround = function (point) {
            var posX = Math.floor(point.x / this.size), posY = Math.floor(point.y / this.size), startX = posX * this.size, startY = posY * this.size, key = posX + "-" + posY, points = this._grid.hasOwnProperty(key) ? this._grid[key].slice() : [];

            if (point.x - startX < this.margin) {
                points = this._ConcatWithKey(points, (posX - 1) + "-" + posY);
            }

            if (point.y - startY < this.margin) {
                points = this._ConcatWithKey(points, posX + "-" + (posY - 1));
            }

            var upperMargin = this.size - this.margin;
            if (point.x - startX > upperMargin) {
                points = this._ConcatWithKey(points, (posX + 1) + "-" + posY);
            }

            if (point.y - startY > upperMargin) {
                points = this._ConcatWithKey(points, posX + "-" + (posY + 1));
            }

            return points;
        };

        SimplePartitionGrid.prototype.Clear = function () {
            this._grid = {};
        };
        return SimplePartitionGrid;
    })();

    var Sketchy = (function () {
        function Sketchy(context) {
            this.points = new SimplePartitionGrid(128, 80);
            this.context = context;
            this.previousPoints = {};
            this.eraser = false;

            this.SetColor(0, 0, 0);
        }
        Sketchy.prototype.SetColor = function (r, g, b) {
            var c = 'rgba(' + r + ',' + g + ',' + b;
            this.color = c + ',0.4)';
            this.colorFull = c + ',0.9)';
            this.colorAlternative = c + ',0.16)';
            this.colorDark = 'rgba(' + Math.round(Math.max(0, r * 0.65 - 10)) + ',' + Math.round(Math.max(0, g * 0.65 - 10)) + ',' + Math.round(Math.max(0, b * 0.65 - 10)) + ',0.07)';
            this.points.Clear();
        };

        Sketchy.prototype.EnableEraser = function () {
            this.eraser = true;
            this.points.Clear();
        };

        Sketchy.prototype.DisableEraser = function () {
            this.eraser = false;
        };

        Sketchy.prototype.Start = function (input, point) {
            this.previousPoints[input] = point;

            if (!this.eraser) {
                this.points.Add(point);
            }
        };

        Sketchy.prototype.Stroke = function (input, point) {
            var ctx = this.context, previousPoint = this.previousPoints[input];

            var sdx = previousPoint.x - point.x, sdy = previousPoint.y - point.y, speed = sdx * sdx + sdy * sdy;

            if (!this.eraser) {
                ctx.globalCompositeOperation = 'source-over';

                var xa = 1, ya = 1, xb = 255, yb = 3;

                var w = ya + Math.min(speed, xb) * ((yb - ya) / xb);
                ctx.lineWidth = Math.round(w);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.strokeStyle = w > 2 ? this.colorFull : this.color;

                //ctx.lineWidth = 1;
                ctx.moveTo(previousPoint.x, previousPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
                ctx.lineCap = 'butt';
                ctx.lineJoin = 'miter';

                ctx.strokeStyle = this.colorAlternative;
            } else {
                ctx.globalCompositeOperation = 'destination-out';

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0,0,0,0.6)';
                ctx.lineWidth = 10;
                ctx.lineCap = 'round';

                ctx.moveTo(previousPoint.x, previousPoint.y);
                ctx.lineTo(point.x, point.y);

                ctx.stroke();
                ctx.lineCap = 'butt';
            }

            if (speed < 500) {
                var points = this.points.FetchArround(point);

                var lines = [];
                ctx.beginPath();

                //if (!this.eraser) {
                ctx.strokeStyle = this.colorDark;

                //}
                ctx.lineWidth = 2;

                for (var i = 0, l = points.length; i < l; ++i) {
                    var px = points[i].x, py = points[i].y, dx = px - point.x, dy = py - point.y, d = dx * dx + dy * dy;

                    if (d < 3000) {
                        /*if (this.eraser) {
                        points[i].remove = true;
                        }*/
                        if (Math.random() > d / 1500) {
                            lines.push(points[i]);

                            if (Math.random() > 0.1) {
                                var rl = 0.2 + Math.random() * 0.14, mx = dx * rl, my = dy * rl;
                                ctx.moveTo(point.x + mx, point.y + my);
                                ctx.lineTo(px - mx, py - my);
                            }
                        }
                    }
                }

                ctx.stroke();

                ctx.beginPath();
                if (!this.eraser) {
                    ctx.strokeStyle = this.colorAlternative;
                }
                ctx.lineWidth = 1;

                for (i = 0, l = lines.length; i < l; ++i) {
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

                ctx.stroke();
            }

            this.previousPoints[input] = point;

            //if (!this.eraser) {
            this.points.Add(point);
            //}
        };

        Sketchy.prototype.Stop = function (input) {
            delete this.previousPoints[input];
            if (this.eraser) {
                this.points.ApplyRemove();
            }
        };
        return Sketchy;
    })();
    MapPaint.Sketchy = Sketchy;
})(MapPaint || (MapPaint = {}));

function enhanceContext(canvas, context) {
    var ratio = window.devicePixelRatio || 1, width = canvas.width, height = canvas.height;

    if (ratio > 1) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        context.scale(ratio, ratio);
    }
}

var canvas = document.getElementById('canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var ctx = canvas.getContext('2d');

enhanceContext(canvas, ctx);

var pencil = new MapPaint.Sketchy(ctx);

var mousemove = function (e) {
    pencil.Stroke('mouse', { x: e.clientX, y: e.clientY });
};

canvas.addEventListener('mousedown', function (e) {
    pencil.Start('mouse', { x: e.clientX, y: e.clientY });

    canvas.addEventListener('mousemove', mousemove);

    e.preventDefault();
});

canvas.addEventListener('mouseup', function (e) {
    pencil.Stop('mouse');

    canvas.removeEventListener('mousemove', mousemove);
});

var touchmove = function (e) {
    for (var i = 0, l = e.touches.length; i < l; ++i) {
        var t = e.touches[i];
        pencil.Stroke("touch" + t.identifier, { x: t.clientX, y: t.clientY });
    }
};

canvas.addEventListener('touchstart', function (e) {
    for (var i = 0, l = e.touches.length; i < l; ++i) {
        var t = e.touches[i];
        pencil.Start("touch" + t.identifier, { x: t.clientX, y: t.clientY });
    }

    canvas.addEventListener('touchmove', touchmove);

    e.preventDefault();
});

var touchend = function (e) {
    for (var i = 0, l = e.touches.length; i < l; ++i) {
        var t = e.touches[i];
        pencil.Stop("touch" + t.identifier);
    }

    canvas.removeEventListener('touchmove', touchmove);
};

canvas.addEventListener('touchend', touchend);
canvas.addEventListener('touchcancel', touchend);
//# sourceMappingURL=app.js.map
