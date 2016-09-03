var express   = require('express');
var app       = express();
var airports  = require('airport-codes');



var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 8080));


// /getflights [origin, destination, departureDate, returnDate, airline]
// /getflights [origin, destination, departureDate, airline]

var msg 			  	= null;
var userParams    = null;
var origin			  = null;
var destination   = null;
var departureDate = null;
var returnDate 		= null;
var airline				= null;
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
		if(airports.findWhere({ 'city' : city }).get('iata')) { 
			return airports.findWhere({ 'city' : city }).get('iata'); 
		}else{ 
			return validations.incompleteParams(city);
		};
	},
	addYear: function(date){
		console.log('this is split date: ', date.split(''));
		if(!date.split('').length == 5) { 
			return currentYear + '-' + date 
		};
	}
};

function findDepartures(data) {
	for (var i = 0; i < data.legs.length; i++) {
		console.log("========FLIGHT " + i + "========");
		// console.log(data.legs[i].legId);
		console.log(data.legs[i].segments[0].departureTime);
		console.log(data.legs[i].segments[0].arrivalTime);
		console.log(data.legs[i].segments[0].airlineName);
		console.log(data.legs[i].segments[0].flightNumber);
		console.log(data.legs[i].segments[0].stops);
	};
}


function getflightData(d) {

	var url     = null;
	var method  = 'GET';
	var async   = true;
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var request = new XMLHttpRequest();


	if(d.returnDate) {
		url = "http://terminal2.expedia.com/x/mflights/search?departureAirport=LAX&arrivalAirport=ORD&departureDate=2016-10-22&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;
	}else {
		url = "http://terminal2.expedia.com/x/mflights/search?departureAirport=" + d.origin + "&arrivalAirport=" + d.destination + "&departureDate=" + d.departureDate + "&apikey=" + process.env.FLIGHTBOT_EXPEDIA_API_KEY;

	}

	request.onload = function() {
		var status = request.status;
		var data = JSON.parse(request.responseText);
		console.log("status ", status);
		console.log("data", data);
		findDepartures(data);
	};

	request.open(method, url, async);
	request.setRequestHeader("Content-Type", "json;");
	request.send();
}





//Sends to deployed view to make sure it's up and running! 
app.get('/', function(req, res){
  res.send("Huzzah! I still work! Now let's have some tea.");
});


app.post('/post', function(req, res){
	userParams    = req.body.text.split(/[ ]+/);
	origin 				= conversion.convertCity(userParams[0].trim());
	destination 	= conversion.convertCity(userParams[1].trim());
	departureDate = userParams[2].trim();
	returnDate 		= userParams[3].trim();
	airline				= userParams[4].trim();
	


	//if the departure param exists, check and see if the date is in the past, if the departure date does not exist, send error message
	if(departureDate) { validations.isDateValid(departureDate); }else { validations.incompleteParams(departureDate) }
	//if return param exists, check and see if the date is in the past. This param is not required so other validations do not need to take place
	if(returnDate) { validations.isDateValid(returnDate); }



	msg = 'origin: ' + origin 
				+ '. destination: ' + destination 
				+ ' departure date: ' + departureDate 
				+ ' arrival date: ' + returnDate;

  var body = {
    response_type: "in_channel",
    text: msg 
  };

  res.send(body);

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
