const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Git status:');
    const status = await ssh.execCommand('git status', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(status.stdout);
    console.log(status.stderr);
    
    console.log('Git pull:');
    const pull = await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(pull.stdout);
    console.log(pull.stderr);

    ssh.dispose();
  } catch(e) {
    console.error(e);
  }
}
check();
