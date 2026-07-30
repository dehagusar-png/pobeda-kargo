const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function deploy() {
  try {
    await ssh.connect({
      host: '93.127.134.253',
      username: 'administrator',
      password: 's(38U1H37h'
    });
    
    // Write script on VPS
    const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const phoneToFind = '+992929121999';
  
  let user = await prisma.user.findFirst({
    where: { phone: { contains: '929121999' } }
  });

  if (!user) {
    console.log("Корбар бо ин рақам ёфт нашуд!");
    return;
  }

  user = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPERADMIN' }
  });

  console.log(\`Муваффақият! Корбар \${user.firstName} (ID: \${user.telegramId}) ба SUPERADMIN табдил ёфт.\`);
  console.log(\`Telegram ID: \${user.telegramId}\`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
    `;

    fs.writeFileSync('temp_script.js', scriptContent);
    await ssh.putFile('temp_script.js', '/home/administrator/pobeda-kargo/set_superadmin.js');
    
    console.log('Running script on VPS...');
    let res = await ssh.execCommand('node set_superadmin.js', { cwd: '/home/administrator/pobeda-kargo' });
    console.log(res.stdout, res.stderr);
    
    // Check if we need to update .env
    const stdoutStr = res.stdout;
    const match = stdoutStr.match(/Telegram ID: (\d+)/);
    if (match) {
      const tgId = match[1];
      console.log(`Found TG ID: ${tgId}, updating .env...`);
      await ssh.execCommand(`sed -i 's/^SUPERADMIN_ID=.*/SUPERADMIN_ID=${tgId}/' .env`, { cwd: '/home/administrator/pobeda-kargo' });
      await ssh.execCommand(`pm2 reload pobeda-bot --update-env`, { cwd: '/home/administrator/pobeda-kargo' });
      console.log('Bot reloaded with new SUPERADMIN_ID!');
    }
    
    ssh.dispose();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

deploy();
