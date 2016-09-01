var express   = require('express');
var app       = express();
var request   = require('request');
var airports  = require('airport-codes');



var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 8080));


app.get('/', function(req, res){
  res.send('Huzzah! I still work!');
});


//2. find solution for formatting dates = year-mo-da

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];


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
	}
}



app.post('/post', function(req, res){
	var origin 				= conversion.convertCity(req.body.text.split(/[ ]+/)[0]);
	var destination 	= conversion.convertCity(req.body.text.split(/[ ]+/)[1]);
	var departureDate = req.body.text.split(/[ ]+/)[2];
	var returnDate 		= req.body.text.split(/[ ]+/)[3];
	
	//!!Future implimentation: allowences for written months
	// if ( departureDate.includes(/^[A-Za-z ]+$/) ) { conversion.convertDate(departureDate) };
	// if ( returnDate.includes(/^[A-Za-z ]+$/) ) { conversion.convertDate(returnDate) };



	request({
		url: 'http://terminal2.expedia.com/x/mflights/search?departureAirport=' + origin + '&arrivalAirport=' + destination + '&departureDate=' + departureDate + '&returnDate=' + returnDate + '&apikey=' + process.env.FLIGHTBOT_EXPEDIA_API_KEY,
		method: 'POST',
		headers: {
			'Content-Type': 'JSON',
		}, function(err, res, data) {

			if(err) { 
				var msg = err;
			}else { 
				console.log(res.statusCode, body); 
				var msg = 'this is from expedia: ' + res.statusCode + ' ' + data;
			}

		}
	});

	// var msg = 'origin: ' + origin + '. destination: ' + destination + ' departure date: ' + departureDate + ' arrival date: ' + returnDate;



  var body = {
    response_type: "in_channel",
    text: msg 
  };

  res.send(body);

});






app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
