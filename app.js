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

    var Sketchy = (function () {
        function Sketchy(context) {
            this.dataGrid = new SimplePartitionGrid(128, 80);
            this.context = context;
            this.previousPoints = {};
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

            if (!this.eraser) {
                this.dataGrid.Add(point);
            }
        };

        Sketchy.prototype.Stroke = function (input, point) {
            var ctx = this.context, previousPoint = this.previousPoints[input];

            ctx.globalCompositeOperation = this.modeFiller ? 'destination-over' : 'source-over';

            if (this.eraser) {
                MapPaint.Rubber.draw(ctx, point, previousPoint, this);
            } else {
                this.pencil.draw(ctx, point, previousPoint, this);
            }

            this.previousPoints[input] = point;

            this.dataGrid.Add(point);

            // If it's a retina screen, add a second point in the middle
            // (it smooths a bit the draw)
            if (this.retina > 1.0) {
                var middlePoint = {
                    x: (point.x + previousPoint.x) / 2,
                    y: (point.y + previousPoint.y) / 2
                };

                this.dataGrid.Add(middlePoint);
            }
        };

        Sketchy.prototype.Stop = function (input) {
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

                    // If we have something
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
                if (area === null) {
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

    MapPaint.UglyFeltPen = {
        draw: function (ctx, point, previousPoint, sketch) {
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

            ctx.stroke();
        }
    };

    MapPaint.Rubber = {
        draw: function (ctx, point, previousPoint, sketch) {
            ctx.globalCompositeOperation = 'destination-out';

            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 30;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(previousPoint.x, previousPoint.y);
            ctx.lineTo(point.x, point.y);

            ctx.stroke();
        }
    };

    MapPaint.ProceduralPencil = {
        draw: function (ctx, point, previousPoint, sketch, maxAngle) {
            var sdx = previousPoint.x - point.x, sdy = previousPoint.y - point.y, speed = sdx * sdx + sdy * sdy;

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

function lol() {
    s = new MapPaint.Save(pencil.context, 128);
    a = s.MergeModifiedAreas(pencil.dataGrid._modifiedAreas);
    b = s.CroppedDrawAreas(a);
    s.DrawAreas(b);
}
//# sourceMappingURL=app.js.map
