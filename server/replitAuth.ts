import { createClient } from '@supabase/supabase-js';
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { z } from "zod";

// Supabase client
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
});

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Google OAuth endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${req.protocol}://${req.hostname}/api/auth/callback`,
        },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ url: data.url });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({ message: "Failed to initiate Google sign-in" });
    }
  });

  // OAuth callback endpoint
  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.redirect("/?error=no_code");
      }

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code as string);

      if (error) {
        console.error("OAuth callback error:", error);
        return res.redirect("/?error=auth_failed");
      }

      if (!data.user) {
        return res.redirect("/?error=no_user");
      }

      // Check if user exists in our database
      let user = await storage.getUser(data.user.id);
      
      if (!user) {
        // Create company first for new Google users
        const company = await storage.createCompany({
          id: `company_${data.user.id}`,
          name: data.user.email?.split('@')[0] + " HVAC", // Default company name
        });

        // Create user in our database
        user = await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name || data.user.user_metadata?.full_name?.split(' ')[0] || "User",
          lastName: data.user.user_metadata?.last_name || data.user.user_metadata?.full_name?.split(' ')[1] || "",
          companyId: company.id,
          role: "SoloOwner",
        });
      }

      // Set session
      (req.session as any).userId = user.id;

      res.redirect("/");
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Sign up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName, companyName } = signupSchema.parse(req.body);
      
      const supabase = getSupabaseClient();
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return res.status(400).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ message: "Failed to create user" });
      }

      // Create company first
      const company = await storage.createCompany({
        id: `company_${authData.user.id}`,
        name: companyName,
      });

      // Create user in our database
      const user = await storage.upsertUser({
        id: authData.user.id,
        email: authData.user.email!,
        firstName,
        lastName,
        companyId: company.id,
        role: "SoloOwner",
      });

      // Set session
      (req.session as any).userId = user.id;

      res.status(201).json({ 
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const supabase = getSupabaseClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user from our database
      const user = await storage.getUser(authData.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found in database" });
      }

      // Set session
      (req.session as any).userId = user.id;

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
