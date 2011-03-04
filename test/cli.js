var sys = require('sys'),
    fs = require('fs'),
    cli = require('./../lib/cli');

describe("cli", function () {

    it("interprets --help with no args", function () {
        var txt = require('fs').readFileSync(__dirname + "/../HELP", "utf-8");

        spyOn(sys, "print");

        cli.interpret(["node", "file.js"]);

        expect(sys.print.mostRecentCall.args[0]).toEqual(txt);
    });

    it("interprets --help", function () {
        var txt = require('fs').readFileSync(__dirname + "/../HELP", "utf-8");

        spyOn(sys, "print");

        cli.interpret(["node", "file.js", "--help"]);

        expect(sys.print.mostRecentCall.args[0]).toEqual(txt);
    });

});
