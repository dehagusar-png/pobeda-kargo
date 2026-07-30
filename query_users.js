const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function query() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    // Create a temporary script on the VPS to run prisma query
    const scriptContent = `
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      async function main() {
        const users = await prisma.user.findMany();
        console.log("USERS:", JSON.stringify(users, null, 2));
      }
      main().catch(console.error).finally(() => prisma.$disconnect());
    `;
    
    await ssh.execCommand(`cat << 'EOF' > test_query.js\n${scriptContent}\nEOF`, { cwd: '/home/administrator/pobeda-kargo' });
    const result = await ssh.execCommand('node test_query.js', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(result.stdout);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

query();
