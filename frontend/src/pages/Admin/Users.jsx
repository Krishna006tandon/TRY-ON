import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiShield } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Chatbot from '../../components/Chatbot/Chatbot';

const Users = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate, page]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/api/admin/users?page=${page}&limit=20`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Users</h1>
        </div>

        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Reward Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-surface">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <FiUser className="text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-sm text-dark-muted">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FiMail size={16} className="text-dark-muted" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`px-3 py-1 rounded text-sm ${
                          u.role === 'admin' 
                            ? 'bg-purple-600/20 text-purple-500 border border-purple-500' 
                            : 'bg-blue-600/20 text-blue-500 border border-blue-500'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{u.rewardPoints || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {u.role === 'admin' && (
                          <FiShield className="text-yellow-500" title="Admin" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 p-4 border-t border-dark-border">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-dark-surface hover:bg-dark-border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-dark-surface hover:bg-dark-border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Users;

