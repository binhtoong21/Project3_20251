import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import "./AddressSelector.css";

const AddressSelector = ({ value, onChange, disabled }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Initial Loading state
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // 1. Fetch Provinces on Mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await apiClient.get("/location/provinces");
        setProvinces(data || []);
      } catch (error) {
        console.error("Failed to load provinces", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Fetch Districts when Province ID changes
  useEffect(() => {
    if (!value.province_id) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        // Warning: API might expect strict type, ensure ID is passed correctly
        const data = await apiClient.get(`/location/districts/${value.province_id}`);
        setDistricts(data || []);
      } catch (error) {
        console.error("Failed to load districts", error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [value.province_id]);

  // 3. Fetch Wards when District ID changes
  useEffect(() => {
    if (!value.district_id) {
        setWards([]);
        return;
    }
    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const data = await apiClient.get(`/location/wards/${value.district_id}`);
        setWards(data || []);
      } catch (error) {
        console.error("Failed to load wards", error);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [value.district_id]);

  const handleProvinceChange = (e) => {
    const provinceId = Number(e.target.value);
    const provinceName = e.target.options[e.target.selectedIndex].text;
    
    // Reset District & Ward
    onChange({
        ...value,
        province_id: provinceId,
        province: provinceName,
        district_id: null,
        district: "",
        ward_code: null,
        ward: ""
    });
  };

  const handleDistrictChange = (e) => {
    const districtId = Number(e.target.value);
    const districtName = e.target.options[e.target.selectedIndex].text;

     // Reset Ward
     onChange({
        ...value,
        district_id: districtId,
        district: districtName,
        ward_code: null,
        ward: ""
    });
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value; // Ward Code is String in GHN usually
    const wardName = e.target.options[e.target.selectedIndex].text;

     onChange({
        ...value,
        ward_code: wardCode,
        ward: wardName
    });
  };

  const handleStreetChange = (e) => {
      onChange({
          ...value,
          street: e.target.value
      });
  }

  return (
    <div className="address-selector">
      <div className="form-group">
        <label>Tỉnh / Thành phố</label>
        <select 
            value={value.province_id || ""} 
            onChange={handleProvinceChange}
            disabled={disabled || loadingProvinces}
        >
          <option value="">-- Chọn Tỉnh/Thành --</option>
          {provinces.map((p) => (
            <option key={p.ProvinceID} value={p.ProvinceID}>
              {p.ProvinceName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group half">
            <label>Quận / Huyện</label>
            <select 
                value={value.district_id || ""} 
                onChange={handleDistrictChange}
                disabled={disabled || !value.province_id || loadingDistricts}
            >
            <option value="">-- Chọn Quận/Huyện --</option>
            {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
                </option>
            ))}
            </select>
        </div>

        <div className="form-group half">
            <label>Phường / Xã</label>
            <select 
                value={value.ward_code || ""} 
                onChange={handleWardChange}
                disabled={disabled || !value.district_id || loadingWards}
            >
            <option value="">-- Chọn Phường/Xã --</option>
            {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
                </option>
            ))}
            </select>
        </div>
      </div>

      <div className="form-group">
        <label>Địa chỉ cụ thể (Số nhà, tên đường)</label>
        <input 
            type="text" 
            value={value.street || ""} 
            onChange={handleStreetChange}
            placeholder="Vd: 123 Nguyễn Văn A"
            disabled={disabled}
        />
      </div>
    </div>
  );
};

export default AddressSelector;
