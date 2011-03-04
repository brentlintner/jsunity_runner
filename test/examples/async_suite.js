module.exports = {

    suiteName: "Async Suite",

    "test the time": function (test, runner) {
        var time = new Date().getTime();

        runner.startAsyncTest();

        setTimeout(function () {
            runner.endAsyncTest(function () {
                test.assertTrue(time < new Date().getTime());
            });
        }, 100);
    },

    "test waits": function (test, runner) {
        test.assertTrue(true);
    }

};
