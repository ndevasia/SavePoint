# Common Bugs
SavePoint is a homebrewed tool and is therefore not the most robust thing in the world. Here are some issues that I have run into while using it in studies.

## OBS issues

**The app says it can't start a session because OBS isn't available.**
OBS needs to be running before you start a session. Open OBS, then choose
**Try Again**. If it keeps failing, check that the WebSocket server is still
enabled on port 4455 (**Tools > WebSocket Server Settings**).

**The recording didn't capture my game.**
Check the window capture source in OBS before starting. If the game was closed
and reopened, OBS may have lost track of the window and need it reselected.

## Failure to upload
There are a few reasons for this. The first and most obvious one is that AWS credentials have not been configured correctly; however, you should have checked that this worked before sending builds to participants, so hopefully this will not happen. 

The more likely reason, and one that is out of your control: the gameplay video a participant is trying to upload is too large and times out due to insufficient upload speed. There are a few subcases here:

### The participant is able to view the session just fine locally, but the uploading is failing.
In this case, you can either: ask them to retry the upload through the tool, or have them download the session through the tool into a zip file and send it to you through Google Drive (or another file sharing platform). This is obviously annoying, but once you add the files to the participant's S3 folder (see [here](./s3-data-structure.md) for what those folders look like), you should be able to view their files just fine.

### The participant's video is corrupted locally. 
This is annoying but recoverable if they were using OBS, as OBS will just save the video independently of SavePoint. In this case, the participant likely has their annotation and metadata but not the video. This can be resolved by asking participants to move the video from wherever OBS saved it (can be checked in OBS settings but is usually the Videos folder on Windows) into the app files, which are located in `C:\Users\[their username]\AppData\Roaming\game-annotation-tool\local_sessions\[participant ID]\videos` on Windows or `~/Library/Application Support/game-annotation-tool/local_sessions/[participant ID]/videos` on Mac. You will probably need to walk participants through this over a call, as `AppData` is hidden on Windows and `~/Library` is hidden on Mac (hold Option while opening Finder's **Go** menu to reveal it). The video has to be renamed to match the session's other two files — the same `YYYY-MM-DD HH-MM-SS-mmm` basename, with a `.mkv` extension — or the app won't pair it with the annotations.

If they are using FFMPEG instead of OBS, this video is harder to recover. You can ask participants to check `C:\Users\[their username]\AppData\Local\Temp\game_annotator_recordings` on Windows, or on Mac open Finder's **Go > Go to Folder** and enter `$TMPDIR`, then look for `game_annotator_recordings`. I haven't had much success with this. Note that these are temporary folders the operating system clears on its own schedule, so the sooner you ask, the better the odds.

## Video interrupted partway through session
For example, I've had participants accidentally close OBS/FFMPEG, have their computer lose power halfway through a session, or other system failures which might just interrupt SavePoint's normal operating loop. In this case, the session is probably lost, so just warn participants to be careful. 

## App slowing down computer
Although I have tried my best to make the app cleanly quit, participants do not always close it properly and occasionally crash the app. Make sure no leftover SavePoint processes are running in Task Manager. 