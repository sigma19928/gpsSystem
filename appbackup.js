var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('./config');
var dataBase = require('./middleware/pgDataBase');
var HttpError = require('./error/httpError').HttpError;
var HttpErrorSender = require('./middleware/httpErrorSender');
var session = require('express-session');
var pg = require('pg');
var pgSession = require('connect-pg-simple')(session);

var app = express();
var socketCon = new Map();
app.set(config.get('port'));

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(HttpErrorSender.sender);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(session({
    store: new pgSession({
        pg: pg,                                  // Use global pg-module
        conString: "postgres://user0947:0947@localhost/Gps_clients", // Connect using something else than default DATABASE_URL env variable
        tableName: 'session'               // Use another table-name than the default "session" one
    }),
    secret: 'torino',
    resave: false,
    cookie: {maxAge: 30 * 24 * 60 * 60 * 1000},// 30 day
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));


var server = http.createServer(app);
server.listen(config.get('port'), function () {
    console.log('Server running in port:' + config.get('port'))
});

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    socket.on('geo', function (options) {
        console.log('message:' + options);

        //socket.broadcast.emit('take',options);
        if (socketCon.size > 0) {
            dataBase.getUsersByDeviceId(options.chip, function (err, usersId) {

                if (usersId) {
                    usersId.forEach(function(user){
                        var userid = user.clientid;
                        console.log("userid",userid);
                        socketCon.forEach(function (socketConnection, userIDKey, mapObj) {
                            console.log("userid === userIDKey",userid == userIDKey);
                            console.log("userid ",userid );
                            console.log(" userIDKey",userIDKey);
                            if (userid == userIDKey) {
                                socketConnection.socket.emit('take',options.coord)
                            }
                        });

                    });
                }
            });
        }
    });
    ////////////////////
    socket.on('userCon', function (userCon) {
        //socket["client"] = {
        //    id: userCon.userid
        //}
        console.log("New Connection", socket.id);
        socketCon.set(userCon.userid, {
            socket: socket
        });
       console.log("socketCon keys after saving", socketCon)
    })

    socket.on('disconnect', function () {
        console.log('user disconnected', socket.id);
        socketCon.forEach(function (socketConnection, userIDKey, mapObj) {
                if(socketConnection.socket.id == socket.id){
                   // socketCon.delete(userIDKey);
                }
        });
        console.log("socketCon keys", socketCon.keys())
    });
});


app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.get('/map', function (req, res) {
    if (req.session.isAuth) {
        res.render('mindash.ejs', {userid: req.session.user.id});
    } else {
        res.redirect('/');
    }
});

app.get('/mydevices', function (req, res) {
    if (req.session.isAuth) {
        res.render('device.ejs');
        /*dataBase.clientDevices(req.session.user.id, function (err, data) {
            if (err) {
                return res.send(err);
            } else {
               res.send(data);
            }
        });*/
    } else {
        res.render('error.ejs')
    }
});

app.get('/logout', function (req, res) {
    delete req.session.isAuth;
    delete req.session.user;
    req.session.destroy(function () {
        res.redirect('/');
    });
});

// registration
app.post('/signup', function (req, res, next) {
    var passwd = req.body.passwd;
    var firstn = req.body.firstn;
    var lastn = req.body.lastn;
    var email = req.body.email;

    //console.log(passwd,firstn,lastn,email);
    dataBase.insertData(email, firstn, lastn, passwd, function (err, user) {
        if (err) {
            res.render('error.ejs')
        } else {
            dataBase.selectUser(email, function (err, user) {
                if (err) {
                    next(new HttpError(500, "Sorry server error"));
                }
                req.session.isAuth = true;
                req.session.user = user;
                //console.log(user);
                res.redirect('/map');
            });
        }
    });


});

app.post('/signin', function (req, res, next) {
    var semail = req.body.semail;
    var spasswd = req.body.spasswd;

    dataBase.dataCheck(semail, spasswd, function (err, user) {
        if (err) {
            //next(new HttpError(404, "not found"));
            res.render('error.ejs', {message: err.message, error: err})
        } else {
            console.log('session:' + JSON.stringify(req.session));
            req.session.isAuth = true;
            req.session.user = user;
            res.redirect('/map');
        }

    });
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


// Handle 404
app.get('*', function (req, res, next) {
    next(new HttpError(404, HttpError.httpErrMessages['404']));
});

app.use(function (err, req, res, next) {
    console.error('INFO: Error Handler in action!', new Date());

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    }
    else {
        console.error('INFO: SERVER INTERNAL ERROR: 500 => developers bug', err);
        err = new HttpError(HttpError.httpCodes.SERVERERROR);
        res.sendHttpError(err);
    }
});


