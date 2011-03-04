module.exports = {
    suiteName: "Example Suite",

    // setUpSuite: function () {},
    // tearDownSuite: function () {},
    // setUp: function () {},
    // tearDown: function () {},

    "test example": function (test, runner) {
        test.assertNotNull(null);
    },

    "test example two": function (test, runner) {
        test.assertNull(null);
    }
};
