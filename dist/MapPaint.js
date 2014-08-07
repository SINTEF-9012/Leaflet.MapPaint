var MapPaint;
(function (MapPaint) {
    MapPaint.ColorControl = L.Control.extend({
        options: {
            position: 'topright',
            colors: [
                { r: 0, g: 0, b: 0 },
                { r: 255, g: 255, b: 255 },
                { r: 229, g: 28, b: 35 },
                { r: 156, g: 39, b: 176 },
                { r: 63, g: 81, b: 181 },
                { r: 3, g: 169, b: 244 },
                { r: 0, g: 150, b: 136 },
                { r: 10, g: 126, b: 7 },
                { r: 205, g: 220, b: 57 },
                { r: 255, g: 193, b: 7 },
                { r: 255, g: 87, b: 34 },
                { r: 121, g: 85, b: 72 },
                { r: 96, g: 125, b: 139 }
            ]
        },
        onAdd: function () {
            var _this = this;
            var container = L.DomUtil.create('div', 'mappaint-control');

            var eraserMode = false, fillerMode = false;

            this.options.colors.forEach(function (color) {
                var c = L.DomUtil.create('div', 'mappaint-color');
                c.style.background = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
                container.appendChild(c);
                c.onclick = function () {
                    if (eraserMode) {
                        _this.pencil.DisableEraser();
                        eraserMode = false;
                    }

                    if (previousC) {
                        previousC.classList.remove('selected');
                    }

                    c.classList.add('selected');
                    _this.pencil.SetColor(color.r, color.g, color.b);

                    previousC = c;
                    return false;
                };
            });

            var previousC = container.firstChild;
            previousC.onclick(null);

            var eraser = L.DomUtil.create('div', 'mappaint-eraser');

            eraser.onclick = function () {
                _this.pencil.EnableEraser();
                eraserMode = true;
                if (previousC) {
                    previousC.classList.remove('selected');
                }
                eraser.classList.add('selected');
                previousC = eraser;

                return false;
            };

            container.appendChild(eraser);

            var filler = L.DomUtil.create('div', 'mappaint-filler');

            filler.onclick = function () {
                fillerMode = !fillerMode;
                if (fillerMode) {
                    _this.pencil.EnableFiller();
                    filler.classList.add('enabled');
                } else {
                    _this.pencil.DisableFiller();
                    filler.classList.remove('enabled');
                }

                return false;
            };

            container.appendChild(filler);

            return container;
        }
    });

    MapPaint.SaveControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-mappaint');

            return container;
        }
    });
})(MapPaint || (MapPaint = {}));
L.MapPaint = L.Handler.extend({
    includes: L.Mixin.Events,
    addHooks: function () {
        var canvas = this._canvas = document.createElement('canvas');

        var container = this._map._container;

        canvas.height = container.offsetHeight;
        canvas.width = container.offsetWidth;

        container.appendChild(canvas);

        this.disableMapInteractions();

        this._context = canvas.getContext('2d');

        this.pencil = new MapPaint.Sketchy(this._context);

        this.pencil.retina = this._enhanceContext(this._context);

        this.colorControl = new MapPaint.ColorControl();
        this.colorControl.pencil = this.pencil;
        this._map.addControl(this.colorControl);

        this.saveControl = new MapPaint.SaveControl();
        this.saveControl.pencil = this.pencil;
        this._map.addControl(this.saveControl);

        L.DomEvent.addListener(canvas, 'mousedown', this._onMouseDown, this);
        L.DomEvent.addListener(canvas, 'mouseup', this._onMouseUp, this);
        L.DomEvent.addListener(canvas, 'mouseout', this._onMouseUp, this);

        L.DomEvent.addListener(canvas, 'touchstart', this._onTouchStart, this);
        L.DomEvent.addListener(canvas, 'touchend', this._onTouchEnd, this);
        L.DomEvent.addListener(canvas, 'touchcancel', this._onTouchEnd, this);

        this._map.on('resize', this._onResize, this);
    },
    _onMouseDown: function (e) {
        this.pencil.Start('mouse', { x: e.clientX, y: e.clientY });

        L.DomEvent.addListener(this._canvas, 'mousemove', this._onMouseMove, this);

        e.preventDefault();
    },
    _onMouseMove: function (e) {
        this.pencil.Stroke('mouse', { x: e.clientX, y: e.clientY });

        e.preventDefault();
    },
    _onMouseUp: function () {
        this.pencil.Stop('mouse');
        L.DomEvent.removeListener(this._canvas, 'mousemove', this._onMouseMove, this);
    },
    _onTouchStart: function (e) {
        console.log('LAPPPIN');

        for (var i = 0, l = e.touches.length; i < l; ++i) {
            var t = e.touches[i];
            console.log(t.clientX, t.clientY);
            this.pencil.Start("touch" + t.identifier, { x: t.clientX, y: t.clientY });
        }

        L.DomEvent.addListener(this._canvas, 'touchmove', this._onTouchMove, this);

        e.preventDefault();
    },
    _onTouchMove: function (e) {
        for (var i = 0, l = e.touches.length; i < l; ++i) {
            var t = e.touches[i];
            this.pencil.Stroke("touch" + t.identifier, { x: t.clientX, y: t.clientY });
        }

        e.preventDefault();
    },
    _onTouchEnd: function (e) {
        for (var i = 0, l = e.touches.length; i < l; ++i) {
            var t = e.touches[i];
            this.pencil.Stop("touch" + t.identifier);
        }

        L.DomEvent.removeListener(this._canvas, 'touchmove', this._onTouchMove);
    },
    disableMapInteractions: function () {
        var map = this._map;

        this._interactionsStates = {
            dragging: map.dragging.enabled(),
            touchZoom: map.touchZoom.enabled(),
            doubleClickZoom: map.doubleClickZoom.enabled(),
            scrollWheelZoom: map.scrollWheelZoom.enabled(),
            boxZoom: map.boxZoom.enabled(),
            keyboard: map.keyboard.enabled(),
            tap: map.tap && map.tap.enabled()
        };

        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        map.tap && map.tap.disable();
    },
    restoreMapInteractions: function () {
        var map = this._map, interactions = this._interactionsStates;

        if (interactions.dragging) {
            map.dragging.enable();
        }

        if (interactions.touchZoom) {
            map.touchZoom.enable();
        }

        if (interactions.doubleClickZoom) {
            map.doubleClickZoom.enable();
        }

        if (interactions.scrollWheelZoom) {
            map.scrollWheelZoom.enable();
        }

        if (interactions.boxZoom) {
            map.boxZoom.enable();
        }

        if (interactions.keyboard) {
            map.keyboard.enable();
        }

        if (interactions.tap) {
            map.tap.enable();
        }
    },
    _enhanceContext: function () {
        var canvas = this._canvas;
        var ratio = window.devicePixelRatio || 1, width = canvas.width, height = canvas.height;

        if (ratio > 1) {
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            this._context.scale(ratio, ratio);
            return ratio;
        }
        return 1.0;
    },
    _onResize: function (e) {
        var canvas = this._canvas, ctx = this._context, imageData = ctx.getImageData(0, 0, canvas.width, canvas.height), container = this._map._container;

        canvas.height = container.offsetHeight;
        canvas.width = container.offsetWidth;

        this._enhanceContext();
        this.pencil.ClearDatagrid();

        var center = e.newSize.subtract(e.oldSize).multiplyBy(0.5);

        ctx.putImageData(imageData, center.x, center.y);
    }
});

