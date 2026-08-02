const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
(async () => {
  await ssh.connect({host:'93.127.134.253',username:'administrator',password:'s(38U1H37h'});
  await ssh.execCommand('echo "s(38U1H37h" | sudo -S chmod 755 /home/administrator');
  await ssh.execCommand('echo "s(38U1H37h" | sudo -S chmod 755 /home/administrator/pobeda-kargo');
  await ssh.execCommand('echo "s(38U1H37h" | sudo -S chmod -R 755 /home/administrator/pobeda-kargo/scanner-app/dist');
  console.log('Done');
  ssh.dispose();
})();
