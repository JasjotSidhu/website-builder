import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run admin:promote -- <email>");
  process.exit(1);
}

const prisma = new PrismaClient();
const user = await prisma.user.update({
  where: { email },
  data: { role: "ADMIN" },
  select: { email: true, role: true },
});

console.log(`Promoted ${user.email} to ${user.role}`);
await prisma.$disconnect();
