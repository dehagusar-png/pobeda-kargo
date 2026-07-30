const { NodeSSH } = require('node-ssh');
const fs = require('fs');

const ssh = new NodeSSH();

async function fixEnv() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    console.log('Connected to VPS...');
    
    const repoPath = '/home/administrator/pobeda-kargo';

    const newEnv = `DATABASE_URL="postgresql://pobeda_user:pobeda_pass123@localhost:5432/pobeda"
DIRECT_URL="postgresql://pobeda_user:pobeda_pass123@localhost:5432/pobeda"

BOT_TOKEN="8856113500:AAEnlsof7ANvp7cfYhRVyS0_MOlysRn7z24"
SUPERADMIN_PIN=7777`;
    
    fs.writeFileSync('server.env', newEnv);

    console.log('Uploading fixed .env to server...');
    await ssh.putFile('server.env', `${repoPath}/.env`);
    await ssh.putFile('server.env', `${repoPath}/admin-panel/.env`);

    
    console.log('Restarting bot...');
    await ssh.execCommand('pm2 reload pobeda-bot --update-env', { cwd: repoPath });

    console.log('Fix applied successfully!');
    ssh.dispose();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixEnv();
