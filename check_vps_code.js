const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Checking VPS code...');
    let result = await ssh.execCommand('cat src/handlers/admin.ts', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('src/handlers/admin.ts:\n', result.stdout);
    
    result = await ssh.execCommand('git status', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('git status:\n', result.stdout, '\nSTDERR:\n', result.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

check();
