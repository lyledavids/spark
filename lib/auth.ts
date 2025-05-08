import { ethers } from "ethers"

export type AuthState = {
  isAuthenticated: boolean
  address: string | null
  chainId: string | null
  isLoading: boolean
  error: string | null
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  address: null,
  chainId: null,
  isLoading: false,
  error: null,
}

export async function connectWallet(): Promise<AuthState> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)

    // Request account access
    const accounts = await provider.send("eth_requestAccounts", [])
    const address = accounts[0]

    // Get the connected network
    const network = await provider.getNetwork()
    const chainId = network.chainId.toString()

    return {
      isAuthenticated: true,
      address,
      chainId,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    return {
      ...initialAuthState,
      error: error instanceof Error ? error.message : "Failed to connect wallet",
    }
  }
}

export async function disconnectWallet(): Promise<AuthState> {
  return initialAuthState
}

export async function checkWalletConnection(): Promise<AuthState> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      return initialAuthState
    }

    const provider = new ethers.BrowserProvider(window.ethereum)

    // Check if already connected
    const accounts = await provider.send("eth_accounts", [])

    if (accounts.length === 0) {
      return initialAuthState
    }

    const address = accounts[0]
    const network = await provider.getNetwork()
    const chainId = network.chainId.toString()

    return {
      isAuthenticated: true,
      address,
      chainId,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    console.error("Error checking wallet connection:", error)
    return initialAuthState
  }
}
