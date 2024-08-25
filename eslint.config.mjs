import eslint from '@eslint/js';
// @ts-expect-error: No typings available for this plugin
import eslintPluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';


export default tseslint.config({
    plugins: {
        'import': eslintPluginImport
    },
    languageOptions: {
        parserOptions: {
            project: 'tsconfig.json'
        }
    },
    files: ['src/**/*.ts'],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked
    ],
    rules: {
        'semi': ['error', 'always', { 'omitLastInOneLineClassBody': true, 'omitLastInOneLineBlock': true }],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'arrow-parens': ['error', 'always'],
        'max-len': ['error', { 'code': 160, 'tabWidth': 4 }],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxBOF': 0, 'maxEOF': 0 }],
        'no-trailing-spaces': 'error',
        'eol-last': ['error', 'always'],
        "require-await": "error",
        'sort-imports': ['error', { 'ignoreDeclarationSort': true }],
        'import/newline-after-import': ['error', { 'count': 2, 'considerComments': true }],
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                'groups': [['builtin', 'external'], 'parent', ['internal', 'sibling', 'index', 'object', 'type']],
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
            }
        ]
    },
    settings: {
        'import/internal-regex': '~'
    }
});
