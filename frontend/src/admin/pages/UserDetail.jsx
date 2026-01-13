import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaWallet, FaArrowLeft } from "react-icons/fa";
import "./UserDetail.css";

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // orders | transactions
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Wallet Adjust Form
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustType, setAdjustType] = useState('deposit'); // deposit | withdraw
  const [adjustNote, setAdjustNote] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${id}/details`);
      setData(res);
    } catch (error) {
      console.error("Failed to load user details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustWallet = async (e) => {
      e.preventDefault();
      try {
          const amount = adjustType === 'deposit' ? parseFloat(adjustAmount) : -parseFloat(adjustAmount);
          await apiClient.put(`/users/${id}/wallet`, {
              amount: amount,
              description: adjustNote
          });
          alert("Cập nhật ví thành công!");
          setShowWalletModal(false);
          fetchUserDetails(); // Refresh
          setAdjustAmount(0);
          setAdjustNote("");
      } catch (error) {
          alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
  };

  if (loading) return <div className="admin-loading">Loading user details...</div>;
  if (!data) return <div className="admin-error">User not found.</div>;

  const { user, orders, transactions } = data;

  return (
    <div className="user-detail-container">
        <Link to="/admin/users" style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px', color: '#64748b', textDecoration: 'none'}}>
            <FaArrowLeft /> Back to Users
        </Link>
        
        {/* HEADER & PROFILE */}
        <div className="user-header-card">
            <div className="user-profile-info">
                <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                    alt={user.name} 
                    className="user-avatar-lg"
                />
                <div className="user-main-details">
                    <h2>{user.name} <span className={`status-badge ${user.isBlocked ? 'status-cancelled' : 'status-completed'}`} style={{fontSize: '0.5em', verticalAlign: 'middle'}}>{user.isBlocked ? 'Blocked' : 'Active'}</span></h2>
                    <div className="user-meta">
                        <span><FaEnvelope /> {user.email}</span>
                        <span><FaPhone /> {user.phone || 'N/A'}</span>
                        <span>
                            <FaMapMarkerAlt /> 
                            {user.address ? `${user.address.street || ''}, ${user.address.ward || ''}, ${user.address.district || ''}, ${user.address.province || ''}` : 'No address'}
                        </span>
                    </div>
                </div>
            </div>

            {/* WALLET CARD */}
            <div className="wallet-card">
                <div className="wallet-title"><FaWallet style={{marginRight:'5px'}}/> Ví xu</div>
                <div className="wallet-balance">{formatCurrency(user.walletBalance)}</div>
                <div className="admin-wallet-actions">
                    <button className="btn-wallet-action" onClick={() => setShowWalletModal(true)}>Điều chỉnh</button>
                </div>
            </div>
        </div>

        {/* TABS */}
        <div className="detail-tabs">
            <button 
                className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
            >
                Đơn hàng ({orders.length})
            </button>
            <button 
                className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
            >
                Lịch sử Ví ({transactions.length})
            </button>
        </div>

        {/* TAB CONTENT */}
        <div className="tab-content">
            {activeTab === 'orders' && (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thanh toán</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? <tr><td colSpan="5">Chưa có đơn hàng.</td></tr> : 
                        orders.map(order => (
                            <tr key={order._id}>
                                <td><Link to={`/admin/orders/${order._id}`}>#{order._id.substring(0,8)}</Link></td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td style={{fontWeight:'bold'}}>{formatCurrency(order.totalPrice)}</td>
                                <td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                <td>{order.paymentMethod}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {activeTab === 'transactions' && (
                 <table className="admin-table">
                 <thead>
                     <tr>
                         <th>Thời gian</th>
                         <th>Loại</th>
                         <th>Số tiền</th>
                         <th>Mô tả</th>
                         <th>Trạng thái</th>
                     </tr>
                 </thead>
                 <tbody>
                     {transactions.length === 0 ? <tr><td colSpan="5">Chưa có giao dịch.</td></tr> : 
                     transactions.map(txn => (
                         <tr key={txn._id}>
                             <td>{formatDate(txn.createdAt)}</td>
                             <td style={{textTransform: 'capitalize'}}>{txn.type}</td>
                             <td style={{
                                 fontWeight:'bold', 
                                 color: ['deposit', 'sale_income', 'refund'].includes(txn.type) ? '#16a34a' : '#dc2626'
                             }}>
                                {['deposit', 'sale_income', 'refund'].includes(txn.type) ? '+' : '-'}{formatCurrency(Math.abs(txn.amount))}
                             </td>
                             <td style={{maxWidth: '300px'}}>{txn.description}</td>
                             <td>{txn.status}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
            )}
        </div>

        {/* WALLET MODAL */}
        {showWalletModal && (
            <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3 className="modal-title">Điều chỉnh số dư ví</h3>
                    <form onSubmit={handleAdjustWallet}>
                        <div className="modal-input-group">
                            <label>Loại giao dịch</label>
                            <select value={adjustType} onChange={e => setAdjustType(e.target.value)}>
                                <option value="deposit">Cộng tiền (+)</option>
                                <option value="withdraw">Trừ tiền (-)</option>
                            </select>
                        </div>
                        <div className="modal-input-group">
                            <label>Số tiền</label>
                            <input 
                                type="number" 
                                min="1000" 
                                value={adjustAmount} 
                                onChange={e => setAdjustAmount(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="modal-input-group">
                            <label>Ghi chú (Lý do)</label>
                            <input 
                                type="text" 
                                value={adjustNote} 
                                onChange={e => setAdjustNote(e.target.value)} 
                                required 
                                placeholder="VD: Hoàn tiền thủ công, Thưởng..."
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowWalletModal(false)}>Hủy</button>
                            <button type="submit" className="btn-success">Xác nhận</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
