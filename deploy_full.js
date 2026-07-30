const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function deploy() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('1. Pulling git...');
    let res = await ssh.execCommand('git pull origin main', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    console.log('2. Installing bot dependencies...');
    res = await ssh.execCommand('npm install', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);

    console.log('3. Updating database schema...');
    res = await ssh.execCommand('npx prisma generate && npx prisma db push', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    console.log('4. Building scanner-app...');
    res = await ssh.execCommand('npm run build', { cwd: '/home/administrator/pobeda-kargo/scanner-app' });
    console.log(res.stdout, res.stderr);

    console.log('5. Restarting Bot & Admin Panel...');
    res = await ssh.execCommand('pm2 reload all --update-env', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

deploy();
