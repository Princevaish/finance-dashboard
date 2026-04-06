"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import Navbar from "@/components/Navbar";
import { getUserRole } from "@/lib/auth";
import api from "@/lib/api";

interface BackendUserResponse {
  id: number;
  email: string;
  role_id: number | null;
  is_active: boolean;
}

interface UserResponse extends BackendUserResponse {
  role: "viewer" | "analyst" | "admin";
}

// Map role_id to role name
const getRoleNameFromId = (roleId: number | null): "viewer" | "analyst" | "admin" => {
  switch (roleId) {
    case 1:
      return "viewer";
    case 2:
      return "analyst";
    case 3:
      return "admin";
    default:
      return "viewer"; // Default fallback
  }
};

// Map role name to role_id
const getRoleIdFromName = (roleName: "viewer" | "analyst" | "admin"): number => {
  switch (roleName) {
    case "viewer":
      return 1;
    case "analyst":
      return 2;
    case "admin":
      return 3;
    default:
      return 1;
  }
};

function UsersContent() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<"viewer" | "analyst" | "admin">("viewer");
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<BackendUserResponse[]>("/users/");
      // Transform backend response: map role_id to role
      const transformedUsers: UserResponse[] = response.data.map((user) => ({
        ...user,
        role: getRoleNameFromId(user.role_id),
      }));
      setUsers(transformedUsers);
    } catch (err: any) {
      console.error("Users fetch error:", err);
      setError("Failed to load users. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number) => {
    setActionLoading(true);
    try {
      const roleId = getRoleIdFromName(editingRole);
      const payload = { role_id: roleId };
      
      console.log("Updating user role:", {
        userId,
        editingRole,
        roleId,
        payload,
      });
      
      await api.put(`/users/${userId}`, payload);
      
      console.log("Role update successful");
      setEditingUserId(null);
      fetchUsers();
    } catch (err: any) {
      console.error("Failed to update role:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data,
        },
      });
      alert(`Failed to update role: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (userId: number) => {
    setActionLoading(true);
    try {
      await api.put(`/users/${userId}/deactivate`, {});
      setDeactivatingId(null);
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to deactivate user: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    setActionLoading(true);
    try {
      await api.delete(`/users/${userId}`);
      setDeletingId(null);
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to delete user: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${users.length} user${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse flex-1" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-24" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-20" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-700 font-semibold mb-1">No users found</p>
            <p className="text-sm text-gray-400">
              Users will appear here once they sign up.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100 hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {editingUserId === user.id ? (
                        <select
                          value={editingRole}
                          onChange={(e) =>
                            setEditingRole(
                              e.target.value as "viewer" | "analyst" | "admin"
                            )
                          }
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "analyst"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {editingUserId === user.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              handleRoleChange(user.id)
                            }
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            disabled={actionLoading}
                            className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setEditingRole(user.role);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          {user.is_active && (
                            <button
                              onClick={() => setDeactivatingId(user.id)}
                              className="text-orange-600 hover:text-orange-800 font-medium"
                            >
                              Deactivate
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingId(user.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deactivate Modal */}
      {deactivatingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Deactivate User?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This user will no longer be able to sign in, but their data will
              be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeactivatingId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeactivate(deactivatingId)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The user and all their data will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function UsersPage() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <UsersContent />
      </div>
    </RoleProtectedRoute>
  );
}
