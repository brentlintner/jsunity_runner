module.exports = {
    handle: function (exception, reThrow) {
        reThrow = reThrow || false;

        var eMsg = (exception.name || "no name provided") + "\n\n    " +  (exception.message || "exception caught!"),
        msg = eMsg + "\n\n    " + (exception.stack || "*no stack provided*") + "\n\n";

        console.log("\n    " + msg);

        if (reThrow) {
            throw exception;
        }
    },
    raise: function (exceptionType, message, customExceptionObject) {
        var obj = customExceptionObject || {};
        message = message || "";

        obj.name = exceptionType;
        obj.type = exceptionType;
        obj.message = message;

        console.log("\n    " + obj);

        throw obj;
    }
};
