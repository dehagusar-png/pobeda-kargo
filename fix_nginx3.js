const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Uploading Nginx config...');
    await ssh.putFile(
      path.join(__dirname, 'pobeda-admin-nginx'),
      '/home/administrator/pobeda-admin-nginx'
    );
    
    console.log('Applying config...');
    await ssh.execCommand('echo "s(38U1H37h" | sudo -S cp /home/administrator/pobeda-admin-nginx /etc/nginx/sites-available/pobeda-admin');
    
    console.log('Checking nginx...');
    let res = await ssh.execCommand('echo "s(38U1H37h" | sudo -S nginx -t');
    console.log(res.stdout, res.stderr);
    
    console.log('Restarting nginx...');
    res = await ssh.execCommand('echo "s(38U1H37h" | sudo -S systemctl restart nginx');
    console.log(res.stdout, res.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fix();
