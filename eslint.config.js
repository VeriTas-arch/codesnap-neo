const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'out/**',
            'ref/**',
            'webview/dist/**'
        ]
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                Buffer: 'readonly',
                ClipboardItem: 'readonly',
                __dirname: 'readonly',
                acquireVsCodeApi: 'readonly',
                console: 'readonly',
                document: 'readonly',
                domtoimage: 'readonly',
                module: 'readonly',
                navigator: 'readonly',
                require: 'readonly',
                window: 'readonly'
            }
        },
        rules: {
            'no-undef': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
    },
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ['**/*.ts']
    })),
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
