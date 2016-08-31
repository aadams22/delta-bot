var express   = require('express');
var app       = express();
// var url       = require('url');
// var request   = require('request');



var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 8080));


app.get('/', function(req, res){
  res.send('Huzzah! I still work!');
});

//Units For Testing:


app.post('/post', function(req, res){
	var origin = req.body.text.split(/[ ]+/)[0];
	var destination = req.body.text.split(/[ ]+/)[1];

	var msg = 'this is your origin: ' + origin + '. this is your destination: ' + destination ;

  var body = {
    response_type: "in_channel",
    text: msg 
  };

  res.send(body);

});




app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
