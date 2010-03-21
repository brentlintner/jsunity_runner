(jsUnityRunner.API = function ($){

	var _suites = [],
		_suiteNames = [],
		_asyncSuiteIndex,
		_asyncTestIndex,
        _currentSuite,
        _currentTest,
        // flag for asynchronous Test sections (setup, test, teardown)
        _asyncSectionShouldWait = false,
        _defaultWaitInterval = 5000,
        _waitInterval = 5000,
        _assertCallbackWasCalled = false;

    // copied from jsUnity since its a private method.
	function _plural(cnt, unit) {
        return cnt + " " + unit + (cnt == 1 ? "" : "s");
    }

    function _jsUnityError(e){
        return (e.name && e.message) ? false : true;
    }

    function _processsor(event, stopTime, errorMessage){
        
        var now = (new Date()).getTime();

        if(_asyncSectionShouldWait && stopTime > now){
            setTimeout(function() {
                _processsor(event, stopTime, errorMessage);
            }, 100);
        }
        else{
            // TODO: figure out logic to stop additional setTimeout fails when expecting a callback assert (with _assertCallbackWasCalled)
            if (_asyncSectionShouldWait) {
                _currentTest.failed = true;
                _currentTest.messages.push(errorMessage + "Test failed due to timeout!");
            }

            _asyncSectionShouldWait = false;
            _assertCallbackWasCalled = false;
            setTimeout(function (){
				$.Event.trigger(event);
			}, 0);
        }

    }

    function _assertCallbackInCurrentTestScope(callback, scope){
        $.Utils.validateArgumentType(callback, "function");

        try{
            callback.call(scope);
        }
        catch(e){

            if(!_jsUnityError(e)){
                $.Exception.handle(e);
            }

            _currentTest.failed = true;
            _currentTest.messages.push("Failed at TestRun with error: " + e);

        }
    }

	return {

        // override of jsUnity.run
        // returns the total amount of tests
        run: function(){

			var i;

			_asyncTestIndex = 0;
			_asyncSuiteIndex = 0;
			_suites = [];
			_suiteNames = [];

			for (i = 0; i < arguments.length; i++) {
				// TODO: validate a Test Suite
				try {
					_suites.push(jsUnity.compile(arguments[i]));
				}
				catch (e) {
					if($.Console.isAvailable()) {$.Console.error("TestSuite exception :: " + e); }
					return false;
				}
			}

			// initiate asynchronous scenario
			setTimeout(function (){
				$.Event.trigger($.Event.eventTypes.asyncSuite);
			}, 0);

		},


        // API methods
        bindEvents: function(){
        
            var i,
                events = [
                  $.Event.eventTypes.asyncSuite,
                  $.Event.eventTypes.asyncTest,
                  $.Event.eventTypes.asyncSetUp,
                  $.Event.eventTypes.asyncTestRun,
                  $.Event.eventTypes.asyncTearDown,
                  $.Event.eventTypes.asyncProceedToNext
                ],
                addEventCallback = function(event){
                                return(function(){ $.API[event](); });
                            };

            for (i = 0; i < events.length; i++) {
                $.Event.on(events[i], addEventCallback(events[i]));
            }
            
        },

        // makes the runner stop at whatever point in a test (setUp, test or tearDown) and wait until shouldWait is toggled again
        startAsyncTest: function(waitInterval) {
            _asyncSectionShouldWait = true;
            _waitInterval = waitInterval || _waitInterval;
        },

        endAsyncTest: function(callback, scope) {
            if(callback){
                _assertCallbackInCurrentTestScope(callback, scope);
                _assertCallbackWasCalled = true;
            }
            _asyncSectionShouldWait = false;
            _waitInterval = _defaultWaitInterval;
        },

        // async methods
        // iterate over test suites to be run
		asyncSuite: function (){

			// "recursive" base case
			if(_asyncSuiteIndex < _suites.length){

				var suite = _suites[_asyncSuiteIndex],
				suiteLength = suite.tests.length;

				$.Runner.startSuite(suite, suiteLength, _plural(suiteLength, "test"));

				_suiteNames.push(suite.suiteName);

				setTimeout(function (){
					$.Event.trigger($.Event.eventTypes.asyncTest);
				}, 0);

			}
            else{  $.Runner.end(); }


        },

        // iterate through current test suite's tests
		asyncTest: function (){

            _currentSuite = _suites[_asyncSuiteIndex];
			_currentTest = _suites[_asyncSuiteIndex].tests[_asyncTestIndex];
            _currentTest.messages = [];
            _currentTest.failed = false;

            setTimeout(function (){
                $.Event.trigger($.Event.eventTypes.asyncSetUp);
            }, 0);
		},

        asyncSetUp: function(){
            try{
                if(_currentSuite.setUp){
                    _currentSuite.setUp();
                }

                _processsor($.Event.eventTypes.asyncTestRun, (new Date()).getTime() + _waitInterval, "Failed at SetUp :: ");
            }
            catch(e){

                if(!_jsUnityError(e)){
                    $.Exception.handle(e);
                }

                _currentTest.failed = true;
                _currentTest.messages.push("Failed at SetUp with error: " + e);

                _processsor($.Event.eventTypes.asyncTestRun, (new Date()).getTime() + _waitInterval, "Failed at SetUp :: ");
//                _processsor($.Event.eventTypes.asyncTearDown, (new Date()).getTime(), "Failed at SetUp :: ");
            }
        },

        asyncTestRun: function(){

            try{
				_currentTest.fn.call(_currentSuite.scope);

                _processsor($.Event.eventTypes.asyncTearDown, (new Date()).getTime() + _waitInterval, "Failed at TestRun :: ");
            }
            catch(e){
                if(!_jsUnityError(e)){
                    $.Exception.handle(e);
                }

                _currentTest.failed = true;
                _currentTest.messages.push("Failed at TestRun with error: " + e);

                _processsor($.Event.eventTypes.asyncTearDown, (new Date()).getTime(), "Failed at TestRun :: ");
            }

        },

        asyncTearDown: function(){
            try{
                if(_currentSuite.tearDown){
                    _currentSuite.tearDown();
                }
                _processsor($.Event.eventTypes.asyncProceedToNext, (new Date()).getTime() + _waitInterval, "Failed at TearDown :: ");
            }
            catch(e){
                if(!_jsUnityError(e)){
                    $.Exception.handle(e);
                }

                _currentTest.failed = true;
                _currentTest.messages.push("Failed at TearDown with error: " + e);

                _processsor($.Event.eventTypes.asyncProceedToNext, (new Date()).getTime(), "Failed at TearDown :: ");
            }
        },

        asyncProceedToNext: function() {

            $.Runner.updateProgress(_currentTest);

            _asyncTestIndex++;

			if(_asyncTestIndex < _currentSuite.tests.length){

				setTimeout(function (){
					$.Event.trigger($.Event.eventTypes.asyncTest);
				}, 0);

			}else{
				// all done, go to next Test Suite
				_asyncSuiteIndex++;
				_asyncTestIndex = 0;

				setTimeout(function (){
					$.Event.trigger($.Event.eventTypes.asyncSuite);
				}, 0);
			}
        }


	};

}(jsUnityRunner));