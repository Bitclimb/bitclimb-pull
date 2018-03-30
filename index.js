const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = path.resolve(__dirname, 'config.json');
if (!fs.existsSync(config)) {
  fs.writeFileSync(config, JSON.stringify({}, null, 2));
}

const gitPull = (rootpath) => {
  const child = spawn('git', ['pull', 'origin', 'master'], { cwd: rootpath, windowsHide: true });
  child.stdout.on('data', (data) => {
    if (!data.toString().includes('up-to-date')) {
      console.log(data.toString());
    }
  });
  child.on('close', () => {
    console.log(path.parse(rootpath).base, 'up-to-date');
  });
};

exports.pull = async pathArr => {
  const cf = require(config);
  if (!Array.isArray(pathArr)) {
    pathArr = [pathArr];
  }
  for (let apps of pathArr) {
    if (!path.isAbsolute(apps)) {
      if (!cf.base) {
        console.log(`[WARN] base config is not set, this will use ${process.env.HOME} as the base path`);
        apps = path.resolve(process.env.HOME, apps);
      } else {
        apps = path.resolve(cf.base, apps);
      }
    }
    gitPull(apps);
  }
};
exports.set = (key, value) => {
  const cf = require(config);
  cf[key] = value;
  fs.writeFileSync(config, JSON.stringify(cf, null, 2));
  delete require.cache[require.resolve(config)];
};
