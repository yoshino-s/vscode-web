#!/usr/bin/env node

import path from 'path';
import cp from 'child_process';
import fs from 'fs-extra';
import { executeCommand, PROJECT_ROOT } from './utils.js';

const cloneOrFetch = (url, destination, ref, extraArgs = []) => {
	const absoluteDestination = path.join(PROJECT_ROOT, destination);
	if (fs.existsSync(path.join(absoluteDestination, '.git'))) {
		executeCommand('git', ['fetch', '--depth', '1', 'origin', ref], absoluteDestination);
		executeCommand('git', ['checkout', '--detach', 'FETCH_HEAD'], absoluteDestination);
		executeCommand('git', ['reset', '--hard', 'FETCH_HEAD'], absoluteDestination);
		return;
	}

	fs.removeSync(absoluteDestination);
	executeCommand('git', ['clone', '--depth', '1', ...extraArgs, '-b', ref, url, destination], PROJECT_ROOT);
};

const main = () => {
	const ref = cp.execSync(`cat ${path.join(PROJECT_ROOT, '.VERSION')}`).toString().trim();
	if (!ref) {
		throw new Error('Missing VS Code version in .VERSION');
	}

	cloneOrFetch('https://github.com/microsoft/vscode.git', 'lib/vscode', ref, ['--filter=blob:none']);
	cloneOrFetch('https://github.com/microsoft/vscode-loc.git', 'lib/vscode-loc', 'main', ['--filter=blob:none']);

	const vscodePath = path.join(PROJECT_ROOT, 'lib/vscode');
	if (fs.existsSync(path.join(vscodePath, 'package-lock.json'))) {
		executeCommand('npm', ['ci'], vscodePath);
	} else {
		executeCommand('npm', ['install'], vscodePath);
	}
};

main();
