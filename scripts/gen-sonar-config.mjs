import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import testExclude from '../test-exclude.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const propertiesPath = path.resolve(__dirname, '..', 'sonar-project.properties');

const coverageExclusions = ['**/*.spec.ts', ...testExclude].join(',');
const cpdExclusions = ['**/*.spec.ts', '**/*.e2e-spec.ts'].join(',');

const content = readFileSync(propertiesPath, 'utf8');

const updated = content
  .replace(
    /^sonar\.coverage\.exclusions=.*$/m,
    () => `sonar.coverage.exclusions=${coverageExclusions}`,
  )
  .replace(
    /^sonar\.cpd\.exclusions=.*$/m,
    () => `sonar.cpd.exclusions=${cpdExclusions}`,
  );

writeFileSync(propertiesPath, updated);

console.log('✅ sonar-project.properties updated');
console.log(`   sonar.coverage.exclusions=${coverageExclusions}`);
console.log(`   sonar.cpd.exclusions=${cpdExclusions}`);
