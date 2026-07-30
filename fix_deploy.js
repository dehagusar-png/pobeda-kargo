const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Fixing git pull...');
    await ssh.execCommand('rm set_superadmin.js deploy_superadmin.js temp_script.js', { cwd: '/home/administrator/pobeda-kargo' });
    
    let res = await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);

    console.log('Restarting Bot...');
    res = await ssh.execCommand('pm2 reload pobeda-bot --update-env', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