L.Map.addInitHook('addHandler', 'MapPaint', L.MapPaint);
var MapPaint;
(function (MapPaint) {
    var SimplePartitionGrid = (function () {
        function SimplePartitionGrid(size, margin) {
            this.size = size;
            this.margin = margin;
            this._grid = {};
            this._modifiedAreas = {};
        }
        SimplePartitionGrid.prototype.Add = function (point) {
            var posX = Math.floor(point.x / this.size), posY = Math.floor(point.y / this.size), key = posX + "-" + posY;

            if (this._grid.hasOwnProperty(key)) {
                this._grid[key].push(point);
            } else {
                this._grid[key] = [point];
                this._modifiedAreas[key] = true;
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

        SimplePartitionGrid.prototype.ClearModifiedAreas = function () {
            this._modifiedAreas = {};
        };

        SimplePartitionGrid.prototype.GetModifiedAreas = function () {
            return this._modifiedAreas;
        };

        SimplePartitionGrid.prototype.GetGridSize = function () {
            return this.size;
        };
        return SimplePartitionGrid;
    })();
    MapPaint.SimplePartitionGrid = SimplePartitionGrid;
})(MapPaint || (MapPaint = {}));
var MapPaint;
(function (MapPaint) {
    var Sketchy = (function () {
        function Sketchy(context) {
            this.dataGrid = new MapPaint.SimplePartitionGrid(128, 80);
            this.context = context;
            this.previousPoints = {};
            this.tapOrClick = {};
            this.eraser = false;
            this.retina = 1.0;

            this.modeFiller = false;

            this.SetColor(0, 0, 0);

            this.pencil = MapPaint.ProceduralPencil;
        }
        Sketchy.prototype.SetColor = function (r, g, b) {
            var c = 'rgba(' + r + ',' + g + ',' + b;
            this.color = c + ',0.45)';
            this.colorFull = c + ',1.0)';
            this.colorAlternative = c + ',0.16)';
            this.colorDark = 'rgba(' + Math.round(Math.max(0, r * 0.65 - 10)) + ',' + Math.round(Math.max(0, g * 0.65 - 10)) + ',' + Math.round(Math.max(0, b * 0.65 - 10)) + ',0.07)';
            this.dataGrid.Clear();
        };

        Sketchy.prototype.EnableFiller = function () {
            this.modeFiller = true;
            this.dataGrid.Clear();
        };

        Sketchy.prototype.DisableFiller = function () {
            this.modeFiller = false;
            this.dataGrid.Clear();
        };

        Sketchy.prototype.EnableEraser = function () {
            this.eraser = true;
            this.dataGrid.Clear();
        };

        Sketchy.prototype.DisableEraser = function () {
            this.eraser = false;
            this.dataGrid.Clear();
        };

        Sketchy.prototype.Start = function (input, point) {
            this.previousPoints[input] = point;
            this.tapOrClick[input] = true;

            this.dataGrid.Add(point);
        };

        Sketchy.prototype.Stroke = function (input, point) {
            this.tapOrClick[input] = false;

            var ctx = this.context, previousPoint = this.previousPoints[input];

            ctx.globalCompositeOperation = this.modeFiller ? 'destination-over' : 'source-over';

            if (this.eraser) {
                MapPaint.Rubber.draw(ctx, point, previousPoint, this);
            } else {
                this.pencil.draw(ctx, point, previousPoint, this);
            }

            this.previousPoints[input] = point;

            this.dataGrid.Add(point);

            if (this.retina > 1.0) {
                var middlePoint = {
                    x: (point.x + previousPoint.x) / 2,
                    y: (point.y + previousPoint.y) / 2
                };

                this.dataGrid.Add(middlePoint);
            }
        };

        Sketchy.prototype.Stop = function (input) {
            if (this.tapOrClick[input]) {
                var previousPoint = this.previousPoints[input], point = {
                    x: previousPoint.x + 1,
                    y: previousPoint.y + 1
                };
                this.Stroke(input, point);
            }
            delete this.previousPoints[input];
            if (this.eraser) {
                this.dataGrid.ApplyRemove();
            }
        };

        Sketchy.prototype.Clear = function () {
            this.context.canvas.width = this.context.canvas.width;
            this.context.scale(this.retina, this.retina);
            this.dataGrid.Clear();
            this.dataGrid.ClearModifiedAreas();
        };

        Sketchy.prototype.ClearDatagrid = function () {
            this.dataGrid.Clear();
        };

        Sketchy.prototype.FetchPointsArround = function (point) {
            return this.dataGrid.FetchArround(point);
        };
        return Sketchy;
    })();
    MapPaint.Sketchy = Sketchy;
})(MapPaint || (MapPaint = {}));
var MapPaint;
(function (MapPaint) {
    MapPaint.ProceduralPencil = {
        draw: function (ctx, point, previousPoint, sketch, maxAngle) {
            var sdx = previousPoint.x - point.x, sdy = previousPoint.y - point.y, speed = sdx * sdx + sdy * sdy;

            ctx.beginPath();
            ctx.strokeStyle = sketch.color;
            ctx.lineWidth = 1;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';

            ctx.moveTo(previousPoint.x, previousPoint.y);
            ctx.lineTo(point.x, point.y);

            ctx.stroke();

            ctx.strokeStyle = sketch.colorAlternative;

            if (maxAngle) {
                var angleCst = Math.atan2(previousPoint.x - point.x, previousPoint.y - point.y);
                var doublePI = Math.PI + Math.PI, limitAngleMax = doublePI - maxAngle, limitAngleMin = maxAngle;
            }

            if (speed < (sketch.retina > 1.0 ? 2200 : 800)) {
                var points = sketch.FetchPointsArround(point);

                var lines = [];
                ctx.beginPath();
                ctx.strokeStyle = sketch.modeFiller ? sketch.colorAlternative : sketch.colorDark;
                ctx.lineWidth = 2;

                for (var i = 0, l = points.length; i < l; ++i) {
                    var px = points[i].x, py = points[i].y, dx = px - point.x, dy = py - point.y, d = dx * dx + dy * dy;

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
                                var rl = 0.2 + Math.random() * 0.14, mx = dx * rl, my = dy * rl;
                                ctx.moveTo(point.x + mx, point.y + my);
                                ctx.lineTo(px - mx, py - my);
                            }
                        }
                    }
                }

                ctx.closePath();
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

                ctx.closePath();
                ctx.stroke();
            }
        }
    };

    MapPaint.RestrainedProceduralPencil = {
        draw: function (ctx, point, previousPoint, sketch) {
            MapPaint.ProceduralPencil.draw(ctx, point, previousPoint, sketch, 0.2);
        }
    };
})(MapPaint || (MapPaint = {}));
var MapPaint;
(function (MapPaint) {
    MapPaint.Rubber = {
        draw: function (ctx, point, previousPoint, sketch) {
            var sdx = previousPoint.x - point.x, sdy = previousPoint.y - point.y, speed = Math.sqrt(sdx * sdx + sdy * sdy);

            var xa = 0, ya = 26, xb = 80, yb = 120;

            var w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));
            ctx.globalCompositeOperation = 'destination-out';

            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = w;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(previousPoint.x, previousPoint.y);
            ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);

            ctx.closePath();
            ctx.stroke();
        }
    };
})(MapPaint || (MapPaint = {}));
var MapPaint;
(function (MapPaint) {
    var _stripesPencilPattern, _stripesPencilColor, _stripesPencilGetPattern = function (color) {
        if (_stripesPencilPattern && _stripesPencilColor === color) {
            return _stripesPencilPattern;
        }

        _stripesPencilColor = color;

        var patternCanvas = document.createElement('canvas'), ctx = patternCanvas.getContext('2d');

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

    var _circlesPencilPattern, _circlesPencilColor, _circlesPencilGetPattern = function (color) {
        if (_circlesPencilPattern && _circlesPencilColor === color) {
            return _circlesPencilPattern;
        }

        _circlesPencilColor = color;

        var patternCanvas = document.createElement('canvas'), ctx = patternCanvas.getContext('2d'), doublePI = Math.PI * 2, radius = 4, size = 12;

        patternCanvas.width = patternCanvas.height = size;
        ctx.fillStyle = color;
        ctx.beginPath();

        ctx.arc(size / 2, size / 2, radius, 0, doublePI);

        ctx.closePath();
        ctx.fill();
        return _circlesPencilPattern = ctx.createPattern(patternCanvas, 'repeat');
    };

    MapPaint.StripesPencil = {
        draw: function (ctx, point, previousPoint, sketch, circle) {
            var sdx = previousPoint.x - point.x, sdy = previousPoint.y - point.y, speed = Math.sqrt(sdx * sdx + sdy * sdy);

            var xa = 0, ya = 26, xb = 80, yb = 60;

            var w = Math.floor(ya + (Math.min(speed, xb) - xa) * ((yb - ya) / (xb - xa)));

            ctx.beginPath();
            ctx.moveTo(previousPoint.x, previousPoint.y);
            ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);
            ctx.closePath();

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            var tmpGlobalCompositeOperation = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = w - 1;

            ctx.stroke();

            ctx.strokeStyle = circle ? _circlesPencilGetPattern(sketch.colorFull) : _stripesPencilGetPattern(sketch.colorFull);
            ctx.lineWidth = w;

            ctx.globalCompositeOperation = tmpGlobalCompositeOperation;

            ctx.stroke();
        }
    };

    MapPaint.CirclesPencil = {
        draw: function (ctx, point, previousPoint, sketch) {
            MapPaint.StripesPencil.draw(ctx, point, previousPoint, sketch, true);
        }
    };
})(MapPaint || (MapPaint = {}));
var MapPaint;
(function (MapPaint) {
    MapPaint.UglyFeltPen = {
        draw: function (ctx, point, previousPoint, sketch) {
            ctx.beginPath();
            ctx.moveTo(previousPoint.x, previousPoint.y);
            ctx.quadraticCurveTo((previousPoint.x + point.x) * 0.5, (previousPoint.y + point.y) * 0.5, point.x, point.y);
            ctx.closePath();

            ctx.strokeStyle = sketch.color;
            ctx.lineWidth = 16;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.stroke();

            ctx.lineWidth = 14;
            ctx.strokeStyle = sketch.colorFull;

            ctx.stroke();
        }
    };
})(MapPaint || (MapPaint = {}));
var MapPaint;
(function (MapPaint) {
    var Save = (function () {
        function Save(context, size, retina) {
            this.context = context;
            this.size = size;
            this.retina = retina;
        }
        Save.prototype.MergeModifiedAreas = function (modifiedAreas) {
            var areas = {};

            var key;

            for (key in modifiedAreas) {
                areas[key] = null;
            }

            for (key in areas) {
                if (areas[key] === null) {
                    var p = key.split('-'), x = parseInt(p[0]), y = parseInt(p[1]);

                    var bounds = {
                        xMin: x,
                        xMax: x + 1,
                        yMin: y,
                        yMax: y + 1
                    };

                    Save._RecursiveMadness(areas, x, y, bounds);
                }
            }

            var newAreas = [];

            for (key in areas) {
                var area = areas[key];
                if (!area._lapin) {
                    newAreas.push(area);
                    area._lapin = true;
                    area.xMin *= this.size;
                    area.xMax *= this.size;
                    area.yMin *= this.size;
                    area.yMax *= this.size;
                }
            }

            return newAreas;
        };

        Save._RecursiveMadness = function (areas, x, y, bounds) {
            var key = x + '-' + y;

            if (areas.hasOwnProperty(key) && areas[key] === null) {
                bounds.xMin = Math.min(x, bounds.xMin);
                bounds.xMax = Math.max(x + 1, bounds.xMax);
                bounds.yMin = Math.min(y, bounds.yMin);
                bounds.yMax = Math.max(y + 1, bounds.yMax);

                areas[key] = bounds;

                this._RecursiveMadness(areas, x - 1, y, bounds);
                this._RecursiveMadness(areas, x, y - 1, bounds);
                this._RecursiveMadness(areas, x + 1, y, bounds);
                this._RecursiveMadness(areas, x, y + 1, bounds);
                this._RecursiveMadness(areas, x - 1, y - 1, bounds);
                this._RecursiveMadness(areas, x + 1, y - 1, bounds);
                this._RecursiveMadness(areas, x + 1, y + 1, bounds);
                this._RecursiveMadness(areas, x - 1, y + 1, bounds);
            }
        };

        Save.prototype.DrawAreas = function (areas) {
            this.context.fillStyle = 'rgba(255,128,64,0.25)';

            for (var key in areas) {
                var bounds = areas[key];

                this.context.fillRect(bounds.xMin, bounds.yMin, bounds.xMax - bounds.xMin, bounds.yMax - bounds.yMin);
            }
        };

        Save.prototype.GetImageData = function (bounds) {
            var r = this.retina;
            return this.context.getImageData(bounds.xMin * r, bounds.yMin * r, (bounds.xMax - bounds.xMin) * r, (bounds.yMax - bounds.yMin) * r);
        };

        Save.prototype.CropImageData = function (image) {
            var w = image.width, h = image.height, r = this.retina;

            var xMin = Number.MAX_VALUE, xMax = -Number.MAX_VALUE, yMin = Number.MAX_VALUE, yMax = -Number.MAX_VALUE, found = false;

            for (var y = 0; y < h; ++y) {
                for (var x = 0; x < w; ++x) {
                    var pixelPosition = (y * w + x) * 4 + 3, pixelAlpha = image.data[pixelPosition];

                    if (pixelAlpha > 0) {
                        found = true;
                        if (y < yMin) {
                            yMin = y;
                        }
                        if (y > yMax) {
                            yMax = y;
                        }
                        if (x > xMax) {
                            xMax = x;
                        }
                        if (x < xMin) {
                            xMin = x;
                        }
                    }
                }
            }

            if (found) {
                return {
                    xMin: xMin / r,
                    xMax: xMax / r,
                    yMin: yMin / r,
                    yMax: yMax / r
                };
            } else {
                return null;
            }
        };

        Save.prototype.CroppedDrawAreas = function (areas) {
            var _this = this;
            var newAreas = [];

            var margin = 8;

            areas.forEach(function (area) {
                if (!area)
                    return;
                console.log(area);
                var imageData = _this.GetImageData(area);
                console.log(imageData);

                var croppedBounds = _this.CropImageData(imageData);
                console.log(croppedBounds);
                if (!croppedBounds)
                    return;

                var newBounds = {
                    xMin: Math.max(0, area.xMin + croppedBounds.xMin - margin),
                    xMax: area.xMin + croppedBounds.xMax + margin,
                    yMin: Math.max(0, area.yMin + croppedBounds.yMin - margin),
                    yMax: area.yMin + croppedBounds.yMax + margin
                };

                newAreas.push(newBounds);
            });

            return newAreas;
        };

        Save.prototype.CreatePngs = function (areas) {
            var _this = this;
            var images = [], r = this.retina;
            areas.forEach(function (area) {
                if (!area) {
                    images.push(null);
                    return;
                }
                ;

                var imageData = _this.GetImageData(area);

                var tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = (area.xMax - area.xMin) * r;
                tmpCanvas.height = (area.yMax - area.yMin) * r;

                tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);

                images.push(tmpCanvas.toDataURL('image/png'));
            });

            return images;
        };
        return Save;
    })();
    MapPaint.Save = Save;
})(MapPaint || (MapPaint = {}));
//# sourceMappingURL=MapPaint.js.map
