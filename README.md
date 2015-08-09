# highcharts-flags-grouping
Highcharts plugin which adds possibility to group points in the flags series 

![example](https://raw.githubusercontent.com/gevgeny/highcharts-flags-grouping/demo/demo.png)

#### Higchart options section to enable plugin. 
```javascript
flagsGrouping : {
        // Calculate fill color for each group point from the serie color and count of initial points in the grouped point 
        calculateFillColor : true,
        // An array determining what time intervals the data is allowed to be grouped to. 
        groupings : [{
            zoomTimeSpan : 2 * 365 * 24 * 60 * 60 * 1000, // when more then 2 years selected
            groupTimeSpan :     60 * 24 * 60 * 60 * 1000  // group flags by 60 days
        },{
            zoomTimeSpan :     365 * 24 * 60 * 60 * 1000, // when from 2 to 1 years selected
            groupTimeSpan :     30 * 24 * 60 * 60 * 1000  // group by 30 days
        }, {
            zoomTimeSpan :     182 * 24 * 60 * 60 * 1000, // when from 1 to half year selected
            groupTimeSpan :     15 * 24 * 60 * 60 * 1000  // group flags by 15 days
        }, {
            zoomTimeSpan :      90 * 24 * 60 * 60 * 1000, // when from half year to 3 month selected
            groupTimeSpan :      5 * 24 * 60 * 60 * 1000  // group by 5 days
        }]
    }
```