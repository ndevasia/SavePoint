# Distributing to participants

These are researcher facing instructions for turning the app into an installer,
getting it onto participants' machines, and supporting them once it's there.

Before you start, work through [Setting up SavePoint for a
study](build-the-app.md) — the app should run from source on your machine and your
recording, storage, and settings decisions should be settled, since some of them
change what you have to send participants.

---

## 1. Build the installers

```bash
npm install
npm run dist
```

Output lands in `dist/`. Artifacts are named after `productName` in
`package.json`, currently `SavePoint`:

| Platform | Target       | File                        |
| -------- | ------------ | --------------------------- |
| Windows  | NSIS         | `SavePoint Setup <version>.exe` |
| Mac      | dmg and zip  | `SavePoint-<version>.dmg`, `SavePoint-<version>-mac.zip` |

Bump `version` in `package.json` between builds so you can tell which build a
participant is running when they report a problem.

Four things to know:

**Check what the build is packaging.** The `files` list in `package.json` starts
from `**/*`, meaning everything in the project folder goes into the installer
unless it is explicitly excluded. Session data collected into the project folder —
`s3_data/`, for instance — would otherwise be packaged and handed to the next
participant, which is both a privacy problem and enough volume to make the build
hang instead of finishing. The current exclusions cover `s3_data/`,
`local_sessions/`, `docs/`, and `dist/`; if you add a folder that holds
participant data or anything else the app doesn't need at runtime, exclude it
there too.

**You can only build Mac artifacts on a Mac.** Running `npm run dist` on Windows
produces the Windows installer only, so covering both platforms means access to
both machines.

**Builds are unsigned.** Windows shows a SmartScreen warning and macOS blocks the
app outright on first launch. Both are expected and both are covered in the
participant instructions, but tell participants in advance.

**The icons need attention.** Three things:

- `icons/icon.ico` has to be **at least 256x256**, or electron-builder stops with
  `image icons\icon.ico must be at least 256x256`. That is a hard build failure,
  not a warning.
- A single 256x256 image satisfies the build, but a `.ico` ideally carries
  16, 24, 32, 48, 64, 128, and 256 pixel versions so Windows doesn't have to
  downscale for list views and the taskbar. Note that electron-builder's own
  PNG-to-ICO conversion only emits a single 256x256, so use a real icon tool if
  you want the smaller sizes.
- There is no `icons/icon.icns`, so Mac builds fall back to the default Electron
  icon. The easiest way to get one is to keep a **1024x1024 PNG** and point
  `mac.icon` at it — electron-builder converts it to a complete `.icns` at build
  time. On a Mac you can also build one by hand with `iconutil -c icns
  icon.iconset`.

`icons/` is listed in `.gitignore`, so a fresh clone has none of these files.
Remove that entry and commit the icons, or drop the `icon` keys from the build
config.

After replacing an icon, Windows may keep showing the old one from Explorer's
icon cache rather than the new build. `ie4uinit.exe -show` refreshes it; copying
the executable to a new filename is a quick way to confirm what is really
embedded.

### FFMPEG comes with the build

Nothing to do here: `ffmpeg-static` is a dependency, so `npm install` fetches a
prebuilt FFMPEG binary and `npm run dist` packages it. Participants do not have to
install FFMPEG themselves whichever recording backend you choose.

Two side effects worth knowing. It adds roughly 80MB to each installer. And the
binary it downloads is only for the platform you install on, which is another
reason the Windows installer has to be built on Windows and the Mac one on a Mac.

The bundled FFMPEG is GPL licensed, so if you redistribute builds beyond your own
study participants, check that the terms suit you.

---

## 2. Test the build before sending it out

Install from the artifact in `dist/` on a machine that has **never run the app
from source**. This replicates the experience of a participant making a fresh install. A machine that has run from source may also
have FFMPEG, Node, or a stray `.env` lying around that a participant's won't.

Check at least:

- The app launches past the OS security warning (SmartScreen on Windows,
  Gatekeeper on Mac).
- A session starts — this is what proves the recording backend check passed.
- Notes and the emoji hotkeys register.
- Quitting with the quit hotkey uploads the session (or writes it locally) **and
  the process actually exits.** There is a known bug where an app that wasn't
  closed properly fails on next open, so confirm it's gone from Task Manager or
  Activity Monitor.
- The uploaded session appears where you expect it in S3, under the username you
  used.

Do this on both platforms if you're distributing to both. Building for Mac is very different than building for Windows!

## 3. What to send participants

- **The installer for their platform.** In the past, I have sent this over Google Drive, which worked fine. 
- **A link to [Installing SavePoint](app-installation-participants.md).**
- **A link to [Setting up OBS](configure-obs.md),** if your study records through
  OBS.
- **A link to [Using SavePoint](using-the-app.md).**
- **Any settings you need them to change,** from your decisions in step 3 of the
  build instructions.
- **The username you want them to use.** e.g., participant ID. 

## 4. Supporting participants

As participants aren't always tech savvy, it's generally helpful to jump on a call with them if they're having persistent issues. See [common-bugs.md](./common-bugs.md) for more information.

## 5. When the study ends

If you packaged credentials, delete the access key for the IAM user you built with to prevent abuse.
