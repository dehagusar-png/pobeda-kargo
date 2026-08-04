const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Connected! Deleting all audit logs...');
    const result = await ssh.execCommand('npx prisma db execute --schema prisma/schema.prisma --stdin <<EOF\nDELETE FROM "AuditLog";\nEOF\n', { cwd: '/home/administrator/pobeda-kargo' });
    console.log('STDOUT:', result.stdout);
    console.error('STDERR:', result.stderr);
    
    console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
