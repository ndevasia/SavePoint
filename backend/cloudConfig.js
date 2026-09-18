const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // absent .env is fine — see resolveCloudConfig

// Every field is required before we attempt to talk to AWS at all.
const CLOUD_FIELDS = ['region', 'bucket', 'roleArn', 'accessKeyId', 'secretAccessKey'];

const ENV_KEYS = {
  region: 'AWS_REGION',
  bucket: 'AWS_BUCKET_NAME',
  roleArn: 'AWS_ROLE_ARN',
  accessKeyId: 'AWS_ACCESS_KEY_ID',
  secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
};

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readEnvCloudConfig() {
  const config = {};
  for (const field of CLOUD_FIELDS) {
    config[field] = normalize(process.env[ENV_KEYS[field]]);
  }
  return config;
}

function readSettingsCloudConfig(appConfig) {
  const stored = (appConfig && appConfig.aws) || {};
  const config = {};
  for (const field of CLOUD_FIELDS) {
    config[field] = normalize(stored[field]);
  }
  return config;
}

function isCloudConfigComplete(config) {
  return CLOUD_FIELDS.every((field) => normalize(config && config[field]).length > 0);
}

/**
 * Work out which S3 configuration the app should use, if any.
 *
 * A build handed to study participants bakes credentials into backend/.env, so
 * those win when present and participants never see a setup screen. Otherwise we
 * fall back to whatever was entered in Settings. Neither is required: when both
 * are incomplete the app runs local-only instead of failing to start.
 */
function resolveCloudConfig(appConfig) {
  const env = readEnvCloudConfig();
  if (isCloudConfigComplete(env)) {
    return { config: env, source: 'env', complete: true };
  }

  const settings = readSettingsCloudConfig(appConfig);
  if (isCloudConfigComplete(settings)) {
    return { config: settings, source: 'settings', complete: true };
  }

  return { config: settings, source: 'none', complete: false };
}

function getEnvFilePath() {
  return path.join(__dirname, '.env');
}

function formatEnvValue(value) {
  // dotenv reads an unquoted value to the end of the line, so quoting is only
  // needed for values that would otherwise be trimmed or treated as a comment.
  return /[\s#'"]/.test(value) ? JSON.stringify(value) : value;
}

/**
 * Write the AWS keys into backend/.env so a researcher can package a build that
 * carries them. Any other key already in the file (GEMINI_API_KEY, comments,
 * blank lines) is preserved exactly as written.
 *
 * Only usable when running from a checkout — inside a packaged app this path
 * points into the read-only asar archive.
 */
async function writeEnvCloudConfig(config) {
  const envPath = getEnvFilePath();

  let lines = [];
  try {
    lines = (await fs.promises.readFile(envPath, 'utf8')).split(/\r?\n/);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const pending = new Set(CLOUD_FIELDS);
  const updated = lines.map((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) return line;
    const field = CLOUD_FIELDS.find((candidate) => ENV_KEYS[candidate] === match[1]);
    if (!field) return line; // an unrelated key — leave it alone
    pending.delete(field);
    return `${ENV_KEYS[field]}=${formatEnvValue(normalize(config[field]))}`;
  });

  // Trim trailing blanks so appended keys don't land after a gap.
  while (updated.length && updated[updated.length - 1].trim() === '') {
    updated.pop();
  }

  for (const field of CLOUD_FIELDS) {
    if (pending.has(field)) {
      updated.push(`${ENV_KEYS[field]}=${formatEnvValue(normalize(config[field]))}`);
    }
  }

  await fs.promises.writeFile(envPath, `${updated.join('\n')}\n`, 'utf8');

  // dotenv only reads the file once at startup, so mirror the values into the
  // running process or the export won't take effect until a restart.
  for (const field of CLOUD_FIELDS) {
    process.env[ENV_KEYS[field]] = normalize(config[field]);
  }

  return envPath;
}

module.exports = {
  CLOUD_FIELDS,
  readEnvCloudConfig,
  readSettingsCloudConfig,
  isCloudConfigComplete,
  resolveCloudConfig,
  getEnvFilePath,
  writeEnvCloudConfig,
};
