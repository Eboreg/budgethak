const path = require('path');

module.exports = {
    "mode": "development",
    "entry": "./src/app.js",
    "output": {
        "path": path.resolve(__dirname, '/budgethak/static/budgethak/js'),
        "filename": "bundle.js"
    },
    "module": {
        "rules": [
            {
                "test": /\.css$/,
                "use": [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                "enforce": "pre",
                "test": /\.(js|jsx)$/,
                "exclude": /node_modules/,
                "use": "jshint-loader"
            },
        ]
    }
};
