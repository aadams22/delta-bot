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

// process.env.FLIGHTBOT_EXPEDIA_API_KEY

//1. find solution for converting city names into airport codes
//2. find solution for formatting dates

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];


var conversion = {
	convertDate: function(date) {
		//checks if the date is in place 1 or 2 of the date
		if (!isNaN(date.split(/[ ]+/)[0])) {  
			return months.indexOf(date.split(/[ ]+/)[0]) + 1)
		}else if(!isNaN(date.split(/[ ]+/)[1])) {
			return months.indexOf(date.split(/[ ]+/)[1]) + 1)
		}

	},
	convertCity: function(city) {
		airports.findWhere({ 'name' : city });
		return 
	}
}



app.post('/post', function(req, res){
	var origin 				= conversion.convertCity(req.body.text.split(/[, ]+/)[0]);
	var destination 	= conversion.convertCity(req.body.text.split(/[, ]+/)[1]);
	var departureDate = req.body.text.split(/[, ]+/)[2];
	var returnDate 		= req.body.text.split(/[, ]+/)[3];

	// if ( departureDate.includes(/^[A-Za-z ]+$/) ) { conversion.convertDate(departureDate) };
	// if ( returnDate.includes(/^[A-Za-z ]+$/) ) { conversion.convertDate(returnDate) };


	var msg = 'this is your origin: ' + origin + '. this is your destination: ' + destination ;

  var body = {
    response_type: "in_channel",
    text: msg 
  };

  res.send(body);

});


// request({
// 	url: 'http://terminal2.expedia.com/x/mflights/search?departureAirport=' + origin + '&arrivalAirport=' + destination + '&departureDate=' + departureDate + '&returnDate=' + returnDate + '&apikey=' + process.env.FLIGHTBOT_EXPEDIA_API_KEY,
// 	method: 'POST',
// 	headers: {
// 		'Content-Type': 'JSON',
// 	}, function(err, res, body) {

// 		if(err) { 
// 			console.log(err); 
// 		}else { 
// 			console.log(res.statusCode, body); 
// 		}

// 	}
// });



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
