const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
(async () => {
  try {
    await ssh.connect({host:'93.127.134.253',username:'administrator',password:'s(38U1H37h'});
    console.log('Pulling latest code...');
    await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('Building admin-panel...');
    await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/admin-panel' });
    console.log('Restarting PM2 for admin-panel...');
    await ssh.execCommand('pm2 restart pobeda-admin-panel', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('Done!');
    ssh.dispose();
  } catch(e) { console.error(e); process.exit(1); }
})();
