const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function setupDatabase() {
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

    const pwd = 's(38U1H37h';
    const repoPath = '/home/administrator/pobeda-kargo';

    // 1. Install PostgreSQL
    console.log('Installing PostgreSQL...');
    await executeCommand(`echo "${pwd}" | sudo -S apt-get update`);
    await executeCommand(`echo "${pwd}" | sudo -S apt-get install -y postgresql postgresql-contrib`);

    // 2. Create Database and User
    console.log('Setting up Database and User...');
    await executeCommand(`echo "${pwd}" | sudo -S -u postgres psql -c "CREATE DATABASE pobeda;" || true`);
    await executeCommand(`echo "${pwd}" | sudo -S -u postgres psql -c "CREATE USER pobeda_user WITH PASSWORD 'pobeda_pass123';" || true`);
    await executeCommand(`echo "${pwd}" | sudo -S -u postgres psql -c "ALTER USER pobeda_user WITH PASSWORD 'pobeda_pass123';"`);
    await executeCommand(`echo "${pwd}" | sudo -S -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pobeda TO pobeda_user;"`);
    await executeCommand(`echo "${pwd}" | sudo -S -u postgres psql -d pobeda -c "GRANT ALL ON SCHEMA public TO pobeda_user;"`);

    // 3. Update .env on the server
    console.log('Updating .env on server...');
    const newDbUrl = 'postgresql://pobeda_user:pobeda_pass123@localhost:5432/pobeda';
    
    // We will use sed to replace DATABASE_URL and DIRECT_URL
    await executeCommand(`sed -i 's|^DATABASE_URL=.*|DATABASE_URL="${newDbUrl}"|g' ${repoPath}/.env`);
    await executeCommand(`sed -i 's|^DIRECT_URL=.*|DIRECT_URL="${newDbUrl}"|g' ${repoPath}/.env`);
    await executeCommand(`sed -i 's|^DATABASE_URL=.*|DATABASE_URL="${newDbUrl}"|g' ${repoPath}/admin-panel/.env`);

    // 4. Run Prisma commands
    console.log('Applying Database Schema...');
    await executeCommand('npx prisma generate', repoPath);
    await executeCommand('npx prisma db push --accept-data-loss', repoPath);
    
    // Also run for admin-panel just in case
    await executeCommand('npx prisma generate', `${repoPath}/admin-panel`);

    // 5. Rebuild Next.js (Since it might need the DB for static generation)
    console.log('Rebuilding Admin Panel...');
    await executeCommand('npm run build', `${repoPath}/admin-panel`);

    // 6. Restart PM2 apps
    console.log('Restarting services...');
    await executeCommand('pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js', repoPath);

    console.log('Database migration completed successfully!');
    ssh.dispose();
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  }
}

setupDatabase();
