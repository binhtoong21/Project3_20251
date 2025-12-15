import { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import "./Notifications.css";
import "./header.css";
export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-container" ref={dropdownRef}>
      <div
        className="notification-icon-wrapper icon-link"
        onClick={toggleDropdown}
      >
        <FaBell />
        <span>Thông báo</span>
      </div>
      {isOpen && (
        <div className="notification-dropdown">
          <p>Không có thông báo</p>
        </div>
      )}
    </div>
  );
}
