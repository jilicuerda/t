// app/admin/users/page.js
import { supabaseAdmin } from '../../../utils/supabaseAdmin'
import { createUser, deleteUser } from '../../actions/userManagement'

export default async function UserManagement() {
  // Fetch all users directly from Supabase Auth using the admin client
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  
  // Fetch their roles from our custom table
  const { data: roles } = await supabaseAdmin.from('user_roles').select('*')

  // Combine the data so we can display it easily
  const displayUsers = users?.map(user => {
    const userRole = roles?.find(r => r.user_id === user.id)
    return { ...user, role: userRole?.role || 'None' }
  }) || []

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {/* CREATE USER FORM */}
      <div className="bg-gray-100 p-6 rounded-lg mb-10 text-black">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <form action={createUser} className="flex gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" required className="p-2 border rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" required className="p-2 border rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Role</label>
            <select name="role" className="p-2 border rounded">
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white p-2 rounded px-4 hover:bg-green-700">
            Create
          </button>
        </form>
      </div>

      {/* LIST EXISTING USERS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Accounts</h2>
        <div className="bg-white border rounded-lg text-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map(user => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{user.id}</td>
                  <td className="p-4 text-right">
                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-red-600 hover:text-red-800 font-medium">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
