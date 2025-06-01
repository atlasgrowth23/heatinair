import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building, Users, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/auth";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [teamSize, setTeamSize] = useState<string>("");

  const onboardingMutation = useMutation({
    mutationFn: async (data: { teamSize: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to complete setup");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Setup complete!",
        description: "Welcome to your HVAC management platform.",
      });
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
    if (!teamSize) {
      toast({
        title: "Please select your team size",
        description: "We need this to set up your workspace",
        variant: "destructive",
      });
      return;
    }
    onboardingMutation.mutate({ teamSize });
  };

  const firstName = (user as any)?.firstName || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome {firstName}!</CardTitle>
          <CardDescription className="text-base">
            Let's set up your HVAC business workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-base font-medium">How many technicians work at your company?</Label>
              </div>
              <RadioGroup
                value={teamSize}
                onValueChange={setTeamSize}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="solo" id="solo" />
                  <Label htmlFor="solo" className="font-normal">Just me (Solo)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="font-normal">2-5 technicians</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="font-normal">5+ technicians</Label>
                </div>
              </RadioGroup>
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