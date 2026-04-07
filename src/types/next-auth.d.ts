import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      planId: string;
      creditsRemaining: number;
    };
  }

  interface User {
    id: string;
    role: string;
    planId: string;
    creditsRemaining: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    planId: string;
    creditsRemaining: number;
  }
}
