var fs = require('fs'),
    sys = require('sys');

function _help() {
    sys.print(fs.readFileSync(__dirname + "/../HELP", "utf-8"));
}

function _collect(path, files) {
    if (fs.statSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (item) {
            _collect(require('path').join(path, item), files);
        });
    } else if (path.match(/\.js$/)) {
        files.push(path);
    }
}

module.exports = {
    interpret: function (args) {
        var runner,
            files = [],
            options = require('argsparser').parse(args),
            verbose = ["--options"],
            category = ["--category"],
            targets = typeof options.node === "string" ?
                null : options.node.slice(1);

        if (!targets || options["--help"]) {
            _help();
            return;
        }

        targets.forEach(function (target) {
            _collect(target, files);
        });

        require('./runner').run(files, verbose, true);
    }
};
