import React, { useEffect, useState } from "react";
import apiClient from "../../shared/utils/apiClient";
import { FaLock, FaUnlock, FaUserShield, FaUser, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./UsersManager.css";

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy ID của chính mình để tránh tự block bản thân
  const currentUser = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? "MỞ KHÓA" : "KHÓA";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name}"?`))
      return;

    try {
      const res = await apiClient.put(`/users/${user._id}/block`);

      // Cập nhật state sau khi API trả về thành công
      const updatedUsers = users.map((u) =>
        u._id === user._id ? { ...u, isBlocked: res.isBlocked } : u
      );
      setUsers(updatedUsers);
    } catch (error) {
      alert("Thao tác thất bại: " + error.message);
    }
  };

  return (
    <div className="users-manager-container">
      <div className="page-header">
        <h2 className="page-title">Quản lý Người dùng</h2>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">Đang tải danh sách...</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} style={{ opacity: user.isBlocked ? 0.6 : 1 }}>
                <td>
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name
                      )}&background=random`
                    }
                    alt={user.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                </td>
                <td>
                  <strong>{user.name}</strong>
                  {user._id === currentUser._id && (
                    <span
                      style={{
                        marginLeft: "5px",
                        fontSize: "0.8em",
                        color: "green",
                      }}
                    >
                      (Bạn)
                    </span>
                  )}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === "admin" ? (
                      <FaUserShield style={{ marginBottom: "-2px" }} />
                    ) : (
                      <FaUser style={{ marginBottom: "-2px" }} />
                    )}{" "}
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.isBlocked ? (
                    <span style={{ color: "#e53e3e", fontWeight: "bold" }}>
                      Đã khóa
                    </span>
                  ) : (
                    <span style={{ color: "#38a169", fontWeight: "bold" }}>
                      Hoạt động
                    </span>
                  )}
                </td>
                <td>
                  {/* Không cho phép Admin tự block chính mình hoặc block admin khác  */}
                  <div style={{display: 'flex', gap: '5px'}}>
                      <Link to={`/admin/users/${user._id}`} className="btn-icon primary" title="Xem chi tiết">
                          <FaEye />
                      </Link>

                      {user._id !== currentUser._id && user.role !== 'admin' ? (
                        <button
                          className={`btn-icon btn-toggle-block ${
                            user.isBlocked ? "unblock" : "block"
                          }`}
                          onClick={() => handleToggleBlock(user)}
                          title={user.isBlocked ? "Mở khóa" : "Khóa tài khoản"}
                        >
                           {user.isBlocked ? <FaUnlock /> : <FaLock />}
                        </button>
                      ) : user.role === 'admin' && user._id !== currentUser._id ? (
                        <span style={{ color: '#888', fontStyle: 'italic', fontSize: '10px' }}>Admin</span>
                      ) : null}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
