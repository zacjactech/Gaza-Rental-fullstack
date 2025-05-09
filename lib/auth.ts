import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from './services/auth-service';

/**
 * Configuration options for NextAuth
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { user, token } = await authService.login(
            credentials.email,
            credentials.password
          );

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            token
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=auth',
    signOut: '/'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Get the current user's session
 */
export async function getCurrentUser(req: Request) {
  // This is a simplified version for API routes
  // In practice, you should use the getServerSession from next-auth/next
  
  // Extract token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify token and get user
    const user = await authService.validateToken(token);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export default {
  authOptions,
  getCurrentUser
}; 