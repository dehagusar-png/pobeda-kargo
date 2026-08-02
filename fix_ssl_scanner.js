const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Running certbot for scanner.gusar.tj...');
    let res = await ssh.execCommand('echo "s(38U1H37h" | sudo -S certbot --nginx -d scanner.gusar.tj --non-interactive --agree-tos -m sabir@gusar.tj');
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
