import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();
        setError("");
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:9999/api/auth/login",
                { username, password }
            );

            localStorage.setItem("user", JSON.stringify(res.data));

            if (res.data.role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/user", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Library Login</h2>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={login}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        className="form-control"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "15px" }}>
                New user? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default Login;