const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: ['commitlint.config.mjs', 'src/commands/options.ts'],
  ignoreBinaries: ['gitleaks'],
  ignoreDependencies: [
    '@commitlint/config-conventional',
    '@stryker-mutator/api',
    'gitleaks',
  ],
  tags: ['-lintignore'],
};

export default knipConfig;
