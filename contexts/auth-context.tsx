"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type AuthState, initialAuthState, connectWallet, disconnectWallet, checkWalletConnection } from "@/lib/auth"
import { getContractInstance } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType extends AuthState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isRegistered: boolean
  isRegistering: boolean
  registerUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  connect: async () => {},
  disconnect: async () => {},
  isRegistered: false,
  isRegistering: false,
  registerUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// Contract address
const CONTRACT_ADDRESS = "0x5219015234d02F59B21A501fb52062f8bDF74E1A"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)

  // Check if user is registered with the contract
  const checkRegistration = async (address: string) => {
    if (!address) return false

    try {
      setIsCheckingRegistration(true)
      const contract = getContractInstance(CONTRACT_ADDRESS)

      // Make sure contract is initialized
      await contract.init()

      // Try to get user data - this will throw an error if user is not registered
      try {
        await contract.getNoteIds()
        setIsRegistered(true)
        return true
      } catch (error) {
        console.log("User not registered yet")
        setIsRegistered(false)
        return false
      }
    } catch (error) {
      console.error("Error checking registration:", error)
      setIsRegistered(false)
      return false
    } finally {
      setIsCheckingRegistration(false)
    }
  }

  // Register user with the contract
  const registerUser = async () => {
    if (!authState.address || isRegistered) return

    try {
      setIsRegistering(true)
      const contract = getContractInstance(CONTRACT_ADDRESS)

      // Make sure contract is initialized
      await contract.init()

      // Call the register function with proper error handling
      try {
        // Call the register function
        const tx = await contract.register()

        // Check if tx is defined before calling wait
        if (tx) {
          await tx.wait()
          setIsRegistered(true)
          toast({
            title: "Registration successful",
            description: "You have been registered with Spark",
          })
        } else {
          throw new Error("Transaction failed")
        }
      } catch (error: any) {
        console.error("Registration transaction error:", error)
        toast({
          title: "Registration failed",
          description: error.message || "Failed to register. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error registering user:", error)
      toast({
        title: "Registration error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  useEffect(() => {
    const checkConnection = async () => {
      setAuthState((prev) => ({ ...prev, isLoading: true }))
      const state = await checkWalletConnection()
      setAuthState(state)

      if (state.address) {
        await checkRegistration(state.address)
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        checkConnection()
      })

      window.ethereum.on("chainChanged", () => {
        checkConnection()
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  // Check registration when address changes
  useEffect(() => {
    if (authState.address) {
      checkRegistration(authState.address)
    }
  }, [authState.address])

  const connect = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    const state = await connectWallet()
    setAuthState(state)

    if (state.address) {
      await checkRegistration(state.address)
    }
  }

  const disconnect = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    const state = await disconnectWallet()
    setAuthState(state)
    setIsRegistered(false)
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        connect,
        disconnect,
        isRegistered,
        isRegistering,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
