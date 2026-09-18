const { readConfig, writeConfig } = require('./config.js');
const AWSManager = require('./backend/aws.js');
const { resolveCloudConfig } = require('./backend/cloudConfig.js');

async function readUsername() {
    return (await readConfig()).username;
}

async function writeUsername(username) {
    await writeConfig({ username });
}

async function submitUsername(username) {
    await writeUsername(username);

    // Cloud storage is optional, so a local-only install has no credentials to
    // set up S3 folders with. Never let that block creating the user.
    const { config, complete } = resolveCloudConfig(await readConfig());
    if (!complete) return null;

    try {
        const awsManager = new AWSManager(username, config);
        await awsManager.init();
        await awsManager.createFileStructure(username);
        return awsManager;
    } catch (err) {
        console.warn('Skipping S3 setup for new user:', err && err.message ? err.message : err);
        return null;
    }
}

module.exports = {
    readUsername,
    writeUsername,
    submitUsername
};
