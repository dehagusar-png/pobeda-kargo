const { NodeSSH } = require('node-ssh');
const fs = require('fs');

const ssh = new NodeSSH();

async function runSuperAdmin() {
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

    // Upload the modified script to the server
    console.log('Uploading updated makeSuperAdmin.ts...');
    await ssh.putFile('makeSuperAdmin.ts', `${repoPath}/makeSuperAdmin.ts`);

    // Run the script
    console.log('Running makeSuperAdmin.ts on server...');
    await executeCommand('npx tsx makeSuperAdmin.ts', repoPath);
    
    console.log('Done!');
    ssh.dispose();
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

runSuperAdmin();
