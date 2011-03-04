var exception = require('./exception'),
    _results = {
        "totalTests": 0,
        "completedTests": 0,
        "failedTests": 0,
        "passedTests": 0
    },
    _progress_failed = false,
    _startTime, _verbose;

module.exports = {
    run: function (tests, verbose, onNode) {
        _verbose = verbose || false;
        _startTime = new Date().getTime();
        require('./processor').run(tests, onNode);
    },

    complete: function () {
        var endTime = (new Date().getTime() - _startTime),
        total = _results.passedTests + _results.failedTests;
        console.log("\n" + endTime + " ms" +
                    " (" + total + " tests) " + _results.failedTests + 
                    " failed " + _results.passedTests + " passed");

    },

    updateProgress: function (test) {
        if (test.failed) {
            _progress_failed = true;
            _results.failedTests++;
            console.log('[FAIL]  ' + test.name.replace(/^test\s?/, "") + ' \n');
            test.exceptions.forEach(function (exception) {
                if (typeof exception === "string") {
                    console.log(exception + "\n");
                } else {
                    exception.handle(exception);
                }
            });
        } else {
            _results.passedTests++;
            console.log('[PASS]  ' + test.name.replace(/^test\s?/, ""));
        }

        _results.completedTests++;
    },

    notifySuiteStart: function (suite) {
        console.log("\n" + (suite.suiteName || "unnamed suite") + " :: " + suite.tests.length + " tests\n");
    }
};

//var _results = {
//        "totalTests": 0,
//        "completedTests": 0,
//        "failedTests": 0,
//        "passedTests": 0
//    },
//    colors = require('./../thirdparty/nodejs-termcolors/lib/termcolors').colors,
//    _progress_failed = false,
//    _startTime, _verbose;
//
//module.exports = {
//    run: function (tests, verbose, browser) {
//        _verbose = verbose || false;
//        _startTime = new Date().getTime();
//        require('./processor').run(tests);
//    },
//
//    complete: function () {
//        var endTime = (new Date().getTime() - _startTime),
//        total = _results.passedTests + _results.failedTests;
//        console.log("\n" + colors.lgray(endTime + " ms", true) +
//                    " (" + total + " tests) " + colors.red(colors.bold(_results.failedTests), true) + 
//                    " failed " + colors.green(colors.bold(_results.passedTests), true) + " passed\n");
//
//    },
//
//    updateProgress: function (test) {
//        if (test.failed) {
//            _progress_failed = true;
//            _results.failedTests++;
//            console.log(colors.bold(colors.red('x', true), true) + '  ' + test.name.replace(/^test\s?/, "") + ' \n');
//            test.exceptions.forEach(function (exception) {
//                if (typeof exception === "string") {
//                    console.log(exception + "\n");
//                } else {
//                    $.Exception.handle(exception);
//                }
//            });
//        } else {
//            _results.passedTests++;
//            console.log(colors.bold(colors.green(new Buffer('\u2713').toString("utf-8", 0), true), true) + '  ' + colors.lgray(test.name.replace(/^test\s?/, ""), true));
//        }
//
//        _results.completedTests++;
//    },
//
//    notifySuiteStart: function (suite) {
//        console.log(colors.bold(colors.lgray("\n" + (suite.suiteName || "unnamed suite") + " :: " + suite.tests.length + " tests\n", true), true));
//    }
//};
