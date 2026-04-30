// app/actions/userManagement.js
'use server'

import { supabaseAdmin } from '../../utils/supabaseAdmin'
import { revalidatePath } from 'next/cache'

// Action to Create a User and Assign a Role
export async function createUser(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role') || 'viewer'

  // 1. Create the user in Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true // Skips the email verification requirement
  })

  if (error) {
    console.error("Error creating user:", error.message)
    return { error: error.message }
  }

  // 2. Add their permission role to our custom user_roles table
  if (data.user) {
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert([{ user_id: data.user.id, role: role }])
      
    if (roleError) {
      console.error("Error setting role:", roleError.message)
      return { error: roleError.message }
    }
  }
  
  revalidatePath('/admin/users') // Refreshes the page data
  return { success: true }
}

// Action to Delete a User
export async function deleteUser(formData) {
  const userId = formData.get('userId')

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error("Error deleting user:", error.message)
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
