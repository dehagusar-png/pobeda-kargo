const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    // get asham content
    let res = await ssh.execCommand('cat /etc/nginx/sites-available/asham');
    let content = res.stdout;
    
    // remove broken lines
    content = content.replace(/listen 443 ssl;.*/g, '');
    content = content.replace(/include \/etc\/letsencrypt\/options-ssl-nginx.conf;.*/g, '');
    content = content.replace(/ssl_dhparam \/etc\/letsencrypt\/ssl-dhparams.pem;.*/g, '');
    
    // save to local file on vps
    const scriptContent = `cat << 'EOF' > /home/administrator/asham_fixed\n${content}\nEOF`;
    await ssh.execCommand(scriptContent);
    
    // move to nginx
    await ssh.execCommand('echo "s(38U1H37h" | sudo -S cp /home/administrator/asham_fixed /etc/nginx/sites-available/asham');
    
    console.log('Checking nginx...');
    res = await ssh.execCommand('echo "s(38U1H37h" | sudo -S nginx -t');
    console.log(res.stdout, res.stderr);
    
    if (res.stderr.includes('syntax is ok')) {
        console.log('Restarting nginx...');
        res = await ssh.execCommand('echo "s(38U1H37h" | sudo -S systemctl restart nginx');
        console.log(res.stdout, res.stderr);
    }
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fix();
