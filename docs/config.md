# Settings Guide
Record with OBS instead of FFMPEG
- Enabled: This requires the OBS application to be downloaded and configured. **While this is a bit clunkier than using the default FFMPEG solution, we recommend it as not all machines are capable of capturing audio with FFMPEG.** You can find instructions for configuring OBS (and instructing participants how to configure it) in [configure-obs.md](configure-obs.md). 
- Disabled: Uses built-in screen recording through FFMPEG (system audio not always available depending on audio driver! See section on Capturing game sound below).

Record both screens
- On: the recorder captures the full desktop area across your displays.
- Off: the recorder captures only one monitor. You can select this monitor through the dropdown.

Record audio
- On: FFMPEG records an audio track alongside the screen, encoded as AAC.
- Off: recordings are video-only (the previous behavior).
- Note: this setting applies to the FFMPEG backend only. When recording through OBS, audio sources are configured inside OBS itself.
- If the selected device cannot be opened when recording starts, the session falls back to video-only rather than failing.

Audio input device
- Selects which capture device supplies the audio track. Each device is labelled
  either "system audio" or "microphone".
- System audio (also called loopback) records what the machine is playing, which
  is what captures game sound. A microphone records the room instead.
- When no device is explicitly chosen, a system-audio device is preferred and a
  microphone is used only if no loopback device exists.
- The list is enumerated from DirectShow on Windows, AVFoundation on macOS, and
  PulseAudio on Linux (where `.monitor` sources are the loopback devices).

Capturing game sound on Windows
- gdigrab cannot capture sound, so audio has to come from a DirectShow device,
  and Windows does not expose desktop output as a capture device by default.
- Many machines have no loopback device at all. In that case the only devices
  offered are microphones, and the recording will contain room audio only.
- The app warns about this in two places: when "Record audio" is switched on in
  settings, and once per run when a session starts with audio enabled. Both are
  dismissable notices that do not hold up the session.
- To get game sound, do one of the following:
  - Enable "Stereo Mix" in Windows sound settings (Sound > Recording > right
    click > Show Disabled Devices). Not all audio drivers provide it.
  - Install a virtual loopback driver such as VB-Cable and set it as the
    playback device, then select its capture side here.
  - Record with OBS instead, which captures desktop audio without extra setup.

Use local-only storage
- On: session video, metadata, and notes stay on your machine and are not auto-uploaded to the configured database.
- Off: after recording stops, the app attempts to upload session files to the database (S3 as originally configured).

Show recent notes overlay
- On: the floating recent-notes overlay appears during recording and updates as notes are added.
- Off: the recent-notes overlay is not shown.

Enable post-game review prompt
- On: when you stop recording, a review text window appears so you can save a post-game reflection. 
- Off: no reflection prompt included.

Number of notes to display
- Controls how many recent notes appear in the recent-notes overlay. Higher numbers show more note history at once; lower numbers keep the overlay more compact.

Hotkey bindings
- These can be changed to user preferences. The default settings are as follows:

CommandOrControl+Shift+N: Opens annotation window to enter new note
CommandOrControl+Shift+Q: Stop annotation session and open review window
CommandOrControl+Shift+P: Toggle on-screen overlay
CommandOrControl+Shift+1: Like emoji
CommandOrControl+Shift+2: Love emoji
CommandOrControl+Shift+3: Laugh emoji
CommandOrControl+Shift+4: Wow emoji
CommandOrControl+Shift+5: Sad emoji
CommandOrControl+Shift+6: Angry emoji