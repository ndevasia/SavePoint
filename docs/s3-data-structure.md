# How session data is stored in S3

This describes what SavePoint writes to your S3 bucket, what each
file contains, and how to line notes up against the video during analysis.

Setting the bucket up in the first place is covered in
[Setting up SavePoint for a study](build-the-app.md#4-set-up-aws).

---

## The layout

Everything is keyed by username, then by category, then by session timestamp:

```
<your-bucket>/
├── ID00-001/
│   ├── videos/
│   │   ├── 2026-09-27 15-04-22-018.mkv
│   │   └── 2026-09-28 19-11-03-442.mkv
│   ├── annotations/
│   │   ├── 2026-09-27 15-04-22-018.json
│   │   └── 2026-09-28 19-11-03-442.json
│   └── metadata/
│       ├── 2026-09-27 15-04-22-018.json
│       └── 2026-09-28 19-11-03-442.json
├── ID00-002/
│   └── ...
```

Three things follow from this, and they drive everything else in this document:

1. **The top level is the username the participant typed**. You can assign this to them or have them choose their own.
2. **One session is three files that share a basename** — the same timestamp with
   three different extensions and parent folders. That basename is your join key.
3. **The basename contains a space.** The format is
   `YYYY-MM-DD HH-MM-SS-mmm`, generated in
   [backend/metadata.js:30-41](../backend/metadata.js#L30-L41).

The three `videos/`, `annotations/`, and `metadata/` prefixes are created as
empty objects the first time a participant starts a session, so a participant
folder can exist with no sessions in it.

## What is in each file

### `videos/<timestamp>.mkv`

The screen recording. The mkv extension is hardcoded for the
`videos` folder regardless of which backend produced it
([backend/aws.js:113-117](../backend/aws.js#L113-L117)), so an OBS recording and
an FFMPEG recording are indistinguishable by filename. If you need to know which
backend a participant used, note that yourself.

### `metadata/<timestamp>.json`

Session-level facts, written from
[SessionMetadata](../backend/metadata.js#L103-L113):

```json
{
  "username": "ID00-001",
  "title": "Hollow Knight",
  "fileTimestamp": "2026-09-27 15-04-22-018",
  "videoStartTimestamp": 1790694262018,
  "postGameReview": "Got stuck on the same boss three times.",
  "postGameReviewSavedAt": 1790701462018,
  "postGameReviewLastEditedAt": 1790701462018
}
```

| Field | Meaning |
| ----- | ------- |
| `username` | As typed by the participant. |
| `title` | What the participant entered when asked which game they're playing. |
| `fileTimestamp` | Matches the filename. Local wall-clock time on their machine. |
| `videoStartTimestamp` | **Epoch milliseconds at the moment recording actually started.** This is the anchor for aligning notes to video. |
| `postGameReview` | The post-game reflection, empty string if the prompt was disabled or skipped. |
| `postGameReviewSavedAt` | Epoch ms when a review was first saved, `null` if never. |
| `postGameReviewLastEditedAt` | Epoch ms of the most recent edit. Differs from the above when a participant went back and revised. |

`videoStartTimestamp` is set the moment recording begins under both backends
([main.js:1270](../main.js#L1270) for FFMPEG,
[main.js:1508](../main.js#L1508) for OBS), which is slightly after
`fileTimestamp` was generated. Use `videoStartTimestamp`, not the filename, for
any timing work.

### `annotations/<timestamp>.json`

A flat array of notes, in the order they were taken:

```json
[
  { "note": "first time seeing this enemy", "timestamp": 1790694500123 },
  { "note": "👍", "timestamp": 1790694712889 },
  { "note": "this puzzle is unclear", "timestamp": 1790695003451 }
]
```

Every entry has the same two fields. Emoji reactions are not a separate type —
the hotkey writes the emoji character into `note`
([main.js:1710](../main.js#L1710)), so a single-emoji `note` is how you tell them
apart. `timestamp` is epoch milliseconds.

A session with no notes still uploads an empty array, so the file's presence
doesn't imply content.

## Aligning notes to the video

This is the main thing you need the metadata for. A note's offset into the
recording is the difference between the two epoch timestamps:

```
offset_ms = annotation.timestamp - metadata.videoStartTimestamp
```

So with `videoStartTimestamp` of `1790694262018` and a note at
`1790694500123`, the note lands 238,105 ms in — about 3m58s.

Negative offsets are possible in principle, for a note taken between the session
starting and recording actually beginning. Treat them as 0 rather than discarding
the note.

## When files appear

Sessions are written to the participant's machine first, under
`local_sessions/<username>/` in the app's user-data directory, and uploaded as a
set when the session ends properly
([main.js:305-322](../main.js#L305-L322)). The local copy is deleted after a
successful upload.

Two consequences worth knowing:

- **A session appears in S3 all at once, not progressively.** Nothing shows up
  mid-session, so you cannot monitor a participant live by watching the bucket.
- **A session that ended badly may never upload.** You can read more about this [here](./common-bugs.md).

Editing a post-game review later patches the existing metadata object in place
([backend/aws.js:422-463](../backend/aws.js#L422-L463)) rather than writing a new
file, so `postGameReviewLastEditedAt` is the only record that it changed.

## Potential issues

**Usernames are free text.** Make sure the participant enters it correctly the first time they open the app. 

**Timestamps carry no timezone.** In case this is something you need, you might want to find a different way to represent timestamps.

**Files can be orphaned.** The app only lists a session when both the video
and the metadata exist ([backend/aws.js:156](../backend/aws.js#L156)). So annotation or metadata
files without a matching video stay in the bucket indefinitely and are invisible
in the app. Check for them directly if your counts don't add up. That said, an annotation file on its own can be useful depending on what you're using it for in your study. 

