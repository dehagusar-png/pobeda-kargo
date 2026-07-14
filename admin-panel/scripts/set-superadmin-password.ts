import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = 'spn2211';
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.user.updateMany({
    where: { phone: { in: ['+992928153531', '79801868277'] } },
    data: { role: 'SUPERADMIN', password: hashedPassword }
  });

  console.log(`Successfully updated password for ${result.count} SUPERADMIN(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
