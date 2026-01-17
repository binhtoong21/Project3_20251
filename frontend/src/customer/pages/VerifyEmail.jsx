import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../shared/utils/apiClient";
import { useAuth } from "../../shared/context/AuthContext";
import "./page.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Verification token not found");
          return;
        }

        const response = await apiClient.post("/users/verify-email", { token });

        // Auto login user after verification
        if (response.token) {
          handleAuthSuccess(response);
        }

        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
        toast.success("Email verified! Redirecting to home...");

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Email verification failed");
        toast.error(error.message || "Email verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, navigate, handleAuthSuccess]);

  return (
    <div className="page verify-email-page">
      <div className="container">
        <div className="verify-email-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          {status === "loading" && (
            <div>
              <div style={{
                fontSize: "48px",
                marginBottom: "20px",
                animation: "spin 2s linear infinite"
              }}>
                ⏳
              </div>
              <h2>Verifying your email...</h2>
              <p>Please wait while we verify your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✓</div>
              <h2 style={{ color: "#28a745" }}>Email Verified Successfully!</h2>
              <p>{message}</p>
              <p style={{ color: "#666", fontSize: "14px" }}>
                You will be redirected to home in a few seconds...
              </p>
              <button 
                onClick={() => navigate("/")}
                className="btn"
                style={{ marginTop: "20px" }}
              >
                Go to Home Now
              </button>
            </div>
          )}

          {status === "error" && (
            <div>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✗</div>
              <h2 style={{ color: "#dc3545" }}>Verification Failed</h2>
              <p>{message}</p>
              <div style={{ marginTop: "30px" }}>
                <Link to="/resend-verification" className="btn" style={{ marginRight: "10px" }}>
                  Resend Verification Email
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
