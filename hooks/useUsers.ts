// @/hooks/useUsers.ts
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: explanation */
import { useState, useEffect } from 'react';
import getAllUsers from '@/data/users/superadmin/getAllUsers';
import type { SimpleUser } from '@/components/tables/Columns';

interface UseUsersReturn {
  users: SimpleUser[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isEmpty: boolean;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching users...");
      
      const usersData = await getAllUsers();
      setUsers(usersData);
      
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refetch = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refetch,
    isEmpty: !loading && users.length === 0
  };
}