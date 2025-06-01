import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { CreateCustomerModal } from "@/components/CreateCustomerModal";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search, Phone, Mail, MapPin } from "lucide-react";

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
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    retry: false,
  });

  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  ) || [];

  const getContactMethodColor = (method: string) => {
    switch (method) {
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'phone': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'text': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'phone': return <Phone className="h-3 w-3" />;
      case 'text': return <Phone className="h-3 w-3" />;
      default: return <Phone className="h-3 w-3" />;
    }
  };

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
                <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
                <p className="text-muted-foreground">Centralize client info & communication</p>
              </div>
              
              <Button onClick={() => setIsCustomerModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customers List */}
            <Card>
              <CardHeader>
                <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading customers...</p>
                  </div>
                ) : filteredCustomers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCustomers.map(customer => (
                      <Card key={customer.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-foreground">{customer.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Customer since {new Date(customer.createdAt).getFullYear()}
                                </p>
                              </div>
                              {customer.preferredContactMethod && (
                                <Badge className={getContactMethodColor(customer.preferredContactMethod)}>
                                  <div className="flex items-center gap-1">
                                    {getContactIcon(customer.preferredContactMethod)}
                                    <span className="capitalize">{customer.preferredContactMethod}</span>
                                  </div>
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-2">
                              {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span>{customer.email}</span>
                                </div>
                              )}
                              
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              
                              {customer.address && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{customer.address}</span>
                                </div>
                              )}
                            </div>

                            {customer.notes && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {customer.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                Create Job
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "No customers match your search" 
                        : "No customers found"
                      }
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCustomerModalOpen(true)}
                    >
                      Add First Customer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <CreateCustomerModal 
        open={isCustomerModalOpen} 
        onOpenChange={setIsCustomerModalOpen}
      />
    </SidebarProvider>
  );
}
