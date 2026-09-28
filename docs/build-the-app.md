# Setting up SavePoint for a study

These are researcher facing instructions for getting SavePoint running on your own
machine and configured for your study. Packaging it into an installer and sending
that to participants is the next document,
[Distributing to participants](distribute-to-participants.md).

No prior experience with Node or AWS is assumed. If you have used both before,
the short version is: `npm install`, create `backend/.env`, `npm run start`.

It is generally more participant friendly to bundle and send them a build; however, as things stand, it does come with some security risks outlined in Section 4.6. 

---

## 1. Install the tools

**Node.js** is required for running SavePoint locally (as well as Git, but I'm assuming if you're viewing these docs on GitHub, you already have Git installed). For running locally, terminal proficiency is recommended. 

### Node.js

SavePoint is an Electron app, which means it runs on Node.js — a way of running
JavaScript outside a browser. Installing Node.js also gives you **npm**, the tool
that downloads the libraries the app depends on. You don't need to know
JavaScript to build the app; you just need these two commands available.

Download the **LTS** version from <https://nodejs.org/> and run the installer,
accepting the defaults. Version 18 or newer works.

Check that Node installed properly by opening your terminal and pressing Enter:

```bash
node --version
npm --version
```

Each should print a version number. If you instead see "command not found" or
"npm is not recognized", close the terminal, open a new one, and try again — a
terminal only picks up newly installed programs when it starts. If it still
fails, the Node installer didn't finish; run it again.

---

## 2. Get the code and run it

**Clone the repository.** In your terminal:

```bash
git clone git@github.com:ndevasia/SavePoint.git
cd SavePoint
```

Your terminal should now be pointing at the `SavePoint` folder. 

**Install the dependencies.**

```bash
npm install
```

This reads the list of libraries in `package.json` and downloads them into a
`node_modules` folder. It takes a few minutes the first time and prints a lot of
output. Lines that say `deprecated` or `warn` are normal and can be ignored;
anything that says `ERR!` and stops the process is a failure that should be Googled.

**Start the app.**

```bash
npm run start
```

SavePoint should open. Leave the terminal window open while it runs — closing it
closes the app. Press `Control+C` in the terminal to stop it.

**Every time you come back to it after that:**

```bash
git pull
npm install
npm run start
```

`git pull` fetches any code changes, and re-running `npm install` picks up new
dependencies. Both are worth running every time you start the app. 

`npm run debug` starts the app with extra logging instead, which is the faster
option when you are chasing a specific problem.

One thing this does not tell you: whether a **packaged build** (the thing you send to participants) works. Testing the real
installer is covered in
[Distributing to participants](distribute-to-participants.md).

---

## 3. Decide how the study records and stores data

Before creating your final packaged build for participants, you need to consider the following technical details. More information can be found in the app's settings, documented in
[the settings guide](config.md).

**Recording backend — OBS or FFMPEG.** OBS is recommended. Not every machine can
capture system audio through FFMPEG, so if you need game sound, use OBS. The
tradeoff is that participants have to install and configure OBS themselves, which can definitely cause some setup friction. Please consult [Setting up OBS](configure-obs.md) for further instructions.

If you go with FFMPEG instead, there is nothing extra for participants to
install — the binary is bundled into the build automatically.

**Storage — local-only or uploaded.** With **Use local-only storage** off, the app
uploads session video, metadata, and notes to Amazon S3 when recording stops,
which requires the AWS setup in step 4. With it on, everything stays in the
participant's application data folder and you collect it some other way — which
means no AWS account, and you can **skip step 4 entirely**. For the purposes of a study **I recommend using AWS or another cloud solution of your choosing**.

**Post-game review, the notes overlay, and hotkeys.** Note that settings are stored per
machine in `config.json` under the participant's application data directory, so
they are not baked into the build. If a setting matters to your study design (for example, enabling post-game review), tell participants what to set in your study instructions.

---

## 4. Set up AWS

Skip this whole step if your study is local-only (e.g., if you are using SavePoint in user testing where participants are coming into your lab and using your machine).

In the current implementation, AWS (Amazon Web Services) is where uploaded sessions are stored. You need five
things from it, which become the five values in your `backend/.env` file: a **bucket** to
hold the files, a **region** it lives in, an **access key** and **secret access key** to identify the app,
and a **role** the app switches into in order to write to the bucket.

