## SavePoint Overview

This tool allows players to create and store notes taken during their gameplay sessions. You can see a short (and somewhat out of date) demo [here](https://www.youtube.com/watch?v=LIdFdVaLWCI&list=PLI1UA0q3OsunU0jM1oe7fMegbA5Yc4uJD). This is a great tool for researchers who study games and player experience, game developers in playtesting phases of development, or for everyday players who might just want to annotate their gameplay. 

## Getting Started

[NOTE: If you know Nisha personally, you can skip all of the following steps and send her an email asking for a build to test the app out. If you want to run your own study, you'll need to follow all the steps below for data collection purposes. Please do not use Nisha's test build to run your studies.]

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

If you don't know what npm is, you may need to follow the more detailed instructions [here](docs/build-the-app.md).

---

## Documentation

### Running a study

**[Setting up SavePoint for a study](docs/build-the-app.md)** — start here. Covers how to install and configure SavePoint for your own study usage. 

**[Distributing to participants](docs/distribute-to-participants.md)** — Covers how to build and send an app installer to your participants. 

**[How session data is stored in S3](docs/s3-data-structure.md)** — Covers how the app currently organizes tool data in S3. 

**[Settings guide](docs/config.md)** — Covers every setting in the app. 

**[Common bugs](docs/common-bugs.md)** — Covers failure modes I've experienced in my own deployment studies with SavePoint. 

### For your participants

**[Installing SavePoint](docs/app-installation-participants.md)** — Tells participants how to install the app from the installer you send them. 

**[Setting up OBS](docs/configure-obs.md)** — Participant instructions for setting up OBS. Only needed if you choose to have OBS as your recording backend (considered more robust but more annoying; see [here](docs/build-the-app.md) for more info). 

**[Using SavePoint](docs/using-the-app.md)** — How to actually use the app. 
