window.options = {
    tooltip : {
        positioner: function (w, h, point) {
            var position = this.getPosition(w, h, point);

            if (this.chart.flagTooltip) {
                position.y -= 40;
            }

            return position;
        },
        useHTML : true,
        followPointer : true,
        formatter : function (tooltip) {
            if (this.point && this.point.initialPoints && this.point.initialPoints.length > 1) {
                var text = '<b>' + Highcharts.dateFormat('%b %d, %Y', this.point.initialPoints[0].x) + '</b>' +
                    '<span> - </span>' +
                    '<b>' + Highcharts.dateFormat('%b %d, %Y', this.point.initialPoints[this.point.initialPoints.length - 1].x) + '</b><br/>';

                text += '<span style="font-size: 11px">';
                for (var i = 0; i < this.point.initialPoints.length; i++) {
                    text += '<p style="width: 400px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">- ' + this.point.initialPoints[i].text + '</p>'
                    if (i === 5) {
                        text += '<p>...</p>';
                        break
                    }
                }

                return text + '</span>';
            } else if (this.point) {
                return '' +
                    '<b>' + Highcharts.dateFormat('%b %d, %Y', this.point.x) + '</b><br/>' +
                    '<span>' + this.point.text + '</span>';

            }
            return tooltip.defaultFormatter.apply(this, [tooltip]);
        }

    },
    plotOptions : {
        series : {
            turboThreshold: 2000
        },
        flags: {
            shape :"circlepin",
            style: {
                cursor: 'pointer',
                fontWeight: 'bold',
                textAlign: 'center'
            },
            events: {
                mouseOver: function(){
                    this.chart.flagTooltip = true;
                },
                mouseOut: function(){
                    this.chart.flagTooltip = false;
                }
            }
        }
    },
    flagsGrouping : {
        calculateFillColor : true,
        selectGroupOnClick : true,
        minSelectableDateRange : 14 * 24 * 60 * 60 * 1000, // 2 weeks;
        groupings : [{
            zoomTimeSpan :  2 * 365 * 24 * 60 * 60 * 1000, // when more then 2 years selected
            groupTimeSpan :      60 * 24 * 60 * 60 * 1000  // group flags by 60 days
        },{
            zoomTimeSpan :      365 * 24 * 60 * 60 * 1000, // when from 2 to 1 years selected
            groupTimeSpan :      30 * 24 * 60 * 60 * 1000  // group by 30 days
        }, {
            zoomTimeSpan :      182 * 24 * 60 * 60 * 1000, // when from 1 to half year selected
            groupTimeSpan :      15 * 24 * 60 * 60 * 1000  // group flags by 15 days
        }, {
            zoomTimeSpan :       90 * 24 * 60 * 60 * 1000, // when from half year to 3 month selected
            groupTimeSpan :       5 * 24 * 60 * 60 * 1000  // group by 5 days
        }]
    },

    title : {
        text : 'MSFT Stock Price'
    }
};
