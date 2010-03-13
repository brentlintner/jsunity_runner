// ----------------- Error/Log handling ----------------- \\
(jsUnityRunner.Logger = function ($){

    var LOGGER_DIV = "test_logger",
		INFO_LOGGER_DIV = "info_logger",
		PROGRESS_DIV = "progress_text",
		PROGRESS_SCROLL = "progress_scroll";

    return {

        verbose: false,
        amountOfTests: 0,
        amountOfCompletedTests: 0,

        warn: function (e){
			if(this.verbose){
				document.getElementById(INFO_LOGGER_DIV).innerHTML += e + "<br />";
			}
        },

        log: function (e){
            document.getElementById(LOGGER_DIV).innerHTML += e + "<br />";
        },
        
        debug: function (e){
            if(this.verbose){
                document.getElementById(INFO_LOGGER_DIV).innerHTML += "<span style=\"color: #FF4848\">"+e+"</span><br />";
            }
        },

        clear: function (){
            document.getElementById(LOGGER_DIV).innerHTML = "";
            document.getElementById(INFO_LOGGER_DIV).innerHTML = "";
            document.getElementById(PROGRESS_SCROLL).style.width = 0;
            document.getElementById(PROGRESS_DIV).innerHTML = "";
            this.amountOfTests = 0;
            this.amountOfCompletedTests = 0;
        },

		updateResults: function (results){
            this.log("<br /><br /><strong>RESULTS:</strong><br />");
            this.log(results.passed + " passed");
            this.log(results.failed + " failed");
            this.log(results.duration + " elapsed");
		},

		updateProgress: function (){
			this.amountOfCompletedTests++;
			document.getElementById(PROGRESS_DIV).innerHTML = this.amountOfCompletedTests + " /" + this.amountOfTests;
			document.getElementById(PROGRESS_SCROLL).style.width = ((this.amountOfCompletedTests / this.amountOfTests) * 100) + "%";
		},

		updateAmountOfTests: function (suiteLength){
			this.amountOfTests += suiteLength;
		},

		passTest: function (test){
			this.log('<span style="color: green;">[PASSED]</span>&nbsp;&nbsp;' + test.name);
			this.updateProgress();
		},

		failTest: function (test, error){
			this.log('<span style="color: red;">[FAILED]</span>&nbsp;&nbsp;' + test.name + ' :: ' + error);
			this.warn(test.name + " --> " + error);
			this.updateProgress();
		},

		startSuite: function (suite, count, countStr){

			if(suite.resetMarkup === true) {
				$.Runner.resetMarkup();
			}
			
			this.warn("<strong>Running " + (suite.suiteName || "unnamed test suite") + "</strong>");
			this.warn(countStr + " found");
			this.log("------- " + suite.suiteName + "-------");
		}
		
        
    };
    
}(jsUnityRunner));