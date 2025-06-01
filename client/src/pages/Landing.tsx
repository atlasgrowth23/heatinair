import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, Users, FileText, DollarSign, CheckCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">FieldPro</h1>
          </div>
          <Button onClick={handleLogin}>Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Streamline Your HVAC Business
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete field service management for HVAC contractors. Schedule jobs, manage customers, 
            track work orders, and handle invoicing - all in one platform.
          </p>
          <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-3">
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need to Run Your Business
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Optimized route planning and job scheduling. Drag-and-drop calendar with automatic 
                  travel time calculations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete customer database with equipment records, service history, and 
                  automated maintenance reminders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Digital Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create, track, and complete work orders digitally. Add photos, notes, 
                  and customer signatures on-site.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Automated Invoicing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate invoices instantly from completed work orders. Online payment 
                  portal and automated reminders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Mobile Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mobile-optimized interface for technicians in the field. Clock in/out, 
                  update job status, and capture photos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Wrench className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Equipment Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track customer equipment with make, model, serial numbers, and service 
                  history for better maintenance planning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Transform Your HVAC Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of contractors who trust FieldPro to manage their operations.
          </p>
          <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-3">
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">FieldPro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 FieldPro. All rights reserved. Professional HVAC field service management.
          </p>
        </div>
      </footer>
    </div>
  );
}
