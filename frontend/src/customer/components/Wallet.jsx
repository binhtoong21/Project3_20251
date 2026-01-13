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
  const [depositMethod, setDepositMethod] = useState("manual"); // 'manual' | 'linked'
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState("");
  const [depositError, setDepositError] = useState("");
  const [submittedDeposit, setSubmittedDeposit] = useState(null);

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
    if(refetchUser) refetchUser();
  }, [refetchUser]);

  // Reset states when switching tabs
  useEffect(() => {
      setDepositSuccess("");
      setDepositError("");
      setSubmittedDeposit(null);
      setAmount("");
      setDescription("");
      setDepositMethod("manual");
      
      setWithdrawAmount("");
      setWithdrawError("");
      setWithdrawSuccess("");
      setSelectedBank("");
  }, [activeTab]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    checkProfile(async () => {
        setDepositError("");
        setDepositSuccess("");
        setIsSubmitting(true);

    try {
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount < 10000) {
            setDepositError("Số tiền nạp tối thiểu là 10,000 VNĐ.");
            return;
        }

        // Logic for auto-generated description based on method
        let finalDescription = description;
        if (depositMethod === 'linked') {
             // If linked, we might auto-generate or append info, strictly controlled here
             // Ensure user has selected a bank if in linked mode (though UI enforces it via select)
             if(!description.startsWith("Auto-debit")) {
                 // Fallback or enforcement if needed, but we trust the UI state for now or validate
             }
        }

        await walletService.createDepositRequest({ amount: depositAmount, description: finalDescription });
        
        setSubmittedDeposit({ amount: depositAmount, description: finalDescription }); 
        setDepositSuccess("Yêu cầu nạp tiền thành công.");
        setAmount("");
        // Don't clear description immediately if we want to show it, but for new form clears it
        // Description state is cleared in reset/tab switch, keeping it here for now is fine as we hide form
        fetchTransactions(); 
    } catch (err) {
        setDepositError(err.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
    } finally {
        setIsSubmitting(false);
    }
    }); 
  };

  const handleResetDeposit = () => {
      setDepositSuccess("");
      setSubmittedDeposit(null);
      setAmount("");
      setDescription("");
      setDepositError("");
      setDepositMethod("manual");
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
              if (isNaN(val) || val < 50000) throw new Error("Số tiền rút tối thiểu là 50,000 VNĐ");
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
            
            {/* Show Success View Separation */}
            {depositSuccess && submittedDeposit ? (
                <div className="deposit-success-view">
                     {depositMethod === 'manual' ? (
                        <div className="transfer-instruction">
                            <div className="success-message">{depositSuccess}</div>
                            <div className="qr-box">
                                <h5>Thông tin chuyển khoản</h5>
                                <p>Ngân hàng: <strong>MB Bank</strong></p>
                                <p>Số tài khoản: <strong>9999999999</strong></p>
                                <p>Chủ tài khoản: <strong>ADMIN BOOKSTORE</strong></p>
                                <p>Nội dung: <strong>NAP {user.phone || user.email}</strong></p>
                                <img 
                                    src={`https://img.vietqr.io/image/MB-9999999999-compact2.jpg?amount=${submittedDeposit.amount}&addInfo=NAP ${user.phone || user.email}&accountName=ADMIN BOOKSTORE`} 
                                    alt="VietQR" 
                                    style={{maxWidth: '200px', margin: '20px auto', display: 'block'}}
                                />
                                <p className="hint-text">Vui lòng chuyển khoản đúng nội dung và số tiền để hệ thống tự động xử lý.</p>
                            </div>
                        </div>
                     ) : (
                        <div className="success-message-box">
                            <h4>🎉 Yêu cầu nạp tiền đã được ghi nhận!</h4>
                            <p>Hệ thống đang kết nối với ngân hàng để xử lý giao dịch nạp <strong>{formatCurrency(submittedDeposit.amount)}</strong>.</p>
                            <p>Vui lòng chờ Admin phê duyệt trong giây lát.</p>
                        </div>
                     )}
                     
                    <button className="btn-primary" style={{marginTop: '20px', width: '100%'}} onClick={handleResetDeposit}>
                        {depositMethod === 'manual' ? "Hoàn tất / Nạp thêm" : "Quay lại"}
                    </button>
                </div>
            ) : (
                /* Show Form Inputs ONLY if NO Success State */
                <>
                <h4>Nạp tiền vào ví</h4>
                
                {/* Deposit Source Selection */}
                <div className="deposit-source-selector">
                    <label className="deposit-source-label">Nguồn tiền:</label>
                    <div className="deposit-source-options">
                        <label className={`source-option ${depositMethod === 'manual' ? 'active-account' : ''}`}>
                            <input 
                                type="radio" 
                                name="depositSource" 
                                value="manual" 
                                checked={depositMethod === 'manual'} 
                                onChange={() => {
                                    setDepositMethod("manual");
                                    setDescription(""); // Clear linked description
                                }} 
                            /> 
                            Chuyển khoản (QR Code)
                        </label>
                        <label className={`source-option ${(!user.bankAccounts || user.bankAccounts.length === 0) ? 'disabled' : ''} ${depositMethod === 'linked' ? 'active-account' : ''}`}>
                             <input 
                                type="radio" 
                                name="depositSource" 
                                value="linked" 
                                disabled={!user.bankAccounts || user.bankAccounts.length === 0}
                                checked={depositMethod === 'linked'} 
                                onChange={() => {
                                    setDepositMethod("linked");
                                    if(user.bankAccounts?.length > 0) {
                                        setDescription(`Auto-debit from ${user.bankAccounts[0].bankName}`);
                                    }
                                }} 
                            /> 
                            Từ tài khoản liên kết
                            {(!user.bankAccounts || user.bankAccounts.length === 0) && <div className="hint-text" style={{fontSize: '0.8em', color: 'red', marginLeft: 'auto'}}>Chưa liên kết TK</div>}
                        </label>
                    </div>
                </div>
    
                {/* If Linked Account is selected, show dropdown */}
                {depositMethod === 'linked' && user.bankAccounts && user.bankAccounts.length > 0 && (
                    <div className="form-group slide-down">
                        <label>Chọn tài khoản nguồn:</label>
                        <select 
                            className="form-control account-select" 
                            onChange={(e) => setDescription(`Auto-debit from ${e.target.value}`)}
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
                        placeholder="Tối thiểu 10,000 đ"
                        required
                    />
                    </div>
                    
                    {depositMethod === 'manual' && (
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
    
                    {depositError && <p className="error-message">{depositError}</p>}
    
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : (depositMethod === 'linked' ? "Xác nhận nạp tiền" : "Tạo yêu cầu nạp tiền")}
                    </button>
                </form>
                </>
            )}
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
          <div className="table-responsive">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

