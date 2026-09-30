No icons have been generated yet. Before a release build, generate the full
icon set referenced in `tauri.conf.json` (`32x32.png`, `128x128.png`,
`128x128@2x.png`, `icon.icns`, `icon.ico`) from a single source image via:

    npx @tauri-apps/cli icon path/to/source-icon.png

`npm run tauri dev` does not require these to be present for local
development.
