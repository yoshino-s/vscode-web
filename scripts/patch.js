#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { PROJECT_ROOT } from './utils.js';

const VSCODE_ROOT = path.join(PROJECT_ROOT, 'lib/vscode');

const replaceOnce = (file, search, replacement) => {
	const target = path.join(VSCODE_ROOT, file);
	let content = fs.readFileSync(target, 'utf8');
	if (content.includes(replacement)) {
		return;
	}
	if (!content.includes(search)) {
		throw new Error(`Patch anchor not found in ${file}`);
	}
	content = content.replace(search, replacement);
	fs.writeFileSync(target, content);
};

const appendOnce = (file, marker, addition) => {
	const target = path.join(VSCODE_ROOT, file);
	let content = fs.readFileSync(target, 'utf8');
	if (content.includes(marker)) {
		return;
	}
	content = `${content.trimEnd()}\n\n${addition}\n`;
	fs.writeFileSync(target, content);
};

const copyDeclarationFile = () => {
	fs.copyFileSync(
		path.join(PROJECT_ROOT, 'src/setup.d.ts'),
		path.join(VSCODE_ROOT, 'src/setup.d.ts'),
	);
};

const patchWorkbenchGlobals = () => {
	replaceOnce(
		'src/vs/workbench/contrib/files/browser/editors/fileEditorInput.ts',
		`\tprivate allowLabelOverride(): boolean {\n\t\treturn this.resource.scheme !== this.pathService.defaultUriScheme &&`,
		`\tprivate allowLabelOverride(): boolean {\n\t\t/* below codes are changed by github1s */\n\t\tif (globalThis._VSCODE_WEB?.allowEditorLabelOverride) {\n\t\t\treturn true;\n\t\t}\n\t\t/* above codes are changed by github1s */\n\n\t\treturn this.resource.scheme !== this.pathService.defaultUriScheme &&`,
	);

	replaceOnce(
		'src/vs/workbench/browser/web.main.ts',
		`\t\t// Multi-root workspace\n\t\tif (workspace && isWorkspaceToOpen(workspace)) {\n\t\t\treturn getWorkspaceIdentifier(workspace.workspaceUri);\n\t\t}\n\n\t\t// Single-folder workspace\n\t\tif (workspace && isFolderToOpen(workspace)) {\n\t\t\treturn getSingleFolderWorkspaceIdentifier(workspace.folderUri);\n\t\t}\n\n\t\t// Empty window workspace\n\t\treturn UNKNOWN_EMPTY_WINDOW_WORKSPACE;`,
		`\t\t/* below codes are changed by github1s */\n\t\tconst id = globalThis._VSCODE_WEB?.workspaceId;\n\n\t\t// Multi-root workspace\n\t\tif (workspace && isWorkspaceToOpen(workspace)) {\n\t\t\tconst identifier = getWorkspaceIdentifier(workspace.workspaceUri);\n\t\t\treturn id ? { ...identifier, id } : identifier;\n\t\t}\n\n\t\t// Single-folder workspace\n\t\tif (workspace && isFolderToOpen(workspace)) {\n\t\t\tconst identifier = getSingleFolderWorkspaceIdentifier(workspace.folderUri);\n\t\t\treturn id ? { ...identifier, id } : identifier;\n\t\t}\n\n\t\t// Empty window workspace\n\t\treturn id ? { id } : UNKNOWN_EMPTY_WINDOW_WORKSPACE;\n\t\t/* above codes are changed by github1s */`,
	);

	replaceOnce(
		'src/vs/workbench/services/label/common/labelService.ts',
		`\tgetWorkspaceLabel(workspace: IWorkspace | IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI, options?: { verbose: Verbosity }): string {\n\t\tif (isWorkspace(workspace)) {`,
		`\tgetWorkspaceLabel(workspace: IWorkspace | IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI, options?: { verbose: Verbosity }): string {\n\t\t/* below codes are changed by github1s */\n\t\tif (globalThis._VSCODE_WEB?.workspaceLabel) {\n\t\t\treturn globalThis._VSCODE_WEB.workspaceLabel;\n\t\t}\n\t\t/* above codes are changed by github1s */\n\n\t\tif (isWorkspace(workspace)) {`,
	);

	replaceOnce(
		'src/vs/workbench/services/textfile/browser/textFileService.ts',
		`\t\tthis.files = this._register(this.instantiationService.createInstance(TextFileEditorModelManager));\n\t\tthis.untitled = untitledTextEditorService;\n\n\t\tthis.provideDecorations();`,
		`\t\tthis.files = this._register(this.instantiationService.createInstance(TextFileEditorModelManager));\n\t\tthis.untitled = untitledTextEditorService;\n\n\t\t/* below codes are changed by github1s */\n\t\tif (!globalThis._VSCODE_WEB?.hideTextFileLabelDecorations) {\n\t\t\tthis.provideDecorations();\n\t\t}\n\t\t/* above codes are changed by github1s */`,
	);

	replaceOnce(
		'src/vs/workbench/services/extensionManagement/browser/builtinExtensionsScannerService.ts',
		`\t\t\t\tthis.builtinExtensionsPromises = bundledExtensions.map(async e => {`,
		`\t\t\t\t// below codes are changed by github1s\n\t\t\t\tif (Array.isArray(globalThis._VSCODE_WEB?.builtinExtensions)) {\n\t\t\t\t\tbundledExtensions.push(...globalThis._VSCODE_WEB.builtinExtensions);\n\t\t\t\t} else if (typeof globalThis._VSCODE_WEB?.builtinExtensions === 'function') {\n\t\t\t\t\tbundledExtensions = globalThis._VSCODE_WEB.builtinExtensions(bundledExtensions);\n\t\t\t\t}\n\t\t\t\t// above codes are changed by github1s\n\n\t\t\t\tthis.builtinExtensionsPromises = bundledExtensions.map(async e => {`,
	);
};

