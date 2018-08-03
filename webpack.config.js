var path = require('path');

module.exports = {
    'mode': 'development',
    'entry': './src/App.js',
    'output': {
        'path': path.resolve(__dirname, 'budgethak/static/budgethak/js'),
        'filename': 'bundle.js',
    },
    'module': {
        'rules': [
            {
                'test': /\.css$/,
                'use': [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                'enforce': 'pre',
                'test': /\.(js|jsx)$/,
                'exclude': /node_modules/,
                'use': 'eslint-loader',
            },
            {
                test: /\.html$/,
                use: 'underscore-template-loader',
            },
        ],
    },
    'resolve': {
        'extensions': [ '.js', '.css', '.html', ],
    },
};
