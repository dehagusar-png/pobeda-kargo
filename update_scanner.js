const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Pulling git...');
    let res = await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    console.log('Building scanner-app...');
    res = await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/scanner-app' });
    console.log(res.stdout, res.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
