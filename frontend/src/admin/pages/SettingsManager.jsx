import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../../shared/utils/apiClient";
import AddressSelector from "../../shared/components/AddressSelector";
import "./SettingsManager.css";

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [address, setAddress] = useState({
    street: "",
    ward: "", ward_code: "",
    district: "", district_id: null,
    province: "", province_id: null,
    country: "Việt Nam",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const data = await apiClient.get("/settings");
        if (data) {
            setStoreName(data.storeName || "");
            setStorePhone(data.storePhone || "");
            if (data.storeAddress) {
                setAddress({
                    street: data.storeAddress.street || "",
                    ward: data.storeAddress.ward || "",
                    ward_code: data.storeAddress.ward_code || "",
                    district: data.storeAddress.district || "",
                    district_id: data.storeAddress.district_id,
                    province: data.storeAddress.province || "",
                    province_id: data.storeAddress.province_id,
                    country: "Việt Nam"
                });
            }
        }
    } catch (error) {
       console.error("Failed to load settings:", error);
       toast.error("Failed to load settings");
    } finally {
       setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        // Validation
        if (!storeName || !address.district_id || !address.ward_code || !address.street) {
             toast.error("Please fill in all required fields (Name, Address)");
             setSaving(false);
             return;
        }

        await apiClient.put("/settings", {
            storeName,
            storePhone,
            storeAddress: address
        });
        toast.success("Settings saved successfully!");
    } catch (error) {
        console.error("Save error:", error);
        toast.error(error.message || "Failed to save settings");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="admin-page settings-manager">
      <div className="page-header">
        <h2>Store Settings</h2>
        <p>Configure your store details and pickup address for shipping.</p>
      </div>

      <div className="admin-card">
        <form onSubmit={handleSave} className="settings-form">
           <div className="form-group">
              <label>Store Name</label>
              <input 
                 type="text" 
                 className="form-control"
                 value={storeName}
                 onChange={(e) => setStoreName(e.target.value)}
                 required
                 placeholder="e.g. My BookStore"
              />
           </div>

           <div className="form-group">
              <label>Store Phone</label>
              <input 
                 type="text" 
                 className="form-control"
                 value={storePhone}
                 onChange={(e) => setStorePhone(e.target.value)}
                 placeholder="e.g. 0912345678"
              />
           </div>

           <div className="form-group">
              <label>Pickup Address (Required for Shipping Calculation)</label>
              <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                  <AddressSelector 
                     value={address}
                     onChange={(newAddr) => setAddress(newAddr)}
                  />
                  <div style={{marginTop: '10px'}}>
                     <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem'}}>Street Address</label>
                     <input 
                        type="text" 
                        className="form-control"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        placeholder="e.g. 123 Main St"
                     />
                  </div>
              </div>
           </div>

           <button type="submit" className="btn btn-primary" disabled={saving} style={{marginTop: '20px'}}>
              {saving ? "Saving..." : "Save Settings"}
           </button>
        </form>
      </div>
    </div>
  );
}
