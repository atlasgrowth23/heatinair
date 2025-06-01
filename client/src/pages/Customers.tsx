import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CreateCustomerModal } from "@/components/CreateCustomerModal";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  preferredContactMethod: string;
  createdAt: string;
}

export default function Customers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer deleted",
        description: "Customer has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Could not delete customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContactMethodBadge = (method: string) => {
    const variants = {
      email: { icon: Mail, label: "Email", variant: "default" as const },
      phone: { icon: Phone, label: "Phone", variant: "secondary" as const },
      text: { icon: Phone, label: "Text", variant: "outline" as const },
    };
    
    const config = variants[method as keyof typeof variants] || 
      { icon: User, label: "Any", variant: "outline" as const };
    
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Customers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Customers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
              <p className="text-muted-foreground">
                Manage customer information, contact details, and service history
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-80"
                />
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.filter(c => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return new Date(c.createdAt) > monthAgo;
                  }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Preferred</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.filter(c => c.preferredContactMethod === 'email').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Table */}
          {filteredCustomers.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <User className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchTerm ? "No customers found" : "No customers yet"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchTerm 
                  ? "Try adjusting your search terms or clear the filter to see all customers."
                  : "Start building your customer database by adding your first customer."
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Customer
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Preferred Method</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {customer.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-48">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getContactMethodBadge(customer.preferredContactMethod)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {customer.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(customer.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this customer?")) {
                                  deleteCustomerMutation.mutate(customer.id);
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

        <CreateCustomerModal 
          open={isCreateModalOpen} 
          onOpenChange={setIsCreateModalOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}