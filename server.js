var express   = require('express');
var app       = express();
var airports  = require('airport-codes');



var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 8080));


// /getflights [origin, destination, departureDate, airline]

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var today 				= new Date();
var currentYear   = today.getFullYear();
var flights				= [];
var msg 			  	= null;
var userParams    = null;
var origin			  = null;
var destination   = null;
var departureDate = null;
var airline				= null;
var body 					= null;




var validations = {
	incompleteParams: function(fail) {
		return msg = 'There was an error. Please input correct ' + fail + '.'
	},
	isDateValid: function(d) {
		if(d < today) { return validations.incompleteParams(d) }
	}
};


var conversion = {
	convertDate: function(date) {
		//checks if the date is in place 1 or 2 of the date
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
	findDepartures: function (data) {
		for (var i = 0; i < data.legs.length; i++) {
			flights.push({
										"flightNumber": data.legs[i].segments[0].flightNumber,
										"departure": data.legs[i].segments[0].departureTime,
										"arrival": data.legs[i].segments[0].arrivalTime,
										"airline": data.legs[i].segments[0].airlineName,
										"stops": data.legs[i].segments[0].stops,
										"timeEpochSec": data.legs[i].segments[0].departureTimeEpochSeconds
									});
			};	
	},
	sortFlights: function(a,b) {
		return a.timeEpochSec - b.timeEpochSec;
	},
	printF: function(f) {
		var a = [];
		for (var i = 0; i < f.length; i++) {
			a.push("Flight Number: " + f[i].flightNumber 
						+ ", Departure: " + f[i].departure
						+ ", Arrival: "   + f[i].arrival
						+ ", Arline: "		+ f[i].arrival)
		};
		return a.join("");
	}

}

//===================================================================================
//===================================================================================


app.post('/post', function(req, res){
	// userParams    = req.body.text.split(/[ ]+/);
	// origin 				= conversion.convertCity(req.body.text.split(/[ ]+/)[0]);
	// destination 	= conversion.convertCity(req.body.text.split(/[ ]+/)[1]);
	// departureDate = req.body.text.split(/[ ]+/)[2];
	// airline				= req.body.text.split(/[ ]+/)[3];
	


	//if the departure param exists, check and see if the date is in the past, if the departure date does not exist, send error message
	// if(departureDate) 		{ validations.isDateValid(departureDate); }else { validations.incompleteParams(departureDate) }
	
	// if(origin) 						{ validations.incompleteParams(origin) }
	// else if(destination) 	{ validations.incompleteParams(destination) }
	// else if(airline) 			{ validations.incompleteParams(airline) }
	// else									  { getflightData(origin, destination, departureDate, airline) }


	var request = new XMLHttpRequest();
	// var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=" + origin + "&arrivalAirport=" + destination + "&departureDate=" + departureDate + "&airlineName=" + airline + "&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
	var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=MSP&arrivalAirport=DEN&departureDate=2016-09-27&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
	var method  = 'GET';
	var async   = true;
	
	request.onload = function() {
		var status = request.status;
		var data 	 = JSON.parse(request.responseText);

		if(status == 200) { 
			flightData.findDepartures(data); 
			var s = flights.sort(flightData.sortFlights);


			// msg = flightData.printF(sorted)


		var a = [];
		for (var i = 0; s < f.length; i++) {
			a.push("Flight Number: " + s[i].flightNumber 
						+ ", Departure: " + s[i].departure
						+ ", Arrival: "   + s[i].arrival
						+ ", Arline: "		+ s[i].arrival)
			}

		}

		msg = a.join("");

			body = {
		    response_type: "in_channel",
	   		text: msg

		  };


			res.send(body);

  		
		}else {

			validations.incompleteParams("flight info again.")
			body = {
		    response_type: "in_channel",
		    text: msg 
	  	};

  		res.send(body);
		}
		
	};

	request.open(method, url, async);
	request.setRequestHeader("Content-Type", "json;");
  request.send();

});


//Sends to deployed view to make sure it's up and running! 
app.get('/', function(req, res){
  res.send("Huzzah! I still work! Now let's have some tea.");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
