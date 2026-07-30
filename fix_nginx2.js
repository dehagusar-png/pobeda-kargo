const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Fixing asham config...');
    // We will remove the ssl lines that certbot added for pobedacargo1 in the asham config
    await ssh.execCommand(`echo "s(38U1H37h" | sudo -S sed -i '/pobedacargo1.gusar.tj/d' /etc/nginx/sites-available/asham`);
    
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
