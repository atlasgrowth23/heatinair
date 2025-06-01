import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["solo_owner", "admin", "dispatcher", "tech"] }).notNull().default("admin"),
  isOwner: boolean("is_owner").default(false).notNull(),
  companyId: varchar("company_id"),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
  currentLocation: varchar("current_location"), // Updated via mobile app
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  isSolo: boolean("is_solo").default(true).notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  notes: text("notes"),
  preferredContactMethod: varchar("preferred_contact_method"), // email, phone, text
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  make: varchar("make"),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  type: varchar("type").notNull(), // HVAC, Furnace, AC, Heat Pump, etc.
  installDate: date("install_date"),
  warrantyExpires: date("warranty_expires"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  customerId: integer("customer_id").notNull(),
  technicianId: varchar("technician_id"), // assigned technician
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // Install, Repair, Maintenance, Quote
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, urgent
  status: varchar("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  scheduledDate: timestamp("scheduled_date"),
  scheduledTime: varchar("scheduled_time"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  laborTime: integer("labor_time"), // actual labor time in minutes
  notes: text("notes"),
  equipmentIds: text("equipment_ids"), // JSON array of equipment IDs
  partsUsed: text("parts_used"), // JSON array of parts
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  customerId: integer("customer_id").notNull(),
  jobId: integer("job_id"), // reference to originating job
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  materialCost: decimal("material_cost", { precision: 10, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceHistory = pgTable("service_history", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  jobId: integer("job_id").notNull(),
  equipmentId: integer("equipment_id"),
  serviceDate: date("service_date").notNull(),
  serviceType: varchar("service_type").notNull(),
  description: text("description"),
  technicianId: varchar("technician_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  assignedJobs: many(jobs),
}));

export const companyRelations = relations(companies, ({ many }) => ({
  users: many(users),
  customers: many(customers),
  jobs: many(jobs),
  invoices: many(invoices),
}));

export const customerRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  equipment: many(equipment),
  jobs: many(jobs),
  invoices: many(invoices),
  serviceHistory: many(serviceHistory),
}));

export const equipmentRelations = relations(equipment, ({ one }) => ({
  customer: one(customers, {
    fields: [equipment.customerId],
    references: [customers.id],
  }),
}));

export const jobRelations = relations(jobs, ({ one }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  technician: one(users, {
    fields: [jobs.technicianId],
    references: [users.id],
  }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [invoices.id],
  }),
  job: one(jobs, {
    fields: [invoices.jobId],
    references: [jobs.id],
  }),
}));

export const serviceHistoryRelations = relations(serviceHistory, ({ one }) => ({
  customer: one(customers, {
    fields: [serviceHistory.customerId],
    references: [customers.id],
  }),
  job: one(jobs, {
    fields: [serviceHistory.jobId],
    references: [jobs.id],
  }),
  equipment: one(equipment, {
    fields: [serviceHistory.equipmentId],
    references: [equipment.id],
  }),
  technician: one(users, {
    fields: [serviceHistory.technicianId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceHistorySchema = createInsertSchema(serviceHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type ServiceHistory = typeof serviceHistory.$inferSelect;
export type InsertServiceHistory = z.infer<typeof insertServiceHistorySchema>;
