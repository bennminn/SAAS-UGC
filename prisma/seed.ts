import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed templates
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

  console.log("Seed completed: 6 templates created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
