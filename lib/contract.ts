import { ethers } from "ethers"
import Web3NotionABI from "@/contracts/Web3Notion.json"

export type Note = {
  id: string
  title: string
  content: string
  attachments: string[]
  createdAt: number
  updatedAt: number
}

export type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  status: "todo" | "in-progress" | "done"
  createdAt: number
  updatedAt: number
}

export class Web3NotionContract {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private initialized = false

  constructor(private contractAddress: string) {}

  async init() {
    if (this.initialized) return

    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(this.contractAddress, Web3NotionABI, this.signer)
      this.initialized = true
    } catch (error) {
      console.error("Error initializing contract:", error)
      throw new Error("Failed to initialize contract")
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.init()
    }
  }

  async register() {
    await this.ensureInitialized()

    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const tx = await this.contract.register()
      return tx
    } catch (error: any) {
      console.error("Error in register function:", error)

      // Check if the error is because user is already registered
      if (error.message && error.message.includes("User already registered")) {
        console.log("User is already registered")
        return null
      }

      throw error
    }
  }

  // Notes
  async createNote(id: string, title: string, content: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.createNote(id, title, content)
    await tx.wait()
  }

  async updateNote(id: string, title: string, content: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.updateNote(id, title, content)
    await tx.wait()
  }

  async addAttachmentToNote(noteId: string, attachmentCid: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.addAttachmentToNote(noteId, attachmentCid)
    await tx.wait()
  }

  async deleteNote(id: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.deleteNote(id)
    await tx.wait()
  }

  async getNoteIds() {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const ids = await this.contract.getNoteIds()
    return ids
  }

  async getNote(id: string): Promise<Note> {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const [noteId, title, content, attachments, createdAt, updatedAt] = await this.contract.getNote(id)

    return {
      id: noteId,
      title,
      content,
      attachments,
      createdAt: Number(createdAt),
      updatedAt: Number(updatedAt),
    }
  }

  // Tasks
  async createTask(id: string, title: string, description: string, status: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.createTask(id, title, description, status)
    await tx.wait()
  }

  async updateTask(id: string, title: string, description: string, completed: boolean, status: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.updateTask(id, title, description, completed, status)
    await tx.wait()
  }

  async deleteTask(id: string) {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const tx = await this.contract.deleteTask(id)
    await tx.wait()
  }

  async getTaskIds() {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const ids = await this.contract.getTaskIds()
    return ids
  }

  async getTask(id: string): Promise<Task> {
    await this.ensureInitialized()
    if (!this.contract) throw new Error("Contract not initialized")

    const [taskId, title, description, completed, status, createdAt, updatedAt] = await this.contract.getTask(id)

    return {
      id: taskId,
      title,
      description,
      completed,
      status: status as "todo" | "in-progress" | "done",
      createdAt: Number(createdAt),
      updatedAt: Number(updatedAt),
    }
  }
}

// Create a singleton instance
let contractInstance: Web3NotionContract | null = null

export function getContractInstance(contractAddress: string) {
  if (!contractInstance) {
    contractInstance = new Web3NotionContract(contractAddress)
  }
  return contractInstance
}