const patchResourcePaths = () => {
	replaceOnce(
		'src/vs/base/common/network.ts',
		`export const nodeModulesPath: AppResourcePath = 'vs/../../node_modules';`,
		`/* below codes are changed by github1s */\n// Cloudflare Pages cannot upload \`node_modules\`, we renamed it to \`dependencies\`\nexport const nodeModulesPath: AppResourcePath = 'vs/../../dependencies';\n/* above codes are changed by github1s */`,
	);
};

const patchActivityBarLogo = () => {
	replaceOnce(
		'src/vs/workbench/browser/parts/activitybar/activitybarPart.ts',
		`\t\tthis.element = parent;\n\t\tthis.content = append(this.element, $('.content'));`,
		`\t\tthis.element = parent;\n\t\tthis.content = append(this.element, $('.content'));\n\n\t\t/* below codes are changed by github1s */\n\t\tif (globalThis._VSCODE_WEB?.logo) {\n\t\t\tconst logo = globalThis._VSCODE_WEB.logo;\n\t\t\tconst homeBarContainer = document.createElement('div');\n\t\t\thomeBarContainer.className = 'home-bar';\n\t\t\tif (logo.icon) {\n\t\t\t\tconst logoImage = \`url(\${window.encodeURI(logo.icon)})\`;\n\t\t\t\thomeBarContainer.style.maskImage = logoImage;\n\t\t\t\thomeBarContainer.style.webkitMaskImage = logoImage;\n\t\t\t}\n\t\t\tif (logo.title) {\n\t\t\t\thomeBarContainer.title = logo.title;\n\t\t\t}\n\t\t\tif (logo.onClick) {\n\t\t\t\thomeBarContainer.onclick = logo.onClick;\n\t\t\t\thomeBarContainer.classList.add('home-bar-clickable');\n\t\t\t}\n\t\t\tthis.content.prepend(homeBarContainer);\n\t\t}\n\t\t/* above codes are changed by github1s */`,
	);

	replaceOnce(
		'src/vs/workbench/browser/parts/activitybar/activitybarPart.ts',
		`\t\tconst content = assertReturnsDefined(this.element);\n\t\tcontent.prepend(this.menuBarContainer);`,
		`\t\tconst content = assertReturnsDefined(this.element);\n\t\t/* below codes are changed by github1s */\n\t\tconst homeBarContainer = content.querySelector('.home-bar');\n\t\tif (homeBarContainer) {\n\t\t\tcontent.insertBefore(this.menuBarContainer, homeBarContainer.nextSibling);\n\t\t} else {\n\t\t\tcontent.prepend(this.menuBarContainer);\n\t\t}\n\t\t/* above codes are changed by github1s */`,
	);

	appendOnce(
		'src/vs/workbench/browser/parts/activitybar/media/activitybarpart.css',
		'below codes are changed by github1s',
		`/* below codes are changed by github1s */\n.monaco-workbench .activitybar > .content > .home-bar {\n\topacity: 1;\n\theight: 48px;\n\tcursor: pointer;\n\tmask-repeat: no-repeat;\n\t-webkit-mask-repeat: no-repeat;\n\tmask-size: 50% 50%;\n\t-webkit-mask-size: 50% 50%;\n\tmask-position: 50% 50%;\n\t-webkit-mask-position: 50% 50%;\n\tbackground-color: var(--vscode-activityBar-foreground);\n}\n\n.monaco-workbench .activitybar > .content > .home-bar.home-bar-clickable:hover {\n\topacity: 0.7;\n}\n\n.monaco-workbench .activitybar > .content > .home-bar.home-bar-clickable:active {\n\topacity: 0.4;\n}\n/* above codes are changed by github1s */`,
	);
};

