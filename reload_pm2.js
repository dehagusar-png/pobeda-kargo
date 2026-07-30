const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function reload() {
  await ssh.connect({ host: '93.127.134.253', username: 'administrator', password: 's(38U1H37h' });
  await ssh.execCommand('pm2 reload pobeda-bot --update-env', { cwd: '/home/administrator/pobeda-kargo' });
  ssh.dispose();
}
reload();
