var express = require('express')
var config = require('./server/configure')
var app = express()
var mongoose = require('mongoose')

app.set('port', process.env.PORT || 3300);
app.set('views', __dirname + '/views');
app = config(app);


// app.get('/', function(req, res) {
//   res.send('Hello World!');
// })

mongoose.connect('mongodb://localhost/imgPloader')
mongoose.connection.on('open', function() {
  console.log('Mongoose connected to MongoDB.')
});

app.listen(app.get('port'), function() {
  console.log('Server is listening at: http://localhost:' + app.get('port'));
});
