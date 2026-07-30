const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Checking .env on VPS...');
    let res = await ssh.execCommand('cat .env', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
