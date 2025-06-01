import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Users, Wrench, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingData {
  teamSize: string;
  serviceTypes: string;
  primaryChallenge: string;
  currentSchedulingMethod: string;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<OnboardingData>({
    teamSize: "",
    serviceTypes: "",
    primaryChallenge: "",
    currentSchedulingMethod: "",
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to your HVAC management platform!",
        description: "Your account has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description: error.message || "Could not complete setup",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamSize || !formData.serviceTypes || !formData.primaryChallenge || !formData.currentSchedulingMethod) {
      toast({
        title: "Please complete all questions",
        description: "We need this information to customize your experience",
        variant: "destructive",
      });
      return;
    }
    onboardingMutation.mutate(formData);
  };

  const firstName = user?.firstName || "there";
  const companyName = user?.email?.split('@')[0] || "your company";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome {firstName}!</CardTitle>
          <CardDescription className="text-lg">
            Let's customize {companyName} for the best HVAC management experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Team Size */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-base font-medium">How many technicians work at your company?</Label>
              </div>
              <RadioGroup
                value={formData.teamSize}
                onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solo" id="solo" />
                  <Label htmlFor="solo">Just me (Solo)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small">2-5 technicians</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">6-15 technicians</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large">16+ technicians</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Service Types */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-primary" />
                <Label className="text-base font-medium">What services do you primarily offer?</Label>
              </div>
              <Select
                value={formData.serviceTypes}
                onValueChange={(value) => setFormData({ ...formData, serviceTypes: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential_hvac">Residential HVAC Only</SelectItem>
                  <SelectItem value="commercial_hvac">Commercial HVAC Only</SelectItem>
                  <SelectItem value="both_hvac">Both Residential & Commercial HVAC</SelectItem>
                  <SelectItem value="hvac_plumbing">HVAC + Plumbing</SelectItem>
                  <SelectItem value="full_service">Full Service (HVAC, Plumbing, Electrical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary Challenge */}
            <div className="space-y-4">
              <Label className="text-base font-medium">What's your biggest operational challenge right now?</Label>
              <Select
                value={formData.primaryChallenge}
                onValueChange={(value) => setFormData({ ...formData, primaryChallenge: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your main challenge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduling">Scheduling and dispatching jobs</SelectItem>
                  <SelectItem value="customer_communication">Customer communication</SelectItem>
                  <SelectItem value="invoicing">Invoicing and payments</SelectItem>
                  <SelectItem value="parts_tracking">Parts and inventory tracking</SelectItem>
                  <SelectItem value="technician_management">Managing technician routes</SelectItem>
                  <SelectItem value="paperwork">Too much paperwork</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Method */}
            <div className="space-y-4">
              <Label className="text-base font-medium">How do you currently schedule jobs?</Label>
              <Select
                value={formData.currentSchedulingMethod}
                onValueChange={(value) => setFormData({ ...formData, currentSchedulingMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your current method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone_calls">Phone calls and memory</SelectItem>
                  <SelectItem value="spreadsheets">Spreadsheets (Excel/Google Sheets)</SelectItem>
                  <SelectItem value="paper_calendar">Paper calendar/whiteboard</SelectItem>
                  <SelectItem value="other_software">Another software (ServiceTitan, etc.)</SelectItem>
                  <SelectItem value="basic_app">Basic scheduling app</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={onboardingMutation.isPending}
            >
              {onboardingMutation.isPending ? (
                "Setting up your workspace..."
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}