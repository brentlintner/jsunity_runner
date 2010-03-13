// ----------------- Runner ----------------- \\

(jsUnityRunner.Runner = function ($){

	var _suites = [],
		_markup,
		_amountOfTests = 0,
		_amountOfCompletedTests = 0;

    return {

		// Public Properties
		
		// Public Methods
        run: function (whatToRun, verbose){

			try{

				_markup = document.getElementById($.Constants.RUNNER_SELECTOR).innerHTML;

				this.clear();

				$.Logger.verbose = verbose || false;

				switch (whatToRun) {
					
					case "all":
					
						jsUnity.run.apply(jsUnity, _suites);
						break;

					default:
						
						if(!_suites[parseInt(whatToRun, 10)]){
							$.Exception.raise($.Exception.types.TestSuite, "Uknown test suite, can not run Test Suite(s).");
						}else{
							jsUnity.run(_suites[parseInt(whatToRun, 10)]);
						}
						
				}

			}
			catch(e){
				$.Logger.log(e);
				$.Exception.handle(e);
			}

        },

		loadTests: function (){
			var suite,
				count = 0;

			for (suite in $.Tests){ if($.Tests.hasOwnProperty(suite)){
				_suites.push($.Tests[suite]);
				this.loadOption($.Tests[suite], count);
				count++;
			}}

		},

		loadOption: function (suite, count){

			document.getElementById($.Constants.RUNNER_SELECTOR).appendChild($.Utils.createElement("option", {
					"value": count,
					"innerHTML":  suite.suiteName || "Uknown Test Suite"
				}));

		},

		clear: function (){
			document.getElementById($.Constants.PROGRESS_SCROLL).style.width = 0;
			document.getElementById($.Constants.PROGRESS_DIV).innerHTML = "";
			_amountOfTests = 0;
			_amountOfCompletedTests = 0;
			$.Logger.clear();
		},
		
		resetMarkup: function (){
			document.getElementById($.Constants.MARKUP_DIV).innerHTML = _markup;
		},

		// methods called fby jsUnity itself

		updateResults: function (results){
            $.Logger.log("<br /><br /><strong>RESULTS:</strong><br />");
            $.Logger.log(results.passed + " passed");
            $.Logger.log(results.failed + " failed");
            $.Logger.log(results.duration + " elapsed");
		},

		updateProgress: function (){
			_amountOfCompletedTests++;
			document.getElementById($.Constants.PROGRESS_DIV).innerHTML = _amountOfCompletedTests + " /" + _amountOfTests;
			document.getElementById($.Constants.PROGRESS_SCROLL).style.width = ((_amountOfCompletedTests / _amountOfTests) * 100) + "%";
		},

		updateAmountOfTests: function (suiteLength){
			_amountOfTests += suiteLength;
		},

		passTest: function (test){
			$.Logger.log('[PASSED]' + test.name, "green");
			this.updateProgress();
		},

		failTest: function (test, error){
			$.Logger.log('[FAILED]' + test.name + ' :: ' + error, "red");
			$.Logger.warn(test.name + " --> " + error);
			this.updateProgress();
		},

		startSuite: function (suite, count, countStr){

			if(suite.resetMarkup === true) {
				this.resetMarkup();
			}
			
			$.Logger.warn("<strong>Running " + (suite.suiteName || "unnamed test suite") + "</strong>");
			$.Logger.warn(countStr + " found");
			$.Logger.log("------- " + suite.suiteName + "-------");
			
		}
        
    };
    
}(jsUnityRunner));

