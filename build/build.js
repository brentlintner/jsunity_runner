module.exports = function () {
    var buffer = "",
        fs = require('fs'),
        modules = [
            "jsunity",
            "event",
            "exception",
            "processor",
            "runner"
        ];

    buffer += fs.readFileSync(__dirname + "/../thirdparty/browser-require/require.js", "utf-8");

    modules.forEach(function (file) {
        buffer += "require.define('" + file + "', function (require, module, exports) {\n" +
                      fs.readFileSync(__dirname + "/../lib/" + file + ".js", "utf-8") +
                  "});\n"
    });

    buffer += fs.readFileSync(__dirname + "/../lib/browser.js", "utf-8");

    fs.writeFile('runner.js', buffer, "utf-8", function (err) {
        if (err) throw err;
        require('sys').puts("created runner.js");
    });
};
