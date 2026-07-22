#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from './utils.js';

const version = process.argv[2]?.trim();
if (!version) {
	console.error('Usage: node scripts/set-version.js <vscode-version-or-tag>');
	process.exit(1);
}

const normalized = version.replace(/^v/, '');
fs.writeFileSync(path.join(PROJECT_ROOT, '.VERSION'), `${normalized}\n`);

const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = normalized;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, '\t')}\n`);
