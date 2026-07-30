const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('--- PM2 status ---');
    let res = await ssh.execCommand('pm2 status');
    console.log(res.stdout);
    
    console.log('--- Nginx sites ---');
    res = await ssh.execCommand('ls -la /etc/nginx/sites-enabled/');
    console.log(res.stdout);
    
    console.log('--- asham config ---');
    res = await ssh.execCommand('cat /etc/nginx/sites-enabled/asham');
    console.log(res.stdout);
    
    console.log('--- pobeda-admin config ---');
    res = await ssh.execCommand('cat /etc/nginx/sites-enabled/pobeda-admin');
    console.log(res.stdout);

    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