const patchWebviewPreload = () => {
	replaceOnce(
		'src/vs/workbench/contrib/webview/browser/pre/index.html',
		`\t<meta http-equiv="Content-Security-Policy"\n\t\tcontent="default-src 'none'; script-src 'sha256-nXjtuhBilO++r8hfxl5VjEScSmdm07wDAk6jw228DgM=' 'self'; frame-src 'self'; style-src 'unsafe-inline';">`,
		`\t<!-- below codes are changed by github1s -->\n\t<meta http-equiv="Content-Security-Policy"\n\t\tcontent="default-src 'none'; script-src 'unsafe-inline' 'self'; frame-src 'self'; style-src 'unsafe-inline' 'self'; img-src 'self' https: data:; media-src 'self' https: data:; font-src 'self' https: data:;">\n\t<!-- above codes are changed by github1s -->`,
	);

	const file = 'src/vs/workbench/contrib/webview/browser/pre/index.html';
	const target = path.join(VSCODE_ROOT, file);
	let content = fs.readFileSync(target, 'utf8');
	const replacement = `\t\t\tasync signalReady() {\n\t\t\t\t/* below codes are changed by github1s */\n\t\t\t\tperfMark('signalingReady');\n\t\t\t\tconst parentOrigin = searchParams.get('parentOrigin') || '';\n\t\t\t\twindow.parent.postMessage({ target: ID, channel: 'webview-ready', data: {} }, parentOrigin, [this.channel.port2]);\n\t\t\t\t/* above codes are changed by github1s */\n\t\t\t}`;
	if (!content.includes(`/* below codes are changed by github1s */\n\t\t\t\tperfMark('signalingReady');`)) {
		const patched = content.replace(/\t\t\tasync signalReady\(\) \{[\s\S]*?\n\t\t\t\}\n\t\t\}\(\);/, `${replacement}\n\t\t}();`);
		if (patched === content) {
			throw new Error(`Patch anchor not found in ${file}`);
		}
		content = patched;
		fs.writeFileSync(target, content);
	}
};


const patchLatestVSCodeBuildFixes = () => {
	// VS Code 1.129.1 can fail declaration emit with TS2742 for this inferred event type.
	// Keep the source-level fix local to the fetched VS Code checkout so CI remains reproducible.
	replaceOnce(
		'src/vs/platform/agentHost/node/copilot/copilotSessionWrapper.ts',
		`\treadonly onUnhandledEvent = this._onUnhandledEvent.event;`,
		`\treadonly onUnhandledEvent: Event<SessionEvent> = this._onUnhandledEvent.event;`,
	);
};

const main = () => {
	if (!fs.existsSync(VSCODE_ROOT)) {
		throw new Error('VS Code source was not found. Run npm run clone first.');
	}

	copyDeclarationFile();
	patchWorkbenchGlobals();
	patchResourcePaths();
	patchActivityBarLogo();
	patchWebviewPreload();
	patchLatestVSCodeBuildFixes();
};

main();
