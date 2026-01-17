import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/orders/${id}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch order details.");
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleConfirmReceipt = async () => {
    if (window.confirm("Bạn có chắc chắn đã nhận được hàng và hài lòng với sản phẩm? Tiền sẽ được chuyển cho người bán.")) {
      try {
        setLoading(true);
        await apiClient.put(`/orders/${id}/confirm-receipt`);
        const updatedOrder = await apiClient.get(`/orders/${id}`);
        setOrder(updatedOrder);
        toast.success("Đã xác nhận nhận hàng thành công!");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
  };


  const handleResolveDispute = async (decision) => {
      const confirmMsg = decision === 'release' 
          ? "Bạn có chắc muốn GIẢI NGÂN cho người bán? Hành động này không thể hoàn tác." 
          : "Bạn có chắc muốn HOÀN TIỀN cho người mua? Hành động này không thể hoàn tác.";
      
      if (!window.confirm(confirmMsg)) return;

      try {
          setLoading(true);
          await apiClient.put(`/orders/${id}/resolve-dispute`, { decision });
          const updatedOrder = await apiClient.get(`/orders/${id}`);
          setOrder(updatedOrder);
          toast.success(`Đã ${decision === 'release' ? 'giải ngân' : 'hoàn tiền'} thành công!`);
      } catch (err) {
          toast.error('Lỗi xử lý: ' + err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleUpdateStatus = async (newStatus) => {
      if (!window.confirm(`Cập nhật trạng thái đơn hàng thành "${newStatus}"?`)) return;
      try {
          setLoading(true);
          await apiClient.put(`/orders/${id}/status`, { status: newStatus });
          const updatedOrder = await apiClient.get(`/orders/${id}`);
          setOrder(updatedOrder);
          toast.success("Cập nhật trạng thái thành công!");
      } catch (err) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleRequestRefund = async () => {
      const reason = prompt("Nhập lý do yêu cầu trả hàng/hoàn tiền:");
      if (!reason) return;
      try {
          setLoading(true);
          await apiClient.put(`/orders/${id}/refund-request`, { reason });
          const updatedOrder = await apiClient.get(`/orders/${id}`);
          setOrder(updatedOrder);
          toast.success("Đã gửi yêu cầu hoàn tiền. Vui lòng chờ người bán xác nhận.");
      } catch (err) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleNotReceived = async () => {
    if (!window.confirm("Bạn xác nhận chưa nhận được hàng? Hành động này sẽ gửi yêu cầu khiếu nại tới người bán/Admin.")) return;
    try {
        setLoading(true);
        // Uses the same Request Refund endpoint but with specific reason
        await apiClient.put(`/orders/${id}/refund-request`, { reason: "Khách báo chưa nhận được hàng (Item Not Received)" });
        const updatedOrder = await apiClient.get(`/orders/${id}`);
        setOrder(updatedOrder);
        toast.success("Đã báo cáo chưa nhận được hàng. Vui lòng chờ phản hồi.");
    } catch (err) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmRefund = async () => {
      if (!window.confirm("Bạn có chắc chắn muốn xác nhận hoàn tiền cho người mua? Tiền sẽ được hoàn lại ví của họ.")) return;
      try {
          setLoading(true);
          await apiClient.put(`/orders/${id}/refund-confirm`);
          const updatedOrder = await apiClient.get(`/orders/${id}`);
          setOrder(updatedOrder);
          toast.success("Đã hoàn tiền thành công!");
      } catch (err) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleRejectRefund = async () => {
      const reason = prompt("Nhập lý do từ chối hoàn tiền (Việc này sẽ chuyển đơn hàng sang Tranh chấp để Admin xử lý):");
      if (!reason) return;

      try {
          setLoading(true);
          await apiClient.put(`/orders/${id}/refund-reject`, { reason });
          const updatedOrder = await apiClient.get(`/orders/${id}`);
          setOrder(updatedOrder);
          toast.success("Đã từ chối hoàn tiền. Đơn hàng chuyển sang trạng thái Tranh chấp!");
      } catch (err) {
          toast.error('Lỗi: ' + err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleCancelOrder = async () => {
      if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
      try {
          setLoading(true);
          await apiClient.put(`/orders/${id}/cancel`);
          const updatedOrder = await apiClient.get(`/orders/${id}`);
          setOrder(updatedOrder);
          toast.success("Đã hủy đơn hàng thành công!");
      } catch (err) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  if (loading) return <div className="container" style={{paddingTop: '2rem'}}>Loading order details...</div>;
  if (error)
    return (
      <div className="container error-message" style={{marginTop: '2rem'}}>
        Error: {error} Please make sure you are logged in and the order exists.
      </div>
    );
  if (!order) return <div className="container" style={{paddingTop: '2rem'}}>Order not found.</div>;

  return (
    <div className="page order-detail-page">
      <div className="container">
        <h2 className="page-title">
          Order Details #{order._id.substring(0, 7)}...
        </h2>
        <p className="order-date">
          Placed on: <strong>{formatDate(order.createdAt)}</strong>
        </p>


        {/* Order Status Timeline (Shopee Style) */}
        <div className="order-tracker">
            <div className={`step ${['Pending', 'Shipped', 'Delivered', 'Completed'].includes(order.status) ? 'active' : ''}`}>
                <div className="step-icon">1</div>
                <div className="step-text">Đơn hàng đã đặt</div>
                 <div className="step-date">{formatDate(order.createdAt)}</div>
            </div>
             <div className="step-line"></div>
            <div className={`step ${['Shipped', 'Delivered', 'Completed'].includes(order.status) ? 'active' : ''}`}>
                 <div className="step-icon">2</div>
                <div className="step-text">Đã gửi hàng</div>
                 <div className="step-date">{['Shipped', 'Delivered', 'Completed'].includes(order.status) ? (order.updatedAt ? formatDate(order.updatedAt) : '...') : ''}</div>
            </div>
             <div className="step-line"></div>
            <div className={`step ${['Delivered', 'Completed'].includes(order.status) ? 'active' : ''}`}>
                 <div className="step-icon">3</div>
                <div className="step-text">Đã giao hàng</div>
                 <div className="step-date">{order.deliveredAt ? formatDate(order.deliveredAt) : ''}</div>
            </div>
        </div>

        {/* Transaction Status Banner (Escrow or COD) */}
        {(order.escrowStatus || (order.paymentMethod === 'COD' && order.status !== 'Cancelled')) && (
             <div className={`escrow-banner status-${order.escrowStatus ? order.escrowStatus.toLowerCase() : 'cod'}`}>
                 <h3>Trạng thái thanh toán: {
                    order.escrowStatus === 'Held' ? 'Đang giữ tiền (Chờ xác nhận)' :
                    order.escrowStatus === 'Released' ? 'Đã thanh toán cho người bán' :
                    order.escrowStatus === 'Refunded' ? 'Đã hoàn tiền' :
                    order.escrowStatus === 'Disputed' ? 'Đang khiếu nại' : 
                    order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.escrowStatus
                 }</h3>
                 <p>
                    {order.escrowStatus === 'Held' ? 
                        (user?._id === (order.user._id || order.user) ? 
                            'Tiền được giữ an toàn. Người bán chỉ nhận được tiền khi bạn xác nhận đã nhận hàng.' : 
                            'Tiền đang được giữ an toàn bởi hệ thống. Bạn sẽ nhận được tiền sau khi người mua xác nhận.') 
                    : 
                     order.paymentMethod === 'COD' ? 
                        (user?._id === (order.user._id || order.user) ?
                            'Vui lòng xác nhận khi đã nhận được hàng và thanh toán đủ cho shipper.' :
                            'Người mua sẽ thanh toán trực tiếp cho đơn vị vận chuyển khi nhận hàng.')
                    : ''}
                 </p>
                 
                 {/* Confirm Button for Held (Wallet) OR Pending/Shipped/Delivered (COD) */}
                 {((order.escrowStatus === 'Held') || (order.paymentMethod === 'COD' && order.status !== 'Completed' && order.status !== 'Cancelled')) && user?.role !== 'admin' && user?._id === (order.user._id || order.user) && (
                     <div className="escrow-actions">
                         <button className="btn-confirm-receipt" onClick={handleConfirmReceipt}>
                            Đã nhận được hàng
                         </button>
                         {order.escrowStatus === 'Held' && ( 
                            <button className="btn-dispute" onClick={handleRequestRefund} style={{backgroundColor: '#F59E0B', color: '#000', borderColor: '#F59E0B'}}>
                                Yêu cầu Trả hàng/Hoàn tiền
                            </button>
                         )}

                     </div>
                 )}

                 {/* Cancel Order Button for Pending Orders (Buyer OR Seller) */}
                 {order.status === 'Pending' && (user?._id === (order.user._id || order.user) || order.orderItems.some(item => item.seller && item.seller._id === user._id)) && (
                     <div className="escrow-actions" style={{marginTop: '10px'}}>
                         <button 
                            className="btn-cancel-order" 
                            onClick={handleCancelOrder}
                            style={{
                                backgroundColor: '#EF4444', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '8px 16px', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                         >
                             Hủy đơn hàng
                         </button>
                     </div>
                 )}

                 {/* Admin Actions for Dispute/Held */}
                 {user?.role === 'admin' && (order.escrowStatus === 'Disputed' || order.escrowStatus === 'Held') && (
                     <div className="admin-resolution-area" style={{marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem'}}>
                         <h4>Admin Resolution</h4>
                         {order.disputeReason && (
                             <div className="dispute-info" style={{backgroundColor: '#FEF3C7', color: '#92400E', width: '100%', boxSizing: 'border-box', marginBottom: '10px'}}>
                                 <strong>Lý do khiếu nại:</strong> {order.disputeReason}
                             </div>
                         )}
                         <div className="escrow-actions">
                             <button className="btn-confirm-receipt" onClick={() => handleResolveDispute('release')}>
                                 Release to Seller
                             </button>
                             <button className="btn-dispute" onClick={() => handleResolveDispute('refund')}>
                                 Refund to Buyer
                             </button>
                         </div>
                     </div>
                 )}
                  {order.escrowStatus === 'Disputed' && (
                     <p className="dispute-info">Đơn hàng đang được Admin xem xét.</p>
                 )}
                 {order.escrowStatus === 'ReturnRequested' && (
                     <p className="dispute-info" style={{backgroundColor: '#E5E7EB', color: '#374151'}}>
                         Người mua đã yêu cầu trả hàng/hoàn tiền. Chờ người bán xác nhận.
                     </p>
                 )}
             </div>
        )}

        {/* Seller Actions Section (Or Admin for B2C) */}
        {(
            order.orderItems.some(item => item.seller && item.seller._id === user._id) || 
            (user?.role === 'admin' && order.orderItems.some(item => !item.seller))
        ) && (
            <div className="seller-actions-card">
                <h3>{user?.role === 'admin' ? 'Tác vụ Admin (B2C Order)' : 'Tác vụ người bán'}</h3>
                <div className="action-buttons">
                    {order.status === 'Pending' && (
                        <button className="btn primary" onClick={() => handleUpdateStatus('Shipped')}>
                            Xác nhận & Gửi hàng (Ship)
                        </button>
                    )}
                    {order.status === 'Shipped' && (
                        <>
                            <button className="btn success" onClick={() => handleUpdateStatus('Delivered')}>
                                Đã giao hàng (Delivered)
                            </button>
                            <button className="btn danger" style={{marginLeft: '10px'}} onClick={() => handleUpdateStatus('Cancelled')}>
                                Giao thất bại / Hoàn về (Failed)
                            </button>
                        </>
                    )}
                    
                    {/* Refund Confirmation */}
                    {order.escrowStatus === 'ReturnRequested' && (
                        <>
                             {order.disputeReason && (
                                <div style={{width: '100%', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '10px', borderLeft: '4px solid #EF4444', fontSize: '0.95rem'}}>
                                    <strong>Lý do từ người mua:</strong> {order.disputeReason}
                                </div>
                            )}
                            <button className="btn danger" onClick={handleConfirmRefund}>
                                Xác nhận Hoàn tiền (Approve Refund)
                            </button>
                            <button className="btn secondary" onClick={handleRejectRefund}>
                                Từ chối (Reject)
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}

        <div className="order-detail-grid">
          <div className="order-detail-left">
            {/* Shipping Info */}
            <div className="detail-card">
              <h3>Shipping Address</h3>
              <p>
                <strong>{order.user.name}</strong>
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>

            {/* Payment Info */}
            <div className="detail-card">
              <h3>Payment</h3>
              <p>
                Payment Method: <strong>{order.paymentMethod}</strong>
              </p>
              {order.isPaid ? (
                <div className="status-badge paid">
                  Paid on {formatDate(order.paidAt)}
                </div>
              ) : (
                <div className="status-badge not-paid">Not Paid</div>
              )}
            </div>
            {/* Order Status */}
            <div className="detail-card">
              <h3>Order Status</h3>
              <p>
                Current Status:{" "}
                <strong
                  className={`status-text status-text-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </strong>
              </p>
              {order.isDelivered ? (
                <div className="status-badge delivered">
                  Delivered on {formatDate(order.deliveredAt)}
                </div>
              ) : (
                <div className="status-badge not-delivered">Not Delivered</div>
              )}
            </div>
          </div>

          <div className="order-detail-right">
             {/* New Section: Partner Contact Info for C2C */}
             {order.orderItems.some(item => item.seller) && (
                 <div className="detail-card contact-info-card">
                     <h3>Thông tin liên hệ giao dịch</h3>
                     
                     {/* View for Buyer: Show Sellers Info */}
                     {user._id === order.user._id && (
                        <div>
                            <p style={{fontStyle: 'italic', marginBottom: '10px'}}>Dưới đây là thông tin người bán để bạn liên hệ nhận sách:</p>
                            {[...new Map(order.orderItems.filter(item => item.seller).map(item => [item.seller._id, item.seller])).values()].map(seller => (
                                <div key={seller._id} style={{marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #E5E7EB'}}>
                                    <p><strong>Người bán: {seller.name}</strong></p>
                                    <p>SĐT: <a href={`tel:${seller.phone}`}>{seller.phone || "Chưa cập nhật"}</a></p>
                                    <p>Địa chỉ: {seller.address ? `${seller.address.street}, ${seller.address.ward}, ${seller.address.district}, ${seller.address.province}` : "Chưa cập nhật"}</p>
                                </div>
                            ))}
                        </div>
                     )}

                     {/* View for Seller: Show Buyer Info */}
                     {order.orderItems.some(item => item.seller && item.seller._id === user._id) && user._id !== order.user._id && (
                         <div>
                             <p style={{fontStyle: 'italic', marginBottom: '10px'}}>Thông tin người mua để liên hệ giao sách:</p>
                             <p><strong>Người mua: {order.user.name}</strong></p>
                             <p>SĐT: <a href={`tel:${order.user.phone}`}>{order.user.phone || "Chưa cập nhật"}</a></p>
                             <div className="shipping-address-box">
                                 <p><strong>Địa chỉ giao hàng:</strong></p>
                                 <p>{order.shippingAddress.street}</p>
                                 <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                 <p>{order.shippingAddress.country}</p>
                             </div>
                         </div>
                     )}
                 </div>
             )}

            {/* Order Summary */}
            <div className="detail-card summary-card">
              <h3>Sản phẩm</h3>
              <div className="summary-items">
                {order.orderItems.map((item) => (
                  <div key={item.book} className="summary-item-row">
                    <div className="item-info">
                      <img
                        src={(item.cover) || "https://via.placeholder.com/50"}
                        alt={item.title}
                        className="item-image"
                      />
                      <div>
                        <Link to={`/books/${item.book}`} className="item-title">{item.title}</Link>
                        <span className="item-qty">
                           x {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <hr />
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Vận chuyển</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
            <Link to="/account/orders" className="btn-back">
              &larr; Quay lại lịch sử
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
