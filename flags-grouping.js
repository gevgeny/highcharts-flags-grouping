/**
 * This plugin adds possibility to group flags series in accordance with selected time range
 * */
(function (H) {
    var baseSetDataMethod;
    /**
     * key - chart serie
     * value - points lists
     * */
    var pointsGroups = new Map();

    /**
     * key - chart serie
     * value - current number of grouping that applied to the serie
     * */
    var seriesGropingNumbers = new Map();

    /**
     * key - chart
     * value - chart options
     * */
    var chartsOpts = new Map();

    var rgbToHex = function(r, g, b) {
        var componentToHex = function(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    var hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ];
    };

    var calcPointBetweenTwo = function (start, end, offset) {
        offset = (end - start) * offset;

        return ~~(start + offset);
    };

    var calcColorsMix = function (from, to, offset) {
        from = hexToRgb(from);
        to = hexToRgb(to);

        var r = calcPointBetweenTwo(from[0], to[0], offset);
        var g = calcPointBetweenTwo(from[1], to[1], offset);
        var b = calcPointBetweenTwo(from[2], to[2], offset);

        return rgbToHex(r, g, b);
    };

    var applyColors = function (pointsLists, baseGroupFillColor) {
        var maxCountOfPoints = 0;

        pointsLists.forEach(function (points) {
            var maxCountOfPoints = 0;

            points.forEach(function (point) {
                if (point.initialPoints.length > maxCountOfPoints) {
                    maxCountOfPoints = point.initialPoints.length;
                }
            });

            points.forEach(function (point) {
                point.fillColor = calcColorsMix('#FFFFFF', baseGroupFillColor, point.initialPoints.length / maxCountOfPoints);
            });
        });

    };

    /**
     * Group points in accordance with specified grouping options
     * */
    var groupPoints = function (serie, points, opts, baseGroupFillColor) {
        var groupings = opts.groupings;

        // Create list of groups for every provided grouping.
        var pointsLists = groupings.map(function (grouping, index) {
            var timeSpan = grouping.groupTimeSpan;
            var resultGroupedPoints = [];
            var newGroupPoints = [];
            var newGroupPosition = 0;

            // Calculate end date for the first group
            var groupEndDate = points[0].x + timeSpan;

            // Splitting points to groups where each group corresponds to
            // an appropriate date range with length limited by the timeSpan.
            for (var i = 0 ; i < points.length; i++) {
                // Collect points in one group
                newGroupPoints.push(points[i]);

                // Sum group points positions to calculate avg
                newGroupPosition += points[i].x;

                // Close the group if the next point does not belong to this group or does not exists at all.
                if (!points[i + 1] || points[i + 1].x > groupEndDate) {
                    // Calculate avg position for group point
                    newGroupPosition /= newGroupPoints.length;

                    // Create a point for the group
                    resultGroupedPoints.push({
                        x : newGroupPosition,
                        title : newGroupPoints.length,
                        text : 'group: ' + index + 'flags: ' + newGroupPoints.length,
                        initialPoints : newGroupPoints
                    });

                    // Reset current group
                    newGroupPoints = [];
                    newGroupPosition = 0;

                    // Calculate end date for the next group if the next points exits
                    if (points[i + 1]) {
                        groupEndDate = points[i + 1].x + timeSpan;
                    }
                }
            }
            return resultGroupedPoints;
        });

        if (opts.calculateFillColor) {
            applyColors(pointsLists, baseGroupFillColor);
        }

        // last grouping is initial set of points
        pointsLists.push(points);

        pointsGroups.set(serie, {
            isAddedToChart : false,
            pointsLists : pointsLists
        });

    };

    /**
     * Get appropriate number of points group in accordance with provided time span and options
     * */
    var getAppropriateGroupNumber = function (chart, selectedTimeSpan) {
        var groupings = chartsOpts.get(chart).groupings;

        // Use the first grouping if provided time stamp is more than any specified in options
        if (selectedTimeSpan > groupings[0].zoomTimeSpan) {
            return 0;
        }

        // Chose list of points in accordance with provided time span and options
        for (var i = 1; i < groupings.length; i++) {
            if (selectedTimeSpan <= groupings[i - 1].zoomTimeSpan && selectedTimeSpan > groupings[i].zoomTimeSpan) {
                return i;
            }
        }

        // Use the original points (without any grouping) if provided time stamp is less that any specified in options
        return groupings.length;
    };

    var replaceSeriePoints = function (serie, newPoints) {
        if (serie.points) {
            baseSetDataMethod.apply(serie, [newPoints, false, false]);
        } else {
            newPoints.forEach(function (point) {
                serie.addPoint(point, false);
            });
        }
    };

    /**
     * Use this hook to fetch data series and calculate grouped points
     * */
    H.wrap(H.Series.prototype, 'setData', function (proceed, points) {
        var opts = this.chart.options.flagsGrouping;
        if (this.type === 'flags' && opts) {
            console.log('init flags grouping for ', this.name);
            groupPoints(this, arguments[1], opts, this.color);
            chartsOpts.set(this.chart, opts);

            // Init the serie with empty data since atm we don't know what date range is selected and what grouping should be used
            arguments[1] = [];
        }

        baseSetDataMethod = proceed;
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

    });

    /**
     * Use this hook to set set points with necessary grouping when serie inits
     * */
    H.wrap(H.Series.prototype, 'translate', function (proceed) {
        var opts = this.chart.options.flagsGrouping;
        var serie = this;

        // Process only at first call of the hook
        if (this.type === 'flags' && opts && !pointsGroups.get(this).isAddedToChart) {
            // Get default data range
            var extremes = this.xAxis.getExtremes();

            var groupNumber = getAppropriateGroupNumber(this.chart, extremes.max - extremes.min);

            // Remember current grouping
            seriesGropingNumbers.set(this, groupNumber);
            //opts.selectedGroupNumber = groupNumber;

            // Set points with appropriate grouping
            var points = pointsGroups.get(serie).pointsLists[groupNumber];
            replaceSeriePoints(serie, points);

            // Mark the series is processed in order not to process it on more time
            pointsGroups.get(this).isAddedToChart = true;
        }

        proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    });

    /**
     * Use this hook to set replace points with necessary grouping when date range changes
     * */
    H.wrap(H.Axis.prototype, 'setExtremes', function (proceed, min, max) {
        var opts = this.chart.options.flagsGrouping,
            chart = this.chart,
            axis = this,
            timeSpan = max - min;

        if (opts) {
            pointsGroups.forEach(function (pointsLists, serie) {
                if (serie.chart !== chart || serie.xAxis !== axis || !pointsGroups.get(serie).isAddedToChart) {
                    return;
                }

                var groupNumber = getAppropriateGroupNumber(chart, timeSpan);

                // Process only if the date range changed enough to change grouping
                if (seriesGropingNumbers.get(serie) !== groupNumber) {
                    // Set points with appropriate grouping
                    var points = pointsGroups.get(serie).pointsLists[groupNumber];
                    replaceSeriePoints(serie, points);

                    // Remember new group number for this serie
                    seriesGropingNumbers.set(serie, groupNumber);
                }
            });
        }
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    });

    /**
     * Use this hook to select group points date range
     * */
    H.wrap(H.Point.prototype, 'firePointEvent', function (proceed, eventType) {
        var opts = this.series.chart.options.flagsGrouping;

        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        if (opts &&
            opts.selectGroupOnClick &&
            eventType === 'click' &&
            this.series.type === 'flags' &&
            this.initialPoints &&
            this.initialPoints.length > 1
        ) {
            var start = this.initialPoints[0].x;
            var end = this.initialPoints[this.initialPoints.length - 1].x;

            // Extend group date range up to the minimal value
            if (end - start < opts.minSelectableDateRange) {
                var timeExtendTo = (opts.minSelectableDateRange - (end - start)) / 2;

                start -= timeExtendTo;
                end += timeExtendTo;

                // Shift the result date range if after extension it exceeds the possible values
                if (start < this.series.xAxis.dataMin) {
                    end += this.series.xAxis.dataMin - start;
                    start = this.series.xAxis.dataMin;
                } else if (end > this.series.xAxis.dataMax) {
                    start -= end - this.series.xAxis.dataMax;
                    end = this.series.xAxis.dataMax;
                }
            }

            this.series.xAxis.setExtremes(start, end, true, true);
            console.log('firePointEvent', arguments);
        }


    });
}(Highcharts));

