# vscode-web

VS Code Web build wrapper based on `conwnet/github1s/vscode-web`.

This repository keeps the original github1s approach:

1. Clone the upstream `microsoft/vscode` source at the version recorded in `.VERSION`.
2. Apply a small set of github1s-style runtime patches.
3. Run the upstream VS Code Web build tasks.
4. Package the static web assets into `dist/`.

## Commands

```sh
npm ci
npm run clone
npm run patch
npm run build:vscode
npm run build:package
npm run build:nls
```

Or run everything:

```sh
npm run build
```

Update the VS Code version:

```sh
npm run set-version -- 1.129.1
```

## Output layout

`dist/` contains the deployable web assets:

- `dist/index.html`
- `dist/vscode/`
- `dist/extensions/`
- `dist/dependencies/` — renamed from upstream `node_modules`
- `dist/nls/`

## GitHub Actions

`.github/workflows/build-vscode-web.yml` can be run manually, and also polls the latest
`microsoft/vscode` release daily. When a new VS Code release is detected, it builds and force-pushes
the packaged assets to the `dist` branch.
