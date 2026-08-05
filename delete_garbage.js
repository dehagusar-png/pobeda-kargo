const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function clean() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    console.log('Running delete query on VPS...');
    const script = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const badCodes = ['61027612335400530001', '6802761233543000000001', '465461330878621538', '607401060379229987'];
  await prisma.parcelHistory.deleteMany({ where: { parcel: { trackCode: { in: badCodes } } } });
  await prisma.parcel.deleteMany({ where: { trackCode: { in: badCodes } } });
  console.log('Done cleaning');
}
main().catch(console.error).finally(() => process.exit(0));
    `;
    
    await ssh.execCommand('cat > clean_garbage.js', { cwd: '/home/administrator/pobeda-kargo', stdin: script });
    const res = await ssh.execCommand('node clean_garbage.js', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
  }
}
clean();
