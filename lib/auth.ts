import bcrypt from 'bcryptjs'

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
  onboardingCompleted: boolean
  profile?: any
  recommendations?: any
  dailyLogs?: any[]
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: Omit<User, 'password'>
}

class AuthService {
  private users: User[] = []

  constructor() {
    // Load users from localStorage on initialization
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('fitness_users')
      if (storedUsers) {
        this.users = JSON.parse(storedUsers)
      }
    }
  }

  private saveUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitness_users', JSON.stringify(this.users))
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    // Validate input
    if (!name || !email || !password) {
      return { success: false, message: 'All fields are required' }
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long' }
    }

    // Check if user already exists
    const existingUser = this.users.find(user => user.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false
    }

    this.users.push(newUser)
    this.saveUsers()

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return { 
      success: true, 
      message: 'Account created successfully', 
      user: userWithoutPassword 
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Validate input
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' }
    }

    // Find user
    const user = this.users.find(user => user.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { success: false, message: 'Invalid email or password' }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, message: 'Invalid email or password' }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return { 
      success: true, 
      message: 'Login successful', 
      user: userWithoutPassword 
    }
  }

  updateUser(userId: string, updates: Partial<User>): AuthResponse {
    const userIndex = this.users.findIndex(user => user.id === userId)
    if (userIndex === -1) {
      return { success: false, message: 'User not found' }
    }

    // Don't allow password updates through this method
    const { password, ...safeUpdates } = updates as any
    
    this.users[userIndex] = { ...this.users[userIndex], ...safeUpdates }
    this.saveUsers()

    const { password: _, ...userWithoutPassword } = this.users[userIndex]
    return { 
      success: true, 
      message: 'User updated successfully', 
      user: userWithoutPassword 
    }
  }

  getUserById(userId: string): Omit<User, 'password'> | null {
    const user = this.users.find(user => user.id === userId)
    if (!user) return null

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export const authService = new AuthService()
