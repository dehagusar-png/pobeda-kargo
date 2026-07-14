const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', '..', 'prisma', 'schema.prisma');
const destDir = path.join(__dirname, '..', 'prisma');
const dest = path.join(destDir, 'schema.prisma');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(source, dest);
  console.log('✅ Successfully synchronized Prisma schema from the root directory.');
} catch (error) {
  console.error('❌ Failed to synchronize Prisma schema:', error.message);
  process.exit(1);
}
