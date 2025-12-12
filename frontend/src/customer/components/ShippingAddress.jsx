import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import "./ShippingAddress.css";

const ShippingAddress = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Việt Nam",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.address) {
      setFormData({
        street: user.address.street || "",
        city: user.address.city || "",
        state: user.address.state || "",
        postalCode: user.address.postalCode || "",
        country: user.address.country || "Việt Nam",
      });
    }
    setIsLoading(false);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = JSON.parse(localStorage.getItem("userData"));
      const response = await apiClient.put(
        `/users/profile/address`,
        { address: formData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response);
      alert("Address updated successfully!");
    } catch (error) {
      console.error("Failed to update address", error);
      alert("Failed to update address. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Shipping Address</h2>
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="123 Main St"
            />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ho Chi Minh City"
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State / Province</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Thủ Đức"
            />
          </div>
          <div className="form-group">
            <label htmlFor="postalCode">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="700000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>
        <button type="submit" className="btn-update">
          Update Address
        </button>
      </form>
    </div>
  );
};

export default ShippingAddress;
