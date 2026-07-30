const { NodeSSH } = require('node-ssh');
const fs = require('fs');

const ssh = new NodeSSH();

async function runDeploy() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    console.log('Connected successfully!');

    async function executeCommand(cmd, cwd = null) {
      console.log(`Executing: ${cmd}`);
      const result = await ssh.execCommand(cmd, { cwd });
      if (result.stdout) console.log(`STDOUT: ${result.stdout}`);
      if (result.stderr) console.error(`STDERR: ${result.stderr}`);
      return result;
    }

    const repoPath = '/home/administrator/pobeda-kargo';
    const pwd = 's(38U1H37h';

    // 1. Create directory and clone if not exists
    const checkRepo = await executeCommand(`test -d ${repoPath} && echo "EXISTS" || echo "NOT_EXISTS"`);
    if (checkRepo.stdout.includes('NOT_EXISTS')) {
      console.log('Cloning repository...');
      await executeCommand(`git clone https://github.com/dehagusar-png/pobeda-kargo.git ${repoPath}`);
    } else {
      console.log('Repository exists, pulling latest...');
      await executeCommand('git pull origin main', repoPath);
    }

    // 2. Upload .env file
    if (fs.existsSync('.env')) {
      console.log('Uploading .env...');
      await ssh.putFile('.env', `${repoPath}/.env`);
      await executeCommand(`mkdir -p ${repoPath}/admin-panel`);
      await ssh.putFile('.env', `${repoPath}/admin-panel/.env`);
    }

    // 3. Run deploy.sh
    console.log('Running deploy.sh...');
    await executeCommand('chmod +x deploy.sh', repoPath);
    await executeCommand('bash ./deploy.sh', repoPath);

    // 4. Setup Nginx
    console.log('Setting up Nginx...');
    
    const adminNginx = `server {
    listen 80;
    server_name admin.gusar.tj;

    location / {
        proxy_pass http://localhost:3035;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;
    fs.writeFileSync('nginx-admin.tmp', adminNginx);
    await ssh.putFile('nginx-admin.tmp', '/tmp/pobeda-admin');

    const scannerNginx = `server {
    listen 80;
    server_name scanner.gusar.tj;

    location / {
        root ${repoPath}/scanner-app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}`;
    fs.writeFileSync('nginx-scanner.tmp', scannerNginx);
    await ssh.putFile('nginx-scanner.tmp', '/tmp/pobeda-scanner');

    // Enable Nginx sites using sudo
    await executeCommand(`echo "${pwd}" | sudo -S mv /tmp/pobeda-admin /etc/nginx/sites-available/pobeda-admin`);
    await executeCommand(`echo "${pwd}" | sudo -S mv /tmp/pobeda-scanner /etc/nginx/sites-available/pobeda-scanner`);
    await executeCommand(`echo "${pwd}" | sudo -S ln -sf /etc/nginx/sites-available/pobeda-admin /etc/nginx/sites-enabled/`);
    await executeCommand(`echo "${pwd}" | sudo -S ln -sf /etc/nginx/sites-available/pobeda-scanner /etc/nginx/sites-enabled/`);
    await executeCommand(`echo "${pwd}" | sudo -S nginx -t && echo "${pwd}" | sudo -S systemctl restart nginx`);
    
    console.log('Deploy completed successfully!');
    ssh.dispose();
  } catch (error) {
    console.error('Connection/Deploy failed:', error);
    process.exit(1);
  }
}

runDeploy();
