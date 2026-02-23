import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const allowedAdminEmails = [
        "admin@acxiom.com",
        "librarian@acxiom.com",
        "manager@library.com",
    ];

    const register = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (role === "ADMIN" && !allowedAdminEmails.includes(email)) {
            setError("This email is not authorized for ADMIN registration");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                "http://localhost:9999/api/auth/register",
                { name, username, email, password, role }
            );

            alert("Registration successful. Please login.");
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register Account</h2>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={register}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        className="form-control"
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input
                        className="form-control"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        className="form-control"
                        type="email"
                        placeholder="e.g. john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Role</label>
                    <select
                        className="form-control"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    {role === "ADMIN" && (
                        <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
                            Admin registration is restricted to authorized emails.
                        </small>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "15px" }}>
                Already have an account? <Link to="/">Login here</Link>
            </p>
        </div>
    );
}

export default Register;