The two-identity setup — a user that then assumes a role — is how the app is
written ([backend/aws.js:14-33](../backend/aws.js#L14-L33)): it authenticates as
the user, calls `assumeRole` to get temporary credentials, and uses those for
every upload. Both have to exist or uploads fail. Note that uploads can also fail for other reasons, such as being too big or a participant's upload speeds. 

### 4.1 Create an account

Sign up at <https://aws.amazon.com/>. 

**This costs a bit of money!** Gameplay video is large, and S3 charges for both storage and
data transfer, so a study with many participants and long sessions adds up in a
way that a few test recordings won't. Before you start collecting, set a **budget
alarm** (Billing and Cost Management → Budgets).

### 4.2 Create the bucket

In the S3 console, create a bucket.

- Its **name** goes in `backend/.env` as `AWS_BUCKET_NAME`. Bucket names are globally
  unique across all of AWS, so you may need something more specific than
  `savepoint`.
- The **region** you pick goes in `backend/.env` as `AWS_REGION`, in the form
  `us-west-2` (although you should pick the region that you are located in).
- **Leave "Block all public access" on.** The app reaches the bucket with
  credentials, not public access, so making the bucket public isn't needed and
  would expose participant recordings to anyone who guesses the URL.

### 4.3 Create the user and its access key

In the IAM console, create a user (I called mine `gameannotator-user`). It does not need console sign-in access. Attach no permissions directly; this is addressed in the next step.

Then create an **access key** for that user. You get two values:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**The secret is shown once.** Copy both somewhere safe immediately; if you lose
the secret you have to delete the key and make a new one.

### 4.4 Create the role

Now that you've created the user, you will now need to create an **IAM Role**. You can call this whatever you like. Then, you will need to attach the following:

**Role policy.** Attach this policy to your role to allow the application to list and manage objects in the S3 bucket.

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
            "Resource": "arn:aws:s3:::[YOUR BUCKET NAME]"
        },
        {
            "Sid": "AllowBucketObjects",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::[YOUR BUCKET NAME]/*"
        }
    ]
}
```

**Trust relationship.** The role must trust your IAM user to allow the `sts:AssumeRole` action. Update the Principal ARN below to match your specific IAM user.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::[YOUR AWS ACCOUNT ID]:user/[YOUR IAM USER NAME]"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

The finished role's ARN goes in `.env` as `AWS_ROLE_ARN`.

### 4.5 Write the `.env` file

Create a file named `.env` **inside the `backend/` folder**. 

```env
AWS_ACCESS_KEY_ID=[from step 4.3]
AWS_SECRET_ACCESS_KEY=[from step 4.3]
AWS_REGION=[from step 4.2, e.g. us-west-2]
AWS_BUCKET_NAME=[from step 4.2]
AWS_ROLE_ARN=arn:aws:iam::[your account id]:role/[your role name]
```

No quotes around the values, and no spaces around the `=`.

`.env` is gitignored, which means `git pull` will never deliver it and `git push`
will never leak it. It also means you write it by hand once, and again on any
other machine you build from.

### 4.6 Check that it works

Run `npm run start`, record a short session, and quit properly with the quit
hotkey. Then look in the S3 console: you should see a folder named after the
username you used, containing `videos/`, `annotations/`, and `metadata/`.

If nothing appears, run `npm run debug` and repeat — credential and assume-role
failures show up in that output.

### Keep the credentials scoped

`files: ["**/*"]` in [package.json](../package.json#L24-L26) means `backend/.env`
is packaged into the installer, so **whatever credentials you build with are
shipped to every participant**. This is obviously a security risk, as participants could theoretically unzip and view the credentials in backend/.env. This hasn't been an issue for me thus far as most of my participants are children. However, it is definitely not ideal. There is an [issue](https://github.com/ndevasia/SavePoint/issues/42) open for this; I would like to ideally use AWS Secrets Manager. The IAM policies above should remediate the risk, but is not completely ideal. 

---

## Next

The app runs and your study configuration is settled. Packaging it into an
installer and getting that to participants is covered in
[Distributing to participants](distribute-to-participants.md).
