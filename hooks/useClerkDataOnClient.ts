import { useState, useEffect } from "react"

export function useClerkDataOnClient({ clerkId }: { clerkId: string }) {
  const [userData, setUserData] = useState<{
      id: string,
      firstName: string,
      lastName: string,
      email: string,
      imageUrl: string,
    }|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/user/${clerkId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const user = await response.json()
        setUserData(user)
      } catch (err) {
        setError(err as Error)
        console.error("Error fetching clerk user:", err)
      } finally {
        setLoading(false)
      }
    }

    if (clerkId) {
      getUserData()
    }
  }, [clerkId])

  return { userData, loading, error }
}