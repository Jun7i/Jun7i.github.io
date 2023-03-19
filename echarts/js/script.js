$(function () {
    echarts_1();
    echarts_2();
    echarts_3();
    function echarts_1() {
        // Top 5 NBA teams with most wins
        var myChart = echarts.init(document.getElementById('echart1'));
        option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            calculable: true,
            series: [
                {
                    name: ' ',

                    type: 'pie',
                    radius: [30, 70],
                    roseType: 'radius',
                    label: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true
                        }
                    },

                    lableLine: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true
                        }
                    },

                    data: [
                        { value: 3462, name: 'BOS' },
                        { value: 3419, name: 'LAL' },
                        { value: 2866, name: 'PHI' },
                        { value: 2667, name: 'SAS' },
                        { value: 2636, name: 'GSW' },

                    ]
                },
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    function echarts_2() {
        // NBA Players With Most MVP Awards
        var myChart = echarts.init(document.getElementById('echart2'));

        option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            legend: {

                top: '15%',
                data: ['Kareem Abdul-Jabbar', 'Michael Jordan', 'Bill Russell', 'LeBron James', 'Wilt Chamberlain'],
                icon: 'circle',
                textStyle: {
                    color: 'rgba(255,255,255,.6)',
                }
            },
            calculable: true,
            series: [{
                name: '',
                type: 'pie',
                startAngle: 0,
                roseType: 'area',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                    },
                    emphasis: {
                        show: false
                    }
                },
                data: [
                    { value: 6, name: 'Kareem Abdul-Jabbar', },
                    { value: 5, name: 'Michael Jordan', },
                    { value: 5, name: 'Bill Russell', },
                    { value: 4, name: 'LeBron James', },
                    { value: 4, name: 'Wilt Chamberlain', },

                    { value: 0, name: "", label: { show: false }, labelLine: { show: false } },
                    { value: 0, name: "", label: { show: false }, labelLine: { show: false } },
                    { value: 0, name: "", label: { show: false }, labelLine: { show: false } },
                    { value: 0, name: "", label: { show: false }, labelLine: { show: false } },
                    { value: 0, name: "", label: { show: false }, labelLine: { show: false } },


                ]
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    function echarts_3() {
        // Top 5 NBA teams with most wins
        var myChart = echarts.init(document.getElementById('echart3'));
        option = {
            xAxis: {
                type: 'category',
                data: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: [120, 200, 150, 80, 70],
                    type: 'line',
                    smooth: true
                },
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

})



