import {
  users,
  companies,
  customers,
  equipment,
  jobs,
  invoices,
  serviceHistory,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Customer,
  type InsertCustomer,
  type Equipment,
  type InsertEquipment,
  type Job,
  type InsertJob,
  type Invoice,
  type InsertInvoice,
  type ServiceHistory,
  type InsertServiceHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Customer operations
  getCustomers(companyId: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;
  
  // Equipment operations
  getEquipmentByCustomer(customerId: number): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment>;
  deleteEquipment(id: number): Promise<void>;
  
  // Job operations
  getJobs(companyId: string, filters?: { date?: string; status?: string; technicianId?: string }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  getTodaysJobs(companyId: string): Promise<Job[]>;
  getJobsByTechnician(technicianId: string): Promise<Job[]>;
  
  // Invoice operations
  getInvoices(companyId: string, filters?: { status?: string; overdue?: boolean }): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;
  getOverdueInvoices(companyId: string): Promise<Invoice[]>;
  
  // Service history operations
  getServiceHistory(customerId: number): Promise<ServiceHistory[]>;
  createServiceHistory(history: InsertServiceHistory): Promise<ServiceHistory>;
  
  // Dashboard operations
  getDashboardStats(companyId: string): Promise<{
    todaysJobs: number;
    completedJobs: number;
    revenue: number;
    overdueInvoices: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  // Customer operations
  async getCustomers(companyId: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.companyId, companyId));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Equipment operations
  async getEquipmentByCustomer(customerId: number): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.customerId, customerId));
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [created] = await db.insert(equipment).values(equipmentData).returning();
    return created;
  }

  async updateEquipment(id: number, equipmentData: Partial<InsertEquipment>): Promise<Equipment> {
    const [updated] = await db
      .update(equipment)
      .set(equipmentData)
      .where(eq(equipment.id, id))
      .returning();
    return updated;
  }

  async deleteEquipment(id: number): Promise<void> {
    await db.delete(equipment).where(eq(equipment.id, id));
  }

  // Job operations
  async getJobs(companyId: string, filters?: { date?: string; status?: string; technicianId?: string }): Promise<Job[]> {
    let conditions = [eq(jobs.companyId, companyId)];
    
    if (filters?.status) {
      conditions.push(eq(jobs.status, filters.status));
    }
    
    if (filters?.technicianId) {
      conditions.push(eq(jobs.technicianId, filters.technicianId));
    }
    
    return await db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.scheduledDate));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job> {
    const [updated] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getTodaysJobs(companyId: string): Promise<Job[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.companyId, companyId),
          gte(jobs.scheduledDate, startOfDay),
          lte(jobs.scheduledDate, endOfDay)
        )
      )
      .orderBy(jobs.scheduledDate);
  }

  async getJobsByTechnician(technicianId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.technicianId, technicianId))
      .orderBy(desc(jobs.scheduledDate));
  }

  // Invoice operations
  async getInvoices(companyId: string, filters?: { status?: string; overdue?: boolean }): Promise<Invoice[]> {
    let conditions = [eq(invoices.companyId, companyId)];
    
    if (filters?.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    
    if (filters?.overdue) {
      const today = new Date();
      conditions.push(and(eq(invoices.status, "pending"), lte(invoices.dueDate, today.toISOString().split('T')[0])));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return await db.select().from(invoices).where(whereClause).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getOverdueInvoices(companyId: string): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.companyId, companyId),
          eq(invoices.status, "pending"),
          lte(invoices.dueDate, today)
        )
      )
      .orderBy(invoices.dueDate);
  }

  // Service history operations
  async getServiceHistory(customerId: number): Promise<ServiceHistory[]> {
    return await db
      .select()
      .from(serviceHistory)
      .where(eq(serviceHistory.customerId, customerId))
      .orderBy(desc(serviceHistory.serviceDate));
  }

  async createServiceHistory(history: InsertServiceHistory): Promise<ServiceHistory> {
    const [created] = await db.insert(serviceHistory).values(history).returning();
    return created;
  }

  // Dashboard operations
  async getDashboardStats(companyId: string): Promise<{
    todaysJobs: number;
    completedJobs: number;
    revenue: number;
    overdueInvoices: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's jobs
    const todaysJobs = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.companyId, companyId),
          gte(jobs.scheduledDate, startOfDay),
          lte(jobs.scheduledDate, endOfDay)
        )
      );

    // Get completed jobs today
    const completedJobs = todaysJobs.filter(job => job.status === 'completed');

    // Calculate today's revenue
    const revenue = completedJobs.reduce((sum, job) => {
      return sum + (parseFloat(job.actualCost?.toString() || "0"));
    }, 0);

    // Get overdue invoices
    const overdueInvoices = await this.getOverdueInvoices(companyId);

    return {
      todaysJobs: todaysJobs.length,
      completedJobs: completedJobs.length,
      revenue,
      overdueInvoices: overdueInvoices.length,
    };
  }
}

export const storage = new DatabaseStorage();
