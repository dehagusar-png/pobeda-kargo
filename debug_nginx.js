const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('--- Nginx T test ---');
    let res = await ssh.execCommand('echo "s(38U1H37h" | sudo -S nginx -T');
    
    // We only want the relevant parts
    const output = res.stdout;
    const asham = output.split('# configuration file /etc/nginx/sites-enabled/asham:')[1]?.split('# configuration file')[0] || '';
    const pobedaAdmin = output.split('# configuration file /etc/nginx/sites-enabled/pobeda-admin:')[1]?.split('# configuration file')[0] || '';
    
    console.log('asham config:\n', asham);
    console.log('pobeda-admin config:\n', pobedaAdmin);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
