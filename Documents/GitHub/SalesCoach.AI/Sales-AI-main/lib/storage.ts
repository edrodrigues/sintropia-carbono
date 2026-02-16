// Local storage utilities for mock data persistence
export class LocalStorageService {
  private static getKey(type: string): string {
    return `sales-training-${type}`
  }

  static get<T>(type: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue

    try {
      const item = localStorage.getItem(this.getKey(type))
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading ${type} from localStorage:`, error)
      return defaultValue
    }
  }

  static set<T>(type: string, value: T): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.getKey(type), JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${type} to localStorage:`, error)
    }
  }

  static remove(type: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.getKey(type))
  }

  static clear(): void {
    if (typeof window === "undefined") return

    const keys = Object.keys(localStorage).filter((key) => key.startsWith("sales-training-"))
    keys.forEach((key) => localStorage.removeItem(key))
  }
}

// Authentication service
export class AuthService {
  private static readonly CURRENT_USER_KEY = "current-user"

  static getCurrentUser() {
    return LocalStorageService.get(this.CURRENT_USER_KEY, null)
  }

  static setCurrentUser(user: any) {
    LocalStorageService.set(this.CURRENT_USER_KEY, user)
  }

  static logout() {
    LocalStorageService.remove(this.CURRENT_USER_KEY)
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}
