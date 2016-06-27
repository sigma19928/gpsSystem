/**
 * Created by torino on 6/24/16.
 */
var passwordHash = require('password-hash');

var hashedPassword = 'sha1$4cd786a1$1$a7f3718360116deff28c9bc61b753e2b47d6e92e'
    ;



console.log(passwordHash.isHashed(hashedPassword));