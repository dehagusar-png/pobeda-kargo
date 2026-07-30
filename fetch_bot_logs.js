const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function getLogs() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    console.log('Fetching PM2 logs for pobeda-bot...');
    const result = await ssh.execCommand('pm2 logs pobeda-bot --lines 50 --nostream', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('STDOUT:\n', result.stdout);
    console.log('STDERR:\n', result.stderr);
    ssh.dispose();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getLogs();
