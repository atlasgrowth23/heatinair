import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/auth";
import { getAuthHeaders } from "@/lib/auth";

async function fetchUser() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }

  const response = await fetch("/api/auth/user", {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
