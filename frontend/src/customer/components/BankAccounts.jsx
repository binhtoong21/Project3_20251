import React, { useState } from 'react';
import apiClient from '../../shared/utils/apiClient';
import { useAuth } from '../../shared/context/AuthContext';
import './BankAccounts.css';

const BankAccounts = ({ bankAccounts, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '',
        branch: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const updatedAccounts = await apiClient.post('/users/bank-accounts', formData);
            onUpdate(updatedAccounts);
            setShowForm(false);
            setFormData({ bankName: '', accountNumber: '', accountName: '', branch: '' });
        } catch (err) {
            setError(err.message || 'Failed to add bank account');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
        try {
            const updatedAccounts = await apiClient.delete(`/users/bank-accounts/${id}`);
            onUpdate(updatedAccounts);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="bank-accounts-section">
            <h3>Tài khoản ngân hàng liên kết</h3>
            
            <div className="bank-list">
                {bankAccounts && bankAccounts.length > 0 ? (
                    bankAccounts.map(acc => (
                        <div key={acc._id} className="bank-card">
                            <div className="bank-info">
                                <span className="bank-name">{acc.bankName}</span>
                                <span className="account-number">**** {acc.accountNumber.slice(-4)}</span>
                                <span className="account-holder">{acc.accountName.toUpperCase()}</span>
                            </div>
                            <button className="btn-delete" onClick={() => handleDelete(acc._id)}>×</button>
                        </div>
                    ))
                ) : (
                    <p className="no-accounts">Chưa có tài khoản ngân hàng nào được liên kết.</p>
                )}
            </div>

            {!showForm ? (
                <button className="btn-add-bank" onClick={() => setShowForm(true)}>+ Thêm tài khoản ngân hàng</button>
            ) : (
                <form className="add-bank-form" onSubmit={handleSubmit}>
                    <h4>Thêm tài khoản mới</h4>
                    {error && <p className="error-text">{error}</p>}
                    <div className="form-group">
                        <label>Tên ngân hàng</label>
                        <select name="bankName" value={formData.bankName} onChange={handleChange} required>
                            <option value="">Chọn ngân hàng</option>
                            <option value="Vietcombank">Vietcombank</option>
                            <option value="Techcombank">Techcombank</option>
                            <option value="MB Bank">MB Bank</option>
                            <option value="ACB">ACB</option>
                            <option value="VPBank">VPBank</option>
                            <option value="BIDV">BIDV</option>
                            <option value="Vietinbank">Vietinbank</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Số tài khoản</label>
                        <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Tên chủ tài khoản</label>
                        <input type="text" name="accountName" value={formData.accountName} onChange={handleChange} required style={{textTransform: 'uppercase'}} />
                    </div>
                    <div className="form-group">
                        <label>Chi nhánh (Tùy chọn)</label>
                        <input type="text" name="branch" value={formData.branch} onChange={handleChange} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                        <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Đang thêm...' : 'Lưu'}</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default BankAccounts;
