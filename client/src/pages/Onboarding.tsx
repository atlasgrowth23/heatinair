import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingData {
  companyName: string;
  fullName: string;
  isSolo: boolean;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: "",
    fullName: "",
    isSolo: true,
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
      // Invalidate auth cache to trigger re-fetch with updated user data
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
    if (!formData.companyName.trim() || !formData.fullName.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    onboardingMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to HVAC Pro</CardTitle>
          <CardDescription>
            Let's set up your business profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="e.g., Smith HVAC Services"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Your Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="e.g., John Smith"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="isSolo"
                checked={formData.isSolo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isSolo: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="isSolo" className="text-sm font-medium cursor-pointer">
                  I'm a solo technician
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Check this if you work alone. You can add team members later.
                </p>
              </div>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={onboardingMutation.isPending}
            >
              {onboardingMutation.isPending ? (
                "Setting up your account..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finish Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}