const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fixSSL() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Requesting new SSL certificate for pobedacargo1.gusar.tj...');
    // Run certbot
    const result = await ssh.execCommand('echo "s(38U1H37h" | sudo -S certbot --nginx -d pobedacargo1.gusar.tj --non-interactive --agree-tos -m admin@gusar.tj --redirect');
    console.log('Certbot result:\n', result.stdout, '\nSTDERR:\n', result.stderr);
    
    console.log('Restarting Nginx...');
    await ssh.execCommand('echo "s(38U1H37h" | sudo -S systemctl restart nginx');
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixSSL();
