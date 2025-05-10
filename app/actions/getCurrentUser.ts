import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/user";

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    await connectToDatabase();
    
    const currentUser = await User.findOne({ email: session.user.email }).lean();

    if (!currentUser) {
      return null;
    }

    return {
      ...currentUser,
      id: currentUser._id.toString(),
      createdAt: currentUser.createdAt?.toISOString(),
      updatedAt: currentUser.updatedAt?.toISOString(),
      emailVerified: currentUser.emailVerified?.toISOString() || null,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
} 