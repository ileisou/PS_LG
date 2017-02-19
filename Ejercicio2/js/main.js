/* ******************************************** */
/* *                                            */
/* * Author: David Santos                       */
/* * Date: Feb 2017                             */
/* * Description: Javascript code test          */
/* *                                            */
/* ******************************************** */

var data_map = {}; // Ordered map. Key: cat - value: date_map
var dates_map = {}; // Ordered map. Key: date(string) - value: Date (object)

$(function() {
	
	// Llamadas ajax en secuencia para evitar problemas de concurrencia al combinar los datos
	$.ajax({
		url: "http://s3.amazonaws.com/logtrust-static/test/test/data1.json",
		async: true,
		dataType: "json",
		success: function(data) {
			$.each(data, function(index, item) {

				add_data(new Date(item.d), item.cat.toUpperCase(), item.value);
				
			});
			
			$.ajax({
				url: "http://s3.amazonaws.com/logtrust-static/test/test/data2.json",
				async: true,
				dataType: "json",
				success: function(data) {
					$.each(data, function(index, item) {

						add_data(new Date(item.myDate), item.categ.toUpperCase(), item.val);

					});
					
					$.ajax({
						url: "http://s3.amazonaws.com/logtrust-static/test/test/data3.json",
						async: true,
						dataType: "json",
						success: function(data) {
							$.each(data, function(index, item) {

								var date = item.raw.match(/(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/);
								var cat = item.raw.match(/#cat \d#/i);
								
								add_data(new Date(date[0]), cat[0].toUpperCase().substr(1, 5), item.val);
							});
							
							draw_chart1();
							draw_chart2();
						},
						error: function(jqxhr, textStatus, error) {
							ajax_error(3, textStatus, error);				
						}
					}); // ajax3
				},
				error: function(jqxhr, textStatus, error) {
					ajax_error(2, textStatus, error);				
				}
			}); // ajax2 
		},
		error: function(jqxhr, textStatus, error) {
			ajax_error(1, textStatus, error);
		}
	}); // ajax1

});

// Para combinar los datos de las diferentes series esta función añade los datos obtenidos
// en las correspondientes estructuras de datos 
function add_data(date, cat, value) {

	var key_date = get_key(date);
	
	// Agrupamos ordenadas todas las fechas encontradas en las fuentes de datos
	if (!(key_date in dates_map)) {
		dates_map[key_date] = date;
	}

	var obj = {};
	obj.date = date;
	obj.value = value;

	if (cat in data_map) {
		// La categoría ya está insertada
		// Comprobamos si existe la fecha
		var date_map = data_map[cat];
		
		if (key_date in date_map) {
			// La fecha ya existía. Sumamos sus valores
			date_map[key_date].value += value;
		}
		else {
			// Insertamos nueva fecha
			date_map[key_date] = obj;
			date_map.num_entries++;
		}
		
		// Actualizamos el total de los valores
		date_map.total += value;
	}
	else {
		// La categoría no existe. La añadimos, junto con una nueva fecha 
		var date_map = {};
		
		date_map[key_date] = obj;
		date_map.total = value;
		date_map.num_entries = 1;
	
		data_map[cat] = date_map;
	}
	
}

function get_key(date) {
	return date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
}

function ajax_error(id_serie, textStatus, error) {
	try
	{
	    var err = textStatus + ", " + error;
	    console.error( "Request Failed: " + err + " for serie " + id_serie);
	}
	catch (err)
	{
	}
}

function get_object_size(obj) {
	
	var count = 0;
	
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			count++;		
		}
	}
	
	return count;
}

function draw_chart1() {
	
	   var title = {
			      text: 'Line Chart'   
			   };

	   var xAxis = {
			      categories: []
			   };
			   
			   
			   var yAxis = {
			      plotLines: [{
			         value: 0,
			         width: 1,
			         color: '#808080'
			      }]
			   };   

			   var legend = {
			      layout: 'vertical',
			      align: 'right',
			      verticalAlign: 'middle',
			      borderWidth: 0
			   };

			   var series =  [
			   ];
			   
			   // Inicializamos los elementos de la variable series de highcharts
			   var series_by_cat = {};
			   for (cat in data_map) {
				   //if (data_map.hasOwnProperty(cat)) {
				   series_by_cat[cat] = {};
				   series_by_cat[cat].name = cat;
				   series_by_cat[cat].data = [];
				   //}
			   }

			   // Recorremos todas las fechas que se han encontrado en las tres series y
			   // con cada una de ellas generamos los valores del eje x, y localizamos
			   // su correspondientes valor en el eje y.
			   for (date_ in dates_map) {
				  
				   var date = dates_map[date_];
				   
				   var month = date.toDateString().split(" ")[1];
				   var day = date.getDate();
				   
				   xAxis.categories.push(day + " " + month);
				   
				   for (cat in data_map) {
					   //if (data_map.hasOwnProperty(cat)) {
					   var date_map = data_map[cat];
					   
					   var key_date = get_key(date); 
					   
					   if (key_date in date_map) {
						   series_by_cat[cat].data.push(date_map[key_date].value);
					   }
					   else {
						   // Para esta fecha y categoría no existen datos, añadimos un valor nulo
						   series_by_cat[cat].data.push(null);
					   }
					   
				   }
			   }
			   
			   // Añadimos a la variable series los datos preparados para pintar la gráfica
			   for (cat in series_by_cat) {
				   series.push(series_by_cat[cat]);
			   }

			   var json = {};

			   json.title = title;
			   json.xAxis = xAxis;
			   json.yAxis = yAxis;
			   json.legend = legend;
			   json.series = series;

			   $('#container1').highcharts(json);
	
}

function draw_chart2() 
{
	  var chart = {
		       plotBackgroundColor: null,
		       plotBorderWidth: null,
		       plotShadow: false
		   };
		   var title = {
		      text: 'Pie Chart'   
		   };
		   
		   var tooltip = {
		      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		   };
		   var plotOptions = {
		      pie: {
		         allowPointSelect: true,
		         cursor: 'pointer',
		         dataLabels: {
		            enabled: true,
		            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
		            style: {
		               color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
		            }
		         }
		      }
		   };
		   var series = [{
		      type: 'pie',
		      name: 'Percentage',
		      data: []
		   }];
		   
		   // Calculamos el total del sumatorio de valores de todas las caterogías
		   var total = 0;
		   for (cat in data_map) {
			   total += data_map[cat].total;
		   }
		   
		   
		   // Generamos datos para highchart
		   // TO DO: no existen datos para todas las fechas en todas las categorías, 
		   // tal vez habría que seleccionar un rango de fechas común para calcular los agregados  
		   for (cat in data_map) {

			   var data_array = [];
			   
			   data_array.push(cat);
			   data_array.push((data_map[cat].total / total) * 100);
			   
			   series[0].data.push(data_array);
		   }
		      
		   var json = {};   
		   json.chart = chart; 
		   json.title = title; 
		   json.tooltip = tooltip;  
		   json.series = series;
		   json.plotOptions = plotOptions;
		  
		   $('#container2').highcharts(json);  
}
