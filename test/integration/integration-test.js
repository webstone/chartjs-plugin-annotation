'use strict';

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

const {describe, it} = require('mocha');

function exec(command, options = {}) {
  const output = childProcess.execSync(command, {
    encoding: 'utf-8',
    ...options,
  });
  return output && output.trimEnd();
}

describe('Integration Tests', () => {
  const tmpDir = path.join(os.tmpdir(), 'chartjs-plugin-annotation-tmp');
  fs.rmSync(tmpDir, {recursive: true, force: true});
  fs.mkdirSync(tmpDir);

  const distDir = path.resolve('./');
  const archiveName = exec(`npm --quiet pack ${distDir}`, {cwd: tmpDir});
  fs.renameSync(
    path.join(tmpDir, archiveName),
    path.join(tmpDir, 'plugin.tgz'),
  );

  function testOnNodeProject(projectName) {
    const projectPath = path.join(__dirname, projectName);

    const packageJSONPath = path.join(projectPath, 'package.json');
    const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));

    it(packageJSON.description, () => {
      const cwd = path.join(tmpDir, projectName);
      fs.copySync(projectPath, cwd);

      exec('npm --quiet install', {cwd, stdio: 'inherit'});
      exec('npm --quiet test', {cwd, stdio: 'inherit'});
    }).timeout(5 * 60 * 1000);
  }

  testOnNodeProject('ts');
});
