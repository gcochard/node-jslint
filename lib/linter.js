var JSLINT = require("../lib/nodelint"),
    path = require('path'),
    fs = require('fs');

function removeJsComments(str) {
    'use strict';
    str = str || '';
    str = str.replace(/\/\*[\s\S]*(?:\*\/)/g, ''); //everything between "/* */"
    str = str.replace(/\/\/[^\n\r]*/g, ''); //everything after "//"
    return str;
}

function loadAndParseConfig(filePath) {
    'use strict';
    return fs.existsSync(filePath) ?
            JSON.parse(removeJsComments(fs.readFileSync(filePath, 'utf-8'))) : {};
}

function mergeConfigs(homerc) {
    'use strict';
    var homeConfig = loadAndParseConfig(homerc),
        prop,
        i,
        ii,
        conf;
    if(arguments.length>1){
        for(i=1,ii=arguments.length-1;i<ii;i++){
            conf = loadAndParseConfig(arguments[i]);
            for (prop in conf) {
                if(typeof prop === 'string') {
                    homeConfig[prop] = conf[prop];
                }
            }
        }
    }

    return homeConfig;
}

function addDefaults(options) {
    'use strict';
    var defaultConfig = path.join(process.env.HOME, '.jslintrc'),
        projectConfig = path.join(process.cwd(), '.jslintrc'),
        config = mergeConfigs(defaultConfig, projectConfig),
        opt;
    for (opt in config) {
        if (typeof opt === 'string') {
            if(!options.hasOwnProperty(opt)) {
                options[opt] = config[opt];
            }
        }
    }
    return options;
}

exports.lint = function (script, options) {
    'use strict';
    // remove shebang
    /*jslint regexp: true*/
    script = script.replace(/^\#\!.*/, "");

    options = options || {};
    delete options.argv;
    options = addDefaults(options);

    var ok = JSLINT(script, options),
        result = {
            ok: true,
            errors: []
        };

    if (!ok) {
        result = JSLINT.data();
        result.ok = ok;
    }

    result.options = options;

    return result;
};
