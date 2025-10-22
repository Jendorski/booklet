/* eslint-env node */

module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/strict-type-checked',
        'prettier'
    ],
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unused-imports', '@stylistic'],
    root: true,
    env: { node: true },
    rules: {
        'no-continue': 'off',
        'max-len': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 'off',
        'class-methods-use-this': 'off',
        'import/prefer-default-export': 'off',
        'prefer-promise-reject-errors': 'off',
        '@stylistic/quotes': ['error', 'single'],
        '@stylistic/semi': 'error',
        '@stylistic/no-trailing-spaces': 'error',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'unused-imports/no-unused-imports': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/prefer-promise-reject-errors': 'off',
        '@typescript-eslint/indent': 'off',
        'unused-imports/no-unused-vars': [
            'off',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_'
            }
        ],
        '@typescript-eslint/prefer-destructuring': [
            'error',
            {
                object: true,
                array: true
            }
        ]
    },
    ignorePatterns: ['**/*.cjs', '**/*.js']
};
