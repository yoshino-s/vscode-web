#!/usr/bin/env node

import path from 'path';
import { executeCommand, PROJECT_ROOT } from '../utils.js';

const main = () => {
	const cwd = path.join(PROJECT_ROOT, 'lib/vscode');

	// The upstream `vscode-web-min` task compiles with the legacy TypeScript-to-TypeScript
	// mangler first. Recent VS Code releases can fail that declaration emit on some
	// private/test-only code. Build the regular `out-build` tree first, then run the
	// official CI packaging task that still produces the minified web bundle.
	executeCommand('npm', ['run', 'gulp', 'compile-build-without-mangling'], cwd);
	executeCommand('npm', ['run', 'gulp', 'vscode-web-min-ci'], cwd);
};

main();
