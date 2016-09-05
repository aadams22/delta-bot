var express  		   = require('express');
var app         	 = express();
var airports  		 = require('airport-codes');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 8080));


// /getflights [origin, destination, departureDate, airline]

//VARIABLE DECLARATIONS
var origin			   = null;
var destination    = null;
var departureDate  = null;
var airline				 = null;
var body           = null;
var flights				 = [];
var today 				 = new Date();
var currentYear    = today.getFullYear();


//===================================================================================
//===================================================================================


app.post('/post', function(req, res){
	origin 				= conversion.convertCity(req.body.text.split(/[ ]+/)[0]);
	destination 	= conversion.convertCity(req.body.text.split(/[ ]+/)[1]);
	departureDate = req.body.text.split(/[ ]+/)[2];
	airline				= req.body.text.split(/[ ]+/)[3];
	


	//if the departure param exists, check and see if the date is in the past, if the departure date does not exist, send error message
	// if(departureDate) 		{ validations.isDateValid(departureDate); }else { validations.incompleteParams(departureDate) }
	
	// if(!origin) 						{ validations.incompleteParams(origin) }
	// else if(!destination) 	{ validations.incompleteParams(destination) }
	// else if(!airline) 			{ validations.incompleteParams(airline) }
	// else 										{ 

		

		// var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=MSP&arrivalAirport=DEN&departureDate=2016-10-22&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
		var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=" + origin + "&arrivalAirport=" + destination + "&departureDate=" + departureDate + "&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
		var method  = 'GET';
		var async   = true;
		var request = new XMLHttpRequest();

		request.onload = function() {
			var status = request.status;
			var data 	 = JSON.parse(request.responseText);

			if(status == 200) { 
				flightData.filterData(data); 
				var s = flights.sort(flightData.sortFlights);
				var p = flightData.removeDuplicates(x => x.flightNumber, s);

				body = {
								response_type: "in_channel",
								text: "ORIGIN: " + origin + ". DESTINATION: " + destination + ". RESULTS: " + flightData.printF(p)
								};

				res.send(body);
	  		
			}else { 
				body = {
								response_type: "in_channel",
								text: validations.incompleteParams("flight info again.") 
								};

				res.send(body);
			}
			
		};

		request.open(method, url, async);
		request.setRequestHeader("Content-Type", "json;");
	  request.send();

	// }
});



//==============================================
//FOR TESTING
//==============================================
// var airline = "Delta";
// var o  = "MSP";
// var destination = "DEN";
// var dd = "2016-09-20";

// var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=" + o + "&arrivalAirport=" + destination + "&departureDate=" + dd + "&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
// // var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=MSP&arrivalAirport=DEN&departureDate=2016-10-22&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
// var method  = 'GET';
// var async   = true;
// var request = new XMLHttpRequest();


// request.onload = function() {
// 	var status = request.status;
// 	var data   = JSON.parse(request.responseText);
// 	console.log("status ", status);

// 	var d = flightData.filterData(data);
// 	// console.log("d: ", d);
// 	var s = flights.sort(flightData.sortFlights);
// 	// console.log("s: ", s);
// 	var p = flightData.removeDuplicates(x => x.flightNumber, s);
// 	// console.log("P:", p);
// 	console.log(flightData.printF(p))
// };

// request.open(method, url, async);
// request.setRequestHeader("Content-Type", "json;");
// request.send();





//Sends to deployed view to make sure it's up and running! 
app.get('/', function(req, res){
  res.send("Huzzah! I still work! Now let's have some tea.");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});






//==========================================================================
//FUNCTION DEFINITION
//==========================================================================
var validations = {
	incompleteParams: function(fail) {
			return 'There was an error. Please input correct ' + fail + '.'; 
	},
	isDateValid: function(d) {
		if(d < today) { return validations.incompleteParams(d) }
	}
};


var conversion = {
	convertDate: function(date) {
		if (!isNaN(date.split(/[ ]+/)[0])) {  
			return months.indexOf(date.split(/[ ]+/)[0] + 1)
		}else if(!isNaN(date.split(/[ ]+/)[1])) {
			return months.indexOf(date.split(/[ ]+/)[1] + 1)
		}
	},
	convertCity: function(city) {
		//runs a backbone query on the airport-codes module to find the IATA for user's input city
			return airports.findWhere({ 'city' : city }).get('iata'); 
	},
	addYear: function(date){
		console.log('this is split date: ', date.split(''));
		if(!date.split('').length == 5) { 
			return currentYear + '-' + date 
		};
	}
};


var flightData = {
	filterData: function (d) {
		for (var i = 0; i < d.legs.length; i++) {
			// console.log(d.legs[i].segments[0].arrivalAirportCode + " : " + destination + " - " + airline)

			if( airline == d.legs[i].segments[0].airlineName && d.legs[i].segments[0].arrivalAirportCode === destination) {
				flights.push({
											"flightNumber": d.legs[i].segments[0].flightNumber,
											"departure": d.legs[i].segments[0].departureTime,
											"arrival": d.legs[i].segments[0].arrivalTime,
											"airline": d.legs[i].segments[0].airlineName,
											"stops": d.legs[i].segments[0].stops,
											"timeEpochSec": d.legs[i].segments[0].departureTimeEpochSeconds,
											"departureAirportCode": d.legs[i].segments[0].departureAirportCode,
											"arrivalAirportCode": d.legs[i].segments[0].arrivalAirportCode
										});
			}

		};
		return flights;	
	},
	sortFlights: function(a,b) {
		return a.timeEpochSec - b.timeEpochSec;
	},
	removeDuplicates: function(k,a) {
    return a.filter(function(x) {
    	var mySet = new Set();

    	var key   = k(x); 
    	var isNew = !mySet.has(key);

    	if (isNew) { return mySet.add(key) };
    });

	},
	printF: function(f) {
		var a = [];
		for (var i = 0; i < f.length; i++) {
			a.push("Flight: " + f[i].flightNumber 
						// + ", Departure: "  + f[i].departure
						// + ", Arrival: "    + f[i].arrival
						+ ", "	   + f[i].airline
						// + ", Departure Airport: "	   + f[i].departureAirportCode
						+ ", "	     + f[i].arrivalAirportCode
						+ " . ")		
		};
		return a.join("");
	}

}