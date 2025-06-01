import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCustomerSchema,
  insertJobSchema,
  insertInvoiceSchema,
  insertEquipmentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // User is already attached to request by isAuthenticated middleware
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/auth/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { companyName, fullName, isSolo } = req.body;

      // Create company
      const company = await storage.createCompany({
        id: `company_${userId}`,
        name: companyName,
        isSolo: isSolo,
      });

      // Update user with company info
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: firstName,
        lastName: lastName || "",
        companyId: company.id,
        role: "admin",
        isOwner: true,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }
      
      const stats = await storage.getDashboardStats(user.companyId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/todays-jobs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }
      
      const jobs = await storage.getTodaysJobs(user.companyId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching today's jobs:", error);
      res.status(500).json({ message: "Failed to fetch today's jobs" });
    }
  });

  // Customer routes
  app.get("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const customers = await storage.getCustomers(user.companyId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const customerData = insertCustomerSchema.parse({
        ...req.body,
        companyId: user.companyId,
      });
      
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const customer = await storage.getCustomer(customerId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const updateData = insertCustomerSchema.partial().parse(req.body);
      
      const customer = await storage.updateCustomer(customerId, updateData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      await storage.deleteCustomer(customerId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Equipment routes
  app.get("/api/customers/:id/equipment", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const equipment = await storage.getEquipmentByCustomer(customerId);
      res.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment", isAuthenticated, async (req, res) => {
    try {
      const equipmentData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(equipmentData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      }
      console.error("Error creating equipment:", error);
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  // Job routes
  app.get("/api/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { status, date, technicianId } = req.query;
      const jobs = await storage.getJobs(user.companyId, {
        status: status as string,
        date: date as string,
        technicianId: technicianId as string,
      });
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const jobData = insertJobSchema.parse({
        ...req.body,
        companyId: user.companyId,
        technicianId: user.role === "SoloOwner" ? user.id : req.body.technicianId,
      });
      
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const updateData = insertJobSchema.partial().parse(req.body);
      
      // If job is being completed, set completion timestamp
      if (updateData.status === "completed" && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }
      
      const job = await storage.updateJob(jobId, updateData);
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      await storage.deleteJob(jobId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { status, overdue } = req.query;
      const invoices = await storage.getInvoices(user.companyId, {
        status: status as string,
        overdue: overdue === "true",
      });
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const invoiceData = insertInvoiceSchema.parse({
        ...req.body,
        companyId: user.companyId,
        invoiceNumber,
      });
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.put("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const updateData = insertInvoiceSchema.partial().parse(req.body);
      
      // If invoice is being marked as paid, set paid date
      if (updateData.status === "paid" && !updateData.paidDate) {
        updateData.paidDate = new Date().toISOString().split('T')[0];
      }
      
      const invoice = await storage.updateInvoice(invoiceId, updateData);
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Create invoice from completed job
  app.post("/api/jobs/:id/invoice", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.status !== "completed") {
        return res.status(400).json({ message: "Can only create invoices for completed jobs" });
      }

      const invoiceNumber = `INV-${Date.now()}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      const invoiceData = {
        companyId: user.companyId,
        customerId: job.customerId,
        jobId: job.id,
        invoiceNumber,
        amount: job.actualCost || job.estimatedCost || "0",
        laborCost: job.actualCost || "0",
        materialCost: "0", // Could be calculated from parts used
        status: "pending" as const,
        dueDate: dueDate.toISOString().split('T')[0],
        notes: `Invoice for ${job.title}`,
      };
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice from job:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
