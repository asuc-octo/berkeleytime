module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 12,
		sourceType: 'module'
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/jsx-runtime',
		'prettier'
	],
	plugins: ['react'],
	rules: {
		'no-labels': 'off',
		'no-console': 'warn',
		'react/prop-types': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_' }]
	},
	ignorePatterns: ['build', '**/*.js', '**/*.json', 'node_modules'],
	settings: {
		react: {
			version: 'detect'
		}
	}
};
