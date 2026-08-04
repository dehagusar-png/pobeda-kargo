const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function update() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    console.log('Pulling latest code...');
    await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('Restarting bot...');
    await ssh.execCommand('pm2 restart pobeda-bot', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('Building Scanner App...');
    await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/scanner-app' });
    console.log('Building Admin Panel...');
    await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/admin-panel' });
    console.log('Restarting pobeda-admin-panel...');
    await ssh.execCommand('pm2 restart pobeda-admin-panel', { cwd: '/home/administrator/pobeda-kargo' });
    
    console.log('Updating Nginx domain...');
    await ssh.execCommand('echo "s(38U1H37h" | sudo -S sed -i "s/server_name admin.gusar.tj;/server_name pobedacargo1.gusar.tj;/g" /etc/nginx/sites-available/pobeda-admin');
    await ssh.execCommand('echo "s(38U1H37h" | sudo -S systemctl restart nginx');
    
    console.log('Done!');
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
update();
