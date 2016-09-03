var express   = require('express');
var app       = express();
var airports  = require('airport-codes');



var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 8080));


// /getflights [origin, destination, departureDate, airline]


var msg 			  	= null;
var userParams    = null;
var origin			  = null;
var destination   = null;
var departureDate = null;
var airline				= null;
var flights				= [];
var today 				= new Date();
var currentYear   = today.getFullYear();



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


//===================================================================================
function findDepartures(data) {
	for (var i = 0; i < data.legs.length; i++) {
		flights.push({
									"flightNumber": data.legs[i].segments[0].flightNumber,
									"departure": data.legs[i].segments[0].departureTime,
									"arrival": data.legs[i].segments[0].arrivalTime,
									"airline": data.legs[i].segments[0].airlineName,
									"stops": data.legs[i].segments[0].stops
								});

	};

	// return flights;
	
}


function getflights() {
	var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=LAX&arrivalAirport=ORD&departureDate=2016-10-22&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
	var method  = 'GET';
	var async   = true;
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var request = new XMLHttpRequest();

	request.onload = function() {
		var status = request.status;
		var data = JSON.parse(request.responseText);
		console.log("status ", status);
		findDepartures(data);
	};

	request.open(method, url, async);
	request.setRequestHeader("Content-Type", "json;");
	request.send();
}


//===================================================================================

//need to find a solution for cities with 2 words that include a white space
app.post('/post', function(req, res){
	// userParams    = req.body.text.split(/[ ]+/);
	// origin 				= req.body.text.split(/[ ]+/)[0];
	// destination 	= req.body.text.split(/[ ]+/)[1];
	// departureDate = req.body.text.split(/[ ]+/)[2];
	// airline				= req.body.text.split(/[ ]+/)[3];
	


	//if the departure param exists, check and see if the date is in the past, if the departure date does not exist, send error message
	// if(departureDate) 		{ validations.isDateValid(departureDate); }else { validations.incompleteParams(departureDate) }
	
	// if(origin) 						{ validations.incompleteParams(origin) }
	// else if(destination) 	{ validations.incompleteParams(destination) }
	// else if(airline) 			{ validations.incompleteParams(airline) }
	// else									  { getflightData(origin, destination, departureDate, airline) }

	// var url     = "http://terminal2.expedia.com/x/mflights/search?departureAirport=" + origin + "&arrivalAirport=" + destination + "&departureDate=" + departureDate + "&airlineName=" + airline + "&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;

	getflights();
	 
	// r = ' origin: ' + origin 
	// 			+ ' destination: ' + destination 
	// 			+ ' departure date: ' + departureDate 
	// 			+ ' arrival date: ' + returnDate;


	msg = "these are flights: " + flights[0].flightNumber;

  var body = {
    response_type: "in_channel",
    text: msg 
  };

  res.send(body);

});


//Sends to deployed view to make sure it's up and running! 
app.get('/', function(req, res){
  res.send("Huzzah! I still work! Now let's have some tea.");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
