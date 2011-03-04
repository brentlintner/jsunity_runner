var runner = {
    run: function (tests, verbose, onNode) {
        tests.forEach(function (test) {
            require.load(test);
        });

        require('./runner').run(tests, verbose, onNode);
    }
};
