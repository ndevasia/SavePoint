# Using SavePoint

This covers how to record a session and take notes while you play. If you haven't
installed OBS and the SavePoint app yet, start with
[Setting up SavePoint](configure-obs.md).

On a Mac, use `Command` wherever these instructions say `Control`.

You can also watch [this tutorial video](videos/WindowsTutorial-part1.mp4), which is applicable to both Windows and Mac. 

---

## Before you start

1. **Open your game in Steam.** In the game's settings, disable full screen mode
   if you can. This significantly improves the experience with the note-taking
   overlay.
2. **Open OBS and leave it running.** Check that the window capture source is
   pointing at the game you're playing, and adjust the red bounding box so the
   game fills the frame. OBS has to stay open for the whole session so it can
   record your video.

## Starting a session

1. Open the **SavePoint** app.
2. It will ask for your username. **Use the same username every time** — this is
   how your sessions are kept together.
3. Click **Start a new session**, then enter the game you're playing.
4. OBS should now be recording. You can confirm this by looking at OBS: it shows
   a red circle while recording.

You can now play as you normally would.

## Taking notes

| Shortcut          | What it does                            |
| ----------------- | --------------------------------------- |
| `Control+Shift+N` | Open the note window to write a new note |
| `Control+Shift+P` | Show or hide the recent notes overlay    |
| `Control+Shift+O` | Show your past sessions                  |

### Emoji reactions

These log a reaction instantly, without opening the note window.

| Shortcut          | Reaction |
| ----------------- | -------- |
| `Control+Shift+1` | 👍 Like  |
| `Control+Shift+2` | ❤️ Love  |
| `Control+Shift+3` | 😂 Haha  |
| `Control+Shift+4` | 😮 Wow   |
| `Control+Shift+5` | 😢 Sad   |
| `Control+Shift+6` | 😠 Angry |

All of these shortcuts can be changed in the app's settings.

## Finishing the session

**Don't forget to do this** — your session is only saved when you quit properly.

1. When you're done playing, quit the note-taking app first by pressing
   **`Control+Shift+Q`**. A loading screen appears while your video is uploaded.
2. Once it finishes, you can view the session in the app's window.
3. **Check that the app has fully closed in Task Manager.** There is a known bug
   where the tool sometimes won't work on reopen if it wasn't closed properly.
4. You can now close Steam and OBS.

Common issues that you might run into can be found in [common-bugs.md](./common-bugs.md). If you have any questions, please reach out.
