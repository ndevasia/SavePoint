## SavePoint Overview

This tool allows players to create and store notes taken during their gameplay sessions. You can see a short (and somewhat out of date) demo [here](https://www.youtube.com/watch?v=LIdFdVaLWCI&list=PLI1UA0q3OsunU0jM1oe7fMegbA5Yc4uJD). This is a great tool for researchers who study games and player experience, game developers in playtesting phases of development, or for everyday players who might just want to annotate their gameplay. 

## Getting Started

[NOTE: If you know Nisha personally, you can skip all of the following steps and send her an email asking for a build. This will save you a lot of work.]

To get the tool running locally, follow these steps:

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the application:**
   ```bash
   npm run start
   ```

---

## Configuration

### Local vs. Cloud Storage
The app can be used completely locally (for use cases such as journaling your own play, or just trying the app out) or be configured to use AWS in Settings. The app initially boots with no credentials configured in local-only mode, but if you would like to use cloud storage, please follow the steps for AWS IAM setup and input the necessary credentials. 

You can configure cloud storage from the app settings. It requires the following values:

```env
AWS_ACCESS_KEY_ID=[enter your own]
AWS_SECRET_ACCESS_KEY=[enter your own]
AWS_REGION=[region you configure AWS bucket for]
AWS_BUCKET_NAME=[bucket name]
AWS_ROLE_ARN=arn:aws:iam::[your AWS account number]:role/[bucket-name]
```

You will be presented with two options:
1. Save to backend/.env. **Do this if you are distributing builds to study participants.** You can save the credentials into the .env file and then follow the build instructions.
2. Save to local config. Use this if you want to use cloud storage personally (due to storage limitations on your local machine) or test cloud connection before building for participants.

## AWS IAM Setup

To successfully authenticate, you will need to create an **IAM User** and an **IAM Role** with the following configurations.

### 1. Role Policy
Attach this policy to your role to allow the application to list and manage objects in the S3 bucket.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowListBucket",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::game-annotator"
        },
        {
            "Sid": "AllowBucketObjects",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::game-annotator/*"
        }
    ]
}
```

### 2. Trust Relationship
The role must trust your IAM user to allow the `sts:AssumeRole` action. Update the Principal ARN below to match your specific IAM user.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::378382627972:user/gameannotator-user"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

---

## Packaging a Build for Participants

```bash
npm run dist
```

Credentials in `backend/.env` are bundled into the build, so participants launch the app with
cloud storage already working and never see a setup screen. You can write that file by hand, or
fill in **Settings → Cloud storage** and use **Export to backend/.env** (the export button only
appears when running from a checkout, never inside a packaged build).

Two things to know before distributing:

- **The bundled credentials are readable.** Anything inside the build can be extracted with
  `npx asar extract app.asar out/`. This is inherent to shipping credentials in an app, not
  specific to this tool. Keep the IAM role scoped to just the study bucket — the long-lived key
  only assumes a role via STS, which is what limits the blast radius if a build leaks.
- **Participants can always record without AWS in local-only mode.** If a build ships with no credentials, or the
  bucket is unreachable, sessions are written locally and can be uploaded later. For participants with bandwidth issues, having them use local-only mode and uploading the sessions through different means may be advisable (see "Deployment Experience" section). 

### macOS

**Gatekeeper will block an unsigned build.** The `mac` section of `package.json` sets a target and
icon but no signing identity, so a `.dmg` or `.zip` handed to a participant opens with *"GameAnnotator
is damaged and can't be opened"* — a misleading message that actually means unsigned and
quarantined. Options, best first:

1. **Sign and notarize.** Needs a paid Apple Developer account. Add a `mac.identity`,
   `mac.hardenedRuntime: true`, an entitlements file, and notarization credentials to the
   `build` block. This is the only approach where participants just double-click and it works.
2. **Talk participants through bypassing Gatekeeper.** Right-click the app → Open → Open, or
   `xattr -dr com.apple.quarantine /Applications/GameAnnotator.app`. While this is workable for a small n of participants, **I do not advise this approach as it is pretty annoying for participants**.

**Screen Recording permission is required.** macOS gates screen capture behind TCC, so on first
recording the participant gets a system prompt. Notes to include in participant instructions:

- The app must be granted **System Settings → Privacy & Security → Screen Recording**.
- **The app has to be restarted after granting it** — macOS does not apply the permission to an
  already-running process. Without a restart, recordings come out black.
- Recording silently produces an empty or black video if the permission is missing, so tell
  participants to verify their first session actually captured video.

## Using SavePoint
A list of settings and configurations for SavePoint can be found in config.md.
