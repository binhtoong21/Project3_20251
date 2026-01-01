import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import walletService from "../../shared/utils/walletService";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import { useProfileCheck } from "../../shared/hooks/useProfileCheck";
import "./Wallet.css";
import BankAccounts from "./BankAccounts";

const Wallet = () => {
  const { user, refetchUser } = useAuth();
  const checkProfile = useProfileCheck();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for deposit form
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState("");
  const [depositError, setDepositError] = useState("");

  // State for withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  // Tabs for Deposit/Withdraw
  const [activeTab, setActiveTab] = useState("deposit");


  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await walletService.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError("Không thể tải lịch sử giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // refetch user data to get the latest wallet balance
    if(refetchUser) refetchUser();
  }, [refetchUser]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    checkProfile(async () => {
        setDepositError("");
        setDepositSuccess("");
        setIsSubmitting(true);

    try {
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            setDepositError("Số tiền phải là một số dương.");
            return;
        }

        await walletService.createDepositRequest({ amount: depositAmount, description });
        setDepositSuccess("Yêu cầu nạp tiền của bạn đã được gửi. Vui lòng kiểm tra thông tin chuyển khoản bên dưới.");
        setAmount("");
        setDescription("");
        fetchTransactions(); 
    } catch (err) {
        setDepositError(err.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
    } finally {
        setIsSubmitting(false);
    }
    }); 
  };

  const handleWithdrawSubmit = async (e) => {
      e.preventDefault();
      setWithdrawError("");
      setWithdrawSuccess("");

      if (!selectedBank) {
          setWithdrawError("Vui lòng chọn tài khoản ngân hàng để nhận tiền.");
          return;
      }

      checkProfile(async () => {
          setIsSubmitting(true);
          try {
              const val = parseFloat(withdrawAmount);
              if (isNaN(val) || val <= 0) throw new Error("Số tiền không hợp lệ");
              if (val > user.walletBalance) throw new Error("Số dư không đủ");

              const bankInfo = user.bankAccounts.find(acc => acc._id === selectedBank);

              await walletService.createWithdrawalRequest({ 
                  amount: val, 
                  bankInfo: {
                      bankName: bankInfo.bankName,
                      accountNumber: bankInfo.accountNumber,
                      accountName: bankInfo.accountName
                  }
              });
              setWithdrawSuccess("Yêu cầu rút tiền thành công. Admin sẽ duyệt sớm nhất.");
              setWithdrawAmount("");
              fetchTransactions();
              if(refetchUser) refetchUser();
          } catch(err) {
              setWithdrawError(err.message);
          } finally {
              setIsSubmitting(false);
          }
      });
  }

  const handleBankUpdate = (updatedAccounts) => {
     // Ideally update user context, but for now we rely on refetchUser or just local update if needed
     // Since user object in context is immutable directly, we call refetchUser
     if(refetchUser) refetchUser();
  }


  return (
    <div className="wallet-container">
      <h2>Ví của tôi</h2>

      <div className="wallet-balance-card">
        <p>Số dư hiện tại</p>
        <h3>{formatCurrency(user?.walletBalance || 0)}</h3>
      </div>

      <div className="wallet-tabs">
          <button className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => setActiveTab('deposit')}>Nạp tiền</button>
          <button className={`tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveTab('withdraw')}>Rút tiền</button>
          <button className={`tab-btn ${activeTab === 'banks' ? 'active' : ''}`} onClick={() => setActiveTab('banks')}>Tài khoản ngân hàng</button>
      </div>

      <div className="wallet-actions">
        {activeTab === 'deposit' && (
            <div className="deposit-section">
            <h4>Nạp tiền vào ví</h4>
            
            {/* Deposit Source Selection */}
            <div className="deposit-source-selector" style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Nguồn tiền:</label>
                <div style={{display: 'flex', gap: '15px'}}>
                    <label className={`source-option ${!amount || amount <= 0 ? 'disabled' : ''}`} style={{cursor: 'pointer', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', flex: 1, backgroundColor: '#fff'}}>
                        <input 
                            type="radio" 
                            name="depositSource" 
                            value="manual" 
                            checked={!description.startsWith("Auto-debit")} 
                            onChange={() => setDescription("")} 
                        /> 
                        Chuyển khoản (QR Code)
                    </label>
                    <label className={`source-option ${(!user.bankAccounts || user.bankAccounts.length === 0) ? 'disabled' : ''}`} style={{cursor: 'pointer', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', flex: 1, backgroundColor: user.bankAccounts?.length ? '#f0faff' : '#f9f9f9'}}>
                         <input 
                            type="radio" 
                            name="depositSource" 
                            value="linked" 
                            disabled={!user.bankAccounts || user.bankAccounts.length === 0}
                            checked={description.startsWith("Auto-debit")} 
                            onChange={() => setDescription(`Auto-debit from ${user.bankAccounts[0].bankName}`)} 
                        /> 
                        Từ tài khoản liên kết
                        {(!user.bankAccounts || user.bankAccounts.length === 0) && <div style={{fontSize: '0.8em', color: 'red'}}>Chưa liên kết TK</div>}
                    </label>
                </div>
            </div>

            {/* If Linked Account is selected, show dropdown */}
            {description.startsWith("Auto-debit") && user.bankAccounts && user.bankAccounts.length > 0 && (
                <div className="form-group slide-down">
                    <label>Chọn tài khoản nguồn:</label>
                    <select 
                        className="form-control" 
                        onChange={(e) => setDescription(`Auto-debit from ${e.target.value}`)}
                        style={{width: '100%', padding: '10px'}}
                    >
                        {user.bankAccounts.map(acc => (
                            <option key={acc._id} value={`${acc.bankName} - ${acc.accountNumber}`}>
                                {acc.bankName} ****{acc.accountNumber.slice(-4)} ({acc.accountName})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <form onSubmit={handleDepositSubmit}>
                <div className="form-group">
                <label htmlFor="amount">Số tiền nạp (VNĐ)</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ví dụ: 500000"
                    required
                />
                </div>
                
                {!description.startsWith("Auto-debit") && (
                    <div className="form-group">
                    <label htmlFor="description">Ghi chú (Tùy chọn)</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ví dụ: Chuyển khoản từ Techcombank"
                    />
                    </div>
                )}

                {depositSuccess && (
                     !description.startsWith("Auto-debit") ? (
                        <div className="transfer-instruction">
                            <div className="success-message">{depositSuccess}</div>
                            <div className="qr-box">
                                <h5>Thông tin chuyển khoản</h5>
                                <p>Ngân hàng: <strong>MB Bank</strong></p>
                                <p>Số tài khoản: <strong>9999999999</strong></p>
                                <p>Chủ tài khoản: <strong>ADMIN BOOKSTORE</strong></p>
                                <p>Nội dung: <strong>NAP {user.phone}</strong></p>
                                <img 
                                    src={`https://img.vietqr.io/image/MB-9999999999-compact2.jpg?amount=${amount}&addInfo=NAP ${user.phone}&accountName=ADMIN BOOKSTORE`} 
                                    alt="VietQR" 
                                    style={{maxWidth: '200px', margin: '10px auto', display: 'block'}}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="success-message" style={{padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb'}}>
                            <h4 style={{marginTop: 0, color: '#155724'}}>🎉 Yêu cầu nạp tiền đã được ghi nhận!</h4>
                            <p>Hệ thống đang kết nối với ngân hàng để xử lý giao dịch nạp <strong>{formatCurrency(amount)}</strong>.</p>
                            <p>Vui lòng chờ Admin phê duyệt trong giây lát.</p>
                        </div>
                    )
                )}
                {depositError && <p className="error-message">{depositError}</p>}

                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : (description.startsWith("Auto-debit") ? "Xác nhận nạp tiền" : "Tạo yêu cầu nạp tiền")}
                </button>
            </form>
            </div>
        )}

        {activeTab === 'withdraw' && (
            <div className="withdraw-section">
                <h4>Rút tiền về ngân hàng</h4>
                <form onSubmit={handleWithdrawSubmit}>
                     <div className="form-group">
                        <label>Chọn tài khoản nhận tiền</label>
                        <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} required>
                            <option value="">-- Chọn ngân hàng --</option>
                            {user.bankAccounts && user.bankAccounts.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.bankName} - {acc.accountNumber} ({acc.accountName})
                                </option>
                            ))}
                        </select>
                        {(!user.bankAccounts || user.bankAccounts.length === 0) && (
                            <p className="hint-text" style={{color: 'red'}}>Bạn chưa liên kết tài khoản ngân hàng. Vui lòng vào tab "Tài khoản ngân hàng" để thêm.</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Số tiền muốn rút</label>
                        <input 
                            type="number" 
                            value={withdrawAmount} 
                            onChange={e => setWithdrawAmount(e.target.value)}
                            placeholder="Tối thiểu 50,000 đ"
                            required
                        />
                    </div>
                    {withdrawSuccess && <p className="success-message">{withdrawSuccess}</p>}
                    {withdrawError && <p className="error-message">{withdrawError}</p>}
                    <button type="submit" className="btn-primary" disabled={isSubmitting || !user.bankAccounts?.length}>
                        {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu rút tiền"}
                    </button>
                </form>
            </div>
        )}

        {activeTab === 'banks' && (
            <BankAccounts bankAccounts={user.bankAccounts || []} onUpdate={refetchUser} />
        )}

      </div>

      <div className="transaction-history">
        <h4>Lịch sử giao dịch</h4>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : transactions.length === 0 ? (
          <p>Bạn chưa có giao dịch nào.</p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className={`status-${tx.status}`}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>
                      {tx.type === 'deposit' ? 'Nạp tiền' : 
                       tx.type === 'withdrawal' ? 'Rút tiền' : 
                       tx.type === 'purchase' ? 'Thanh toán' : 
                       tx.type === 'sale_income' ? 'Tiền bán hàng' : tx.type}
                  </td>
                  <td className={tx.amount > 0 ? 'amount-positive' : 'amount-negative'}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td>
                      <span className={`badge badge-${tx.status}`}>
                          {tx.status === 'pending' ? 'Chờ duyệt' : 
                           tx.status === 'completed' ? 'Thành công' : 'Thất bại'}
                      </span>
                  </td>
                  <td>
                      {tx.description}
                      {tx.bankInfo && tx.bankInfo.bankName && (
                          <div style={{fontSize: '0.8em', color: '#666'}}>
                              {tx.bankInfo.bankName} - {tx.bankInfo.accountNumber}
                          </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Wallet;

