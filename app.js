var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('./config');
var dataBase = require('./pgDataBase');


var app = express();
app.set(config.get('port'));

// view engine setup
app.engine('ejs',require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var server = http.createServer(app);
server.listen(config.get('port'),function(){
  console.log('Server running in port:'+config.get('port'))
});

var io = require('socket.io').listen(server);

io.on('connection',function(socket){
  socket.on('geo', function (options) {
    console.log('message:'+options);
    socket.broadcast.emit('take',options);
  });
});


app.get('/',function(req,res){
  res.render('index.ejs');
});

app.get('/map',function(req,res){
  res.render('map.ejs');
});

app.post('/signup', function(req,res){
  var passwd = req.body.passwd;
  var firstn = req.body.firstn;
  var lastn = req.body.lastn;
  var email = req.body.email;

  console.log(passwd,firstn,lastn,email);
  dataBase.insertData(email,firstn,lastn,passwd,function(err){
    if(err){
      res.render('error.ejs')
    }else{
      res.redirect('/map');
    }
  });


});

app.post('/signin',function(req,res){
  var semail = req.body.semail;
  var spasswd = req.body.spasswd;
  console.log(semail,spasswd);
  dataBase.dataCheck(semail,spasswd,function(err){
    if(err){
      res.render('error.ejs',{message: err.message,error:err})
    }else{
      res.redirect('/map')
    }
  });
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


