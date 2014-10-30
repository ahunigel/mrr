require.config(
{
	paths :
	{
		'echarts' : 'js/echarts',
		'echarts/chart/bar' : 'js/echarts'
	}
});
        
function loadreport()
{
	var e = (arguments[0] == undefined) ? window.event : arguments[0];
	e.preventDefault();
	require([ 'echarts', 'echarts/chart/bar' ], function(ec)
	{

		var myChart = ec.init(document.getElementById('report'));

		var option =
		{
			tooltip :
			{
				show : true
			},
			legend :
			{
				data : [ 'meetingRoom' ]
			},
			xAxis : [
			{
				name : "Month",
				axisLabel :
				{
					show : true,
					interval : 0
				},
				axisTick :
				{
					show : true,
					interval : 0
				},
				splitLine :
				{
					show : false
				},
				data : [ "January", "February", "March", "April", "May",
						"June", "July", "August", "September", "October",
						"November", "December" ]
			} ],
			yAxis : [
			{
				name : "Hours",
				type : 'value',
				min : 0,
				max : 200
			} ],
			series : [
			{
				"name" : "meetingRoom",
				"type" : "bar",
				"data" : [ 5, 20, 40, 10, 10, 20, 30, 40, 50, 100, 110, 90 ]
			} ]
		};

		myChart.setOption(option);
	});
}