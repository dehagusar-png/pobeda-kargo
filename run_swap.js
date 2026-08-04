const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();

async function run() {
  await ssh.connect({
    host: '93.127.134.253',
    username: 'administrator',
    password: 's(38U1H37h'
  });
  
  const dbScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { clientCode: { in: ['PB-1001', 'PB-1002'] } }
  });
  
  const pb1001 = users.find(u => u.clientCode === 'PB-1001');
  const pb1002 = users.find(u => u.clientCode === 'PB-1002');
  
  if (pb1001) {
    await prisma.user.update({
      where: { id: pb1001.id },
      data: { clientCode: 'PB-TEMP' }
    });
  }
  
  if (pb1002) {
    await prisma.user.update({
      where: { id: pb1002.id },
      data: { clientCode: 'PB-1001' }
    });
  }
  
  if (pb1001) {
    await prisma.user.update({
      where: { id: pb1001.id },
      data: { clientCode: 'PB-1002' }
    });
  }
  console.log("SUCCESS");
}
main().finally(() => prisma.$disconnect());
  `;
  
  fs.writeFileSync('temp_db_script.js', dbScript);
  await ssh.putFile('temp_db_script.js', '/home/administrator/pobeda-kargo/temp_db_script.js');
  const res = await ssh.execCommand('node temp_db_script.js', { cwd: '/home/administrator/pobeda-kargo' });
  console.log(res.stdout);
  console.log(res.stderr);
  ssh.dispose();
}

run().catch(console.error);
