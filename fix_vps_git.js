const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Fixing git issues...');
    await ssh.execCommand('rm -f temp_db_script.js test_query.js', { cwd: '/home/administrator/pobeda-kargo' });
    
    console.log('Git pull:');
    const pull = await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(pull.stdout);
    console.log(pull.stderr);

    console.log('Restarting bot...');
    await ssh.execCommand('pm2 restart pobeda-bot', { cwd: '/home/administrator/pobeda-kargo' });
    
    console.log('Building Scanner App...');
    await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/scanner-app' });
    
    console.log('Building Admin Panel...');
    await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/admin-panel' });
    
    console.log('Restarting pobeda-admin-panel...');
    await ssh.execCommand('pm2 restart pobeda-admin-panel', { cwd: '/home/administrator/pobeda-kargo' });

    ssh.dispose();
  } catch(e) {
    console.error(e);
  }
}
fix();
