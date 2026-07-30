const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function update() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Forcing git update...');
    let result = await ssh.execCommand('git fetch origin && git reset --hard origin/main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('git result:', result.stdout, result.stderr);
    
    console.log('Building scanner...');
    await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/scanner-app' });
    
    console.log('Restarting bot...');
    await ssh.execCommand('pm2 restart pobeda-bot', { cwd: '/home/administrator/pobeda-kargo' });
    
    console.log('Checking admin.ts...');
    result = await ssh.execCommand('cat src/handlers/admin.ts', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('admin.ts:\n', result.stdout);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

update();
