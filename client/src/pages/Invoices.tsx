import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, File, Search, DollarSign, Calendar, AlertTriangle } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: string;
  laborCost: string;
  materialCost: string;
  taxAmount: string;
  status: string;
  dueDate: string;
  paidDate: string;
  customerId: number;
  jobId: number;
  createdAt: string;
}

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || !invoice.dueDate) return false;
    return new Date(invoice.dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || "0"), 0);
  const pendingAmount = filteredInvoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount || "0"), 0);
  const overdueAmount = filteredInvoices
    .filter(invoice => isOverdue(invoice))
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount || "0"), 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <MobileNav />
          
          <div className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Invoicing & Financials</h1>
                <p className="text-muted-foreground">Simplify money management and billing</p>
              </div>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invoiced</p>
                      <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Invoices List */}
            <Card>
              <CardHeader>
                <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading invoices...</p>
                  </div>
                ) : filteredInvoices.length > 0 ? (
                  <div className="space-y-4">
                    {filteredInvoices.map(invoice => {
                      const overdue = isOverdue(invoice);
                      const daysOverdue = overdue ? getDaysOverdue(invoice.dueDate) : 0;
                      
                      return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                              <Badge className={getStatusColor(overdue ? 'overdue' : invoice.status)}>
                                {overdue ? 'OVERDUE' : invoice.status.toUpperCase()}
                              </Badge>
                              {overdue && (
                                <Badge variant="destructive">
                                  {daysOverdue} days overdue
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                ${parseFloat(invoice.amount || "0").toFixed(2)}
                              </span>
                              <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                              {invoice.dueDate && (
                                <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                              )}
                              {invoice.paidDate && (
                                <span>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</span>
                              )}
                            </div>
                            
                            {(invoice.laborCost || invoice.materialCost) && (
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                {invoice.laborCost && (
                                  <span>Labor: ${parseFloat(invoice.laborCost).toFixed(2)}</span>
                                )}
                                {invoice.materialCost && (
                                  <span>Materials: ${parseFloat(invoice.materialCost).toFixed(2)}</span>
                                )}
                                {invoice.taxAmount && (
                                  <span>Tax: ${parseFloat(invoice.taxAmount).toFixed(2)}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            {invoice.status === 'pending' && (
                              <Button variant="outline" size="sm">
                                Mark Paid
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              Send
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "No invoices match your filters" 
                        : "No invoices found"
                      }
                    </p>
                    <Button variant="outline" className="mt-4">
                      Create First Invoice
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
