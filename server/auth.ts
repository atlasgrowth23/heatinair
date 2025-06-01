import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { z } from "zod";

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function setupAuth(app: Express) {
  // Google OAuth endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${req.protocol}://${req.get('host')}/auth/callback`,
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
  app.get("/auth/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(String(code));
        
        if (error) {
          console.error("OAuth callback error:", error);
          return res.redirect("/?error=auth_failed");
        }

        if (data.user) {
          // Check if user exists in our database
          let dbUser = await storage.getUser(data.user.id);
          
          if (!dbUser) {
            // Create user without company (onboarding will handle company creation)
            dbUser = await storage.upsertUser({
              id: data.user.id,
              email: data.user.email!,
              firstName: data.user.user_metadata?.full_name?.split(' ')[0] || "User",
              lastName: data.user.user_metadata?.full_name?.split(' ')[1] || "",
              companyId: null,
              role: "admin",
              isOwner: false,
              hasCompletedOnboarding: false,
            });
          }
        }
        
        // Redirect to app with auth success
        res.redirect("/?auth=success");
      } else {
        res.redirect("/?error=no_code");
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Sign up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
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

      // Create user in our database without company (onboarding will handle it)
      const user = await storage.upsertUser({
        id: authData.user.id,
        email: authData.user.email!,
        firstName,
        lastName,
        companyId: null,
        role: "admin",
        isOwner: false,
        hasCompletedOnboarding: false,
      });

      res.status(201).json({ 
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
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
      const { email, password } = req.body;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ message: authError.message });
      }

      if (!authData.user || !authData.session) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user from our database
      const user = await storage.getUser(authData.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found in database" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          companyId: user.companyId,
          role: user.role,
        },
        session: authData.session
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Get user from our database
      const user = await storage.getUser(authUser.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        companyId: user.companyId,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Complete onboarding
  app.post('/api/auth/complete-onboarding', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { teamSize } = req.body;
      const userId = authUser.id;

      // Get current user
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Determine role and company setup based on team size
      const isSolo = teamSize === 'solo';
      const role = isSolo ? 'solo_owner' : 'admin';
      
      // Create company using email as base name
      const emailName = currentUser.email?.split('@')[0] || 'HVAC Company';
      const company = await storage.createCompany({
        id: `company_${userId}`,
        name: `${emailName} HVAC Services`,
        isSolo: isSolo,
      });

      // Update user with company info and onboarding completion
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        companyId: company.id,
        role: role,
        isOwner: true,
        hasCompletedOnboarding: true,
      });

      res.json({ 
        success: true, 
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
          companyId: updatedUser.companyId,
          role: updatedUser.role,
        }
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await storage.getUser(authUser.id);
    
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