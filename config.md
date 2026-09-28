# Default Hotkeys

Control+Shift+N: Opens annotation window to enter new note
Control+Shift+Q: Stop annotation session and open review window
Control+Shift+P: Toggle on-screen overlay
Control+Shift+1: Like emoji
Control+Shift+2: Love emoji
Control+Shift+3: Laugh emoji
Control+Shift+4: Wow emoji
Control+Shift+5: Sad emoji
Control+Shift+6: Angry emoji

You can change hotkey bindings in settings.

# Settings Guide

Record both screens
- On: the recorder captures the full desktop area across your displays.
- Off: the recorder captures only one monitor. You can select this monitor through the dropdown.

Record audio
- On: FFMPEG records an audio track alongside the screen, encoded as AAC.
- Off: recordings are video-only (the previous behavior).
- Note: this setting applies to the FFMPEG backend only. When recording through OBS, audio sources are configured inside OBS itself.
- On Windows, gdigrab cannot capture sound, so audio comes from a DirectShow device. A microphone works out of the box; capturing game/desktop sound needs a loopback device such as Stereo Mix (if your sound card exposes it) or a virtual cable like VB-Cable.
- If the selected device cannot be opened when recording starts, the session falls back to video-only rather than failing.

Audio input device
- Selects which capture device supplies the audio track.
- The list is enumerated from DirectShow on Windows, AVFoundation on macOS, and PulseAudio on Linux.
- If the saved device is missing at record time, the first available device is used instead.

Use local-only storage
- On: session video, metadata, and notes stay on your machine and are not auto-uploaded to the configured database.
- Off: after recording stops, the app attempts to upload session files to the database (S3 as originally configured).

Show recent notes overlay
- On: the floating recent-notes overlay appears during recording and updates as notes are added.
- Off: the recent-notes overlay is not shown.

Enable post-game review prompt
- On: when you stop recording, a review text window appears so you can save a post-game paragraph.
- Off: stopping recording uses the loading/upload flow without a review prompt.

Number of notes to display
- Controls how many recent notes appear in the recent-notes overlay.
- Higher numbers show more note history at once; lower numbers keep the overlay more compact.

Hotkey bindings
- These can be changed to user preferences.