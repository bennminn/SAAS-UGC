import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin ---
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin-change-me";
  if (adminEmail) {
    const hashed = await bcryptjs.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: {
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
        hashedPassword: hashed,
        planId: "business",
        creditsRemaining: 999999,
      },
    });
    console.log(`Admin listo: ${adminEmail} (password inicial: ${adminPassword})`);
  } else {
    console.log("ADMIN_EMAIL no configurado — saltando creacion de admin");
  }

  // --- Templates ---
  const templates = [
    { name: "Resena Entusiasta", description: "Resena positiva y energetica", category: "resena-producto", platform: "TIKTOK" as const },
    { name: "Unboxing Sorpresa", description: "Reaccion al abrir un producto", category: "unboxing", platform: "REELS" as const },
    { name: "Tutorial Rapido", description: "Paso a paso en 60 segundos", category: "tutorial", platform: "TIKTOK" as const },
    { name: "Testimonio Personal", description: "Historia personal con producto", category: "testimonial", platform: "REELS" as const },
    { name: "Versus Competencia", description: "Comparacion objetiva", category: "comparacion", platform: "TIKTOK" as const },
    { name: "Transformacion", description: "Antes y despues con producto", category: "antes-despues", platform: "REELS" as const },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.category },
      update: template,
      create: { id: template.category, ...template },
    });
  }

  console.log("Seed completado: templates + admin (si aplica)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
