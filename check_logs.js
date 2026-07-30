const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Fetching logs...');
    let result = await ssh.execCommand('pm2 logs pobeda-bot --lines 30 --nostream', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('LOGS:\n', result.stdout, '\n', result.stderr);
    
    console.log('Fetching .env...');
    result = await ssh.execCommand('cat .env', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('ENV:\n', result.stdout);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

check();
