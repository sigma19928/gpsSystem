exports.sender = function(req, res, next){


    res.sendHttpError = function(error){

        console.log("INFO: Error sender in action");
        res.status(error.status);
// for ajax request
        if(res.req.headers['x-requested-with'] == 'XMLHttpRequest'){
            console.log('ajax request sended');
            res.json(error.message);
        }
        else{
          res.render('error.ejs',{error: error,message:error.message,status:error.status})
        }

    };

    next();

};