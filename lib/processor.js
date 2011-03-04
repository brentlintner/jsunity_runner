var _suites = [],
    jsUnity = require('./jsunity').jsUnity,
    exception = require('./exception'),
    event = require('./event'),
    runner = require('./runner'),
    _asyncSuiteIndex,
    _asyncTestIndex,
    _currentSuite,
    _currentTest,
    _asyncProcessShouldWait = false,
    _waitInterval = 5000,
    _endAsyncWasCalled = false,
    _terminated = false,
    _resumeEvents, 
    _self;

function _processor(task, shouldWait) {
    if (_terminated) {
        _resumeEvents.push(function () {
            _processor(task, shouldWait);
        });
        return;
    }

    // want first in boolean exp to always call it for now (hack)
    if ((shouldWait && shouldWait.call()) || _asyncProcessShouldWait) {
        setTimeout(function () {
            _processor(task, shouldWait);
        }, 1);
    } else {
        if (typeof task === "function") {
            task.call();
        } else {
            event.trigger(task);
        }
    }
}

function _applyToCurrentTest(callback, scope) {
    try {
        callback.call(scope, jsUnity.assertions, this);
    } catch (e) {
        _currentTest.failed = true;
        e.message = "Failed at TestRun with error: " + e.message;
        _currentTest.exceptions.push(e);
    }
}

self = module.exports = {
    // like jsUnity.run
    run: function (tests, onNode) {
        _asyncTestIndex = 0;
        _asyncSuiteIndex = 0;
        _suites = [];
        _terminated = false;
        _resumeEvents = [];

        tests.forEach(function (test) {
            _suites.push(jsUnity.compile(require((onNode ? process.cwd() + "/" : "") + test)));
        });

        // initiate asynchronous scenario
        _processor("asyncSuite");
    },

    terminate: function () {
        if (!_terminated) _terminated = true;
    },

    resume: function () {
        if (_terminated) {
            _terminated = false;
            for (var i = 0; i < _resumeEvents.length; i++) {
                _resumeEvents[i].call(this);
            }
            _resumeEvents = [];
        }
    },

    startAsyncTest: function (waitInterval) {
        var time = new Date().getTime() + (waitInterval || _waitInterval);

        _asyncProcessShouldWait = true;

        // a process to flip wait back after a certain amount of time
        _processor(function () {}, function () {
            if (new Date().getTime() > time || _endAsyncWasCalled) {
                if (!_endAsyncWasCalled) {
                    _currentTest.failed = true;
                    _currentTest.exceptions.push({
                        name: "",
                        message: "Test failed due to timeout!"
                    });
                }
                _endAsyncWasCalled = false;
                _asyncProcessShouldWait = false;
                return false;
            } else {
                return true;
            }
        });
    },

    endAsyncTest: function (callback, scope) {
        if (callback) {
            _applyToCurrentTest(callback, scope);
        }
        _endAsyncWasCalled = true;
    },

    // async methods
    // iterate over test suites to be run
    asyncSuite: function () {
        try {
            if (_currentSuite && _currentSuite.scope && _currentSuite.scope.tearDownSuite && typeof _currentSuite.scope.tearDownSuite === "function") {
                _currentSuite.scope.tearDownSuite.call(_currentSuite.scope, jsUnity.assertions, this);
            }
        } catch (e) {
            exception.handle(e);
        }

        // "recursive" base case
        if (_asyncSuiteIndex < _suites.length) {
            _currentSuite = _suites[_asyncSuiteIndex];
            runner.notifySuiteStart(_currentSuite);

            try {
                if (_currentSuite && _currentSuite.scope && _currentSuite.scope.setUpSuite && typeof _currentSuite.scope.setUpSuite === "function") {
                    _currentSuite.scope.setUpSuite.call(_currentSuite.scope, jsUnity.assertions, this);
                }
            } catch (f) {
                exception.handle(f);
            }

            _processor("asyncTest");
        } else {
            runner.complete();
        }
    },

    asyncTest: function () {
        _currentTest = _suites[_asyncSuiteIndex].tests[_asyncTestIndex];
        _currentTest.exceptions = [];
        _currentTest.failed = false;

        _processor("asyncSetUp");
    },

    asyncSetUp: function () {
        this.asyncSuiteStep(_currentSuite.setUp, [jsUnity.assertions, this], null, "asyncTestRun", "SetUp");
    },

    asyncTestRun: function () {
        this.asyncSuiteStep(_currentTest.fn, [jsUnity.assertions, this], _currentSuite.scope, "asyncTearDown", "TestRun");
    },

    asyncTearDown: function () {
        this.asyncSuiteStep(_currentSuite.tearDown, [jsUnity.assertions, this], null, "asyncProceedToNext", "TearDown");
    },

    asyncSuiteStep: function (method, args, scope, nextEvent, currentEvent) {
        var timestamp = new Date().getTime();
        try {
            if (method && typeof method === "function") {
                method.apply(scope, args);
            }
            _processor(nextEvent);
        } catch (e) {
            _currentTest.failed = true;
            e.message = "Failed at " + currentEvent + " with error: " + e.message;
            _currentTest.exceptions.push(e);
            _processor(nextEvent);
        }
    },

    asyncProceedToNext: function () {
        runner.updateProgress(_currentTest);
        _asyncTestIndex++;

        if (_asyncTestIndex < _currentSuite.tests.length) {
            _processor("asyncTest");
        } else {
            // all done, go to next Test Suite
            _asyncSuiteIndex++;
            _asyncTestIndex = 0;

            _processor("asyncSuite");
        }
    }
};

// bind some events and override some jsunity methods
var i,
    events = [
        "asyncSuite",
        "asyncTest",
        "asyncSetUp",
        "asyncTestRun",
        "asyncTearDown",
        "asyncProceedToNext"
    ],
    addEventCallback = function (event) {
        return function () {
            self[event]();
        };
    };

for (i = 0; i < events.length; i++) {
    event.on(events[i], addEventCallback(events[i]));
}
