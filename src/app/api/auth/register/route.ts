import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email y contrasena (min 8 caracteres) son requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const isAdmin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;

    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: isAdmin ? "ADMIN" : "USER",
        creditsRemaining: isAdmin ? 999999 : 3,
      },
    });

    return NextResponse.json({ message: "Cuenta creada exitosamente" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
