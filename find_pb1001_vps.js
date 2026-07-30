const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function check() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: '1001', mode: 'insensitive' } },
        { lastName: { contains: '1001', mode: 'insensitive' } },
        { firstName: { contains: 'PB', mode: 'insensitive' } },
        { firstName: { contains: 'РВ', mode: 'insensitive' } } // Cyrillic
      ]
    }
  });
  console.log("Found Users:", users.map(u => ({ name: u.firstName, telegramId: u.telegramId.toString(), role: u.role })));
}
main().finally(() => prisma.$disconnect());
    `;

    fs.writeFileSync('temp_find.js', scriptContent);
    await ssh.putFile('temp_find.js', '/home/administrator/pobeda-kargo/find_pb1001.js');
    
    let res = await ssh.execCommand('node find_pb1001.js', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

check();
