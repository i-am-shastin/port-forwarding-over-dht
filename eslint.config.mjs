import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';


export default tseslint.config({
    plugins: {
        'import': eslintPluginImport
    },
    files: ['src/**/*.ts', '*.mjs'],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended
    ],
    rules: {
        'semi': ['error', 'always', { 'omitLastInOneLineClassBody': true, 'omitLastInOneLineBlock': true }],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'arrow-parens': ['error', 'always'],
        'max-len': ['error', { 'code': 160, 'tabWidth': 4 }],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'sort-imports': ['error', { 'ignoreDeclarationSort': true }],
        'import/newline-after-import': ['error', { 'count': 2 }],
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                'groups': ['builtin', 'external', 'parent', ['internal', 'sibling', 'index', 'object', 'type']],
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
            }
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxBOF': 0, 'maxEOF': 0 }],
        'no-trailing-spaces': 'error',
        'eol-last': ['error', 'always']
    },
    settings: {
        'import/internal-regex': '~'
    }
});
