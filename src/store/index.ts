import { create } from 'zustand'

export interface User {
  id: string
  username: string
  role: 'merchant' | 'admin'
  name: string
}

export interface Activity {
  id: string
  title: string
  description: string
  coverImage: string
  status: 'recruiting' | 'recruiting_ended' | 'ongoing' | 'ended'
  registrationStart: string
  registrationEnd: string
  activityStart: string
  activityEnd: string
  location: string
  capacity: number
  enrolledCount: number
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: string
  activityId: string
  name: string
  gender: 'male' | 'female'
  age: number
  profession: string
  contact: string
  city: string
  bio: string
  requirements: string
  tags: string[]
  status: 'approved' | 'rejected' | 'pending'
  createdAt: string
}

export interface MatchRule {
  id: string
  name: string
  weight: number
  description: string
}

export interface MatchGroup {
  id: string
  members: Enrollment[]
  score: number
  reasons: string[]
}

interface AppState {
  // 用户状态
  user: User | null
  token: string | null
  isAuthenticated: boolean
  
  // 活动状态
  activities: Activity[]
  currentActivity: Activity | null
  
  // 报名状态
  enrollments: Enrollment[]
  
  // 匹配状态
  matchRules: MatchRule[]
  matchGroups: MatchGroup[]
  
  // Actions
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setCurrentActivity: (activity: Activity | null) => void
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  addEnrollments: (enrollments: Omit<Enrollment, 'id' | 'createdAt'>[]) => void
  updateEnrollmentStatus: (id: string, status: 'approved' | 'rejected') => void
  setMatchRules: (rules: MatchRule[]) => void
  setMatchGroups: (groups: MatchGroup[]) => void
}

export const useStore = create<AppState>((set, get) => ({
  // 初始状态
  user: null,
  token: null,
  isAuthenticated: false,
  activities: [],
  currentActivity: null,
  enrollments: [],
  matchRules: [],
  matchGroups: [],
  
  // Actions
  setUser: (user: User) => {
    set({ user, isAuthenticated: true })
  },
  
  setToken: (token: string) => {
    set({ token })
  },
  
  login: async (username: string, password: string) => {
    // Mock登录验证
    if (username === 'merchant' && password === '123456') {
      const user: User = {
        id: '1',
        username: 'merchant',
        role: 'merchant',
        name: '商家用户'
      }
      set({ user, isAuthenticated: true })
      return true
    }
    
    if (username === 'admin' && password === '123456') {
      const user: User = {
        id: '2',
        username: 'admin',
        role: 'admin',
        name: '管理员'
      }
      set({ user, isAuthenticated: true })
      return true
    }
    
    return false
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  setCurrentActivity: (activity) => {
    set({ currentActivity: activity })
  },
  
  addActivity: (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    set(state => ({
      activities: [...state.activities, newActivity]
    }))
  },
  
  updateActivity: (id, updates) => {
    set(state => ({
      activities: state.activities.map(activity =>
        activity.id === id
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      )
    }))
  },
  
  deleteActivity: (id) => {
    set(state => ({
      activities: state.activities.filter(activity => activity.id !== id)
    }))
  },
  
  addEnrollments: (enrollmentsData) => {
    const newEnrollments: Enrollment[] = enrollmentsData.map(data => ({
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }))
    set(state => ({
      enrollments: [...state.enrollments, ...newEnrollments]
    }))
  },
  
  updateEnrollmentStatus: (id, status) => {
    set(state => ({
      enrollments: state.enrollments.map(enrollment =>
        enrollment.id === id ? { ...enrollment, status } : enrollment
      )
    }))
  },
  
  setMatchRules: (rules) => {
    set({ matchRules: rules })
  },
  
  setMatchGroups: (groups) => {
    set({ matchGroups: groups })
  }
}))

// 兼容旧的导出名称
export const useAppStore = useStore