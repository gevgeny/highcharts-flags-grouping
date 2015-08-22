# [highcharts-flags-grouping](http://www.highcharts.com/plugin-registry/single/41/flags-grouping)
[Highcharts](http://www.highcharts.com) plugin which adds possibility to group points in the flags series 

* [One serie with binding to line example] (http://gevgeny.github.io/highcharts-flags-grouping/demo/demo1.html) 
* [Multiple series example] (http://gevgeny.github.io/highcharts-flags-grouping/demo/demo2.html)

![example](https://raw.githubusercontent.com/gevgeny/highcharts-flags-grouping/master/demo/demo.png)

#### Higchart options section to enable plugin.
```javascript
flagsGrouping : {
        // Calculate fill color for each group point from the serie color and count of initial points in the grouped point 
        calculateFillColor : true,
        
        // Specify whether to select group time interval on flag marker click
        selectGroupOnClick : true,
        
        // Min possible time interval to be selected on marker click (if selectGroupOnClick specified)
        minSelectableDateRange : 14 * 24 * 60 * 60 * 1000, // 2 weeks;
  
        // An array determining what time intervals the data is allowed to be grouped to. 
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
    }
```
The plugin replaces initial set of points with a calculated shorted list every time when chart's extremes change.
Initial points still available after grouping in `initialPoints` of the point field and can be used for formatting
```javascript
tooltip : {
        formatter : function (tooltip) {
            if (this.point && this.point.initialPoints) {
                // Format group of points using this.point.initialPoints;
            } else if (this.point) {
                // Format simple flag point
            } else {
                // Format for non-flag point
            } 
        }
    }
}
```
