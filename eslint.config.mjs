import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';


export default tseslint.config({
    plugins: {
        import: eslintPluginImport,
        jsdoc
    },
    languageOptions: {
        parserOptions: {
            project: 'tsconfig.json'
        }
    },
    files: ['src/**/*.ts', 'eslint.config.mjs'],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked
    ],
    rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'caughtErrorsIgnorePattern': '^_'
            }
        ],
        'array-bracket-spacing': ['error', 'never'],
        'arrow-parens': ['error', 'always'],
        'eol-last': ['error', 'always'],
        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        'import/newline-after-import': ['error', { 'count': 2, 'considerComments': true }],
        'import/no-duplicates': ['error', { 'prefer-inline': false }],
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                'groups': [['builtin', 'external'], 'parent', ['internal', 'sibling', 'index', 'object'], 'type'],
                'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
            }
        ],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'jsdoc/require-jsdoc': [
            'error',
            {
                'enableFixer': false,
                'publicOnly': true,
                'exemptEmptyConstructors': true,
                'checkGetters': false,
                'require': { 'MethodDefinition': true },
                'contexts': ['TSAbstractMethodDefinition[accessibility="public"]']
            }
        ],
        'max-len': ['error', { 'code': 160, 'tabWidth': 4 }],
        'no-multi-spaces': 'error',
        'no-multiple-empty-lines': ['error', { 'max': 2, 'maxBOF': 0, 'maxEOF': 0 }],
        'no-trailing-spaces': 'error',
        'object-curly-spacing': ['error', 'always'],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        'require-await': 'error',
        'semi': ['error', 'always', { 'omitLastInOneLineClassBody': true, 'omitLastInOneLineBlock': true }],
        'sort-imports': ['error', { 'ignoreDeclarationSort': true }]
    },
    settings: {
        'import/internal-regex': '~'
    }
});
