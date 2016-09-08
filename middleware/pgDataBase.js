var pg = require('pg');
var conString = "postgres://user0947:0947@localhost/Gps_clients";
var passwordHash = require('password-hash');

var client = new pg.Client(conString);
client.connect();

exports.insertData = function (email,firstn,lastn,passwd, cb) {
    var hashedPassword = passwordHash.generate(passwd);
    var text ='INSERT INTO clients (email, first_name, last_name, passwd) VALUES ($1,$2,$3,$4);'
    console.log(text);
    client.query(text,[email,firstn,lastn,hashedPassword],function(err,result){
        if(err){
            //console.log('some error: '+err);
            cb(err);
        } else{
           // console.log('done:'+JSON.stringify(result))
            cb(null,result);
        }
    });
};

exports.selectUser = function(email,cb){
    var text = 'SELECT id,email FROM clients WHERE email = $1;'
    client.query(text,[email],function(err,result){
        if(err){
            cb(err);
        } else{
            cb(null,result.rows[0])
        }
    })
};


 exports.dataCheck = function (semail,spasswd,cb){
    var text = 'SELECT id,email,passwd FROM clients WHERE email = $1;'
    client.query(text,[semail],function(err,result){

        //console.JSON.stringify(result.rows))log(

        if (err) {
            cb(err);
        }else if(result.rows.length==0){
            cb(new Error('user not found'))
        }else if(passwordHash.verify(spasswd,result.rows[0].passwd)==false){
            cb(new Error('password incorrect'));
        }else{
            cb(null, {id:result.rows[0].id,email:result.rows[0].email})
        }

    });
};

exports.clientDevices = function(userid,cb){
    var text = 'SELECT c.id, c.email, g.id, s."clientId", s."deviceId"  FROM clients c' +
        ' JOIN clientrealdevices s' +
        ' ON c.id=s."clientId"' +
        ' JOIN gps_devices g' +
        ' ON s."deviceId"=g.id' +
        ' WHERE c.id='+userid;
        console.log(text);
    client.query(text,function(err,result){
        if(err){
            console.error(err)
            cb(err);
        } else{
            cb(null,result.rows)
        }
    })
};

exports.getUsersByDeviceId = function(deviceid,cb){
    var text = 'SELECT clientid FROM clientrealdevices c WHERE c.deviceid=$1'
    client.query(text,[deviceid],function(err,result){
        if(err){
            console.error(err)
            cb(err);
        } else{
            console.log("getUsersByDeviceId=>", result.rows)
            cb(null,result.rows)
        }
    })
}