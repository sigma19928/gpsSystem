/**
 * Created by torino on 6/20/16.
 */
var util = require('util');
var http = require('http');

function HttpError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);
    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Unknown Error'; // Not found
}

util.inherits(HttpError, Error);

HttpError.prototype.name = 'HttpError';

HttpError.httpCodes = {
    SUCCESS: 200,
    BADREQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403,
    NOTFOUND: 404, LOCKED: 423, SERVERERROR: 500
};

HttpError.httpErrMessages = {
    200:"OK",
    400: "Server can not handle your request",
    401:"The request has not been applied because it lacks valid authentication credentials for the target resource.",
    404:"Could not Find it",
    500:"Internal Server Error. Sorry We have a Technical problem... Try later"
};

module.exports = {
    HttpError:HttpError
};