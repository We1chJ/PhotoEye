'use server'

import { supabase } from '@/lib/supabase'
export async function login(email: string, password: string) {
  const data = { email, password }
  const { error } = await supabase.auth.signInWithPassword(data)
  if (error) {
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Login successful' }
}

export async function signup(email: string, password: string) {
  const data = { email, password }
  const { error } = await supabase.auth.signUp(data)
  if (error) {
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Signup successful' }
}
