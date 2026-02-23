import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "USER") {
        window.location.replace("/");
        return null; // Stop render fully during redirect
    }

    const [availableBooks, setAvailableBooks] = useState([]);
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get("http://localhost:9999/api/user/books"),
            axios.get(`http://localhost:9999/api/user/issued/${user.id}`)
        ]).then(([resBooks, resIssued]) => {
            setAvailableBooks(resBooks.data);
            setIssuedBooks(resIssued.data);
        }).catch(err => {
            console.error("Failed to load data", err);
        }).finally(() => {
            setLoading(false);
        });
    }, [user?.id]);

    const logout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("user");
            sessionStorage.clear();
            window.location.replace("/");
        }
    };

    const filterBook = (b) => {
        const query = searchQuery.toLowerCase();
        return b?.title?.toLowerCase().includes(query) || b?.author?.toLowerCase().includes(query);
    };

    const activeIssued = issuedBooks.filter(ib => !ib.issuedBook.returnDate);
    const returned = issuedBooks.filter(ib => ib.issuedBook.returnDate);

    const filteredAvailable = availableBooks.filter(filterBook);
    const filteredActiveIssued = activeIssued.filter(ib => filterBook(ib.book));
    const filteredReturned = returned.filter(ib => filterBook(ib.book));

    const getDueDate = (issueDate) => {
        const d = new Date(issueDate);
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    };

    const isOverdue = (issueDate) => {
        return new Date() > new Date(getDueDate(issueDate));
    };

    return (
        <div className="container" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ margin: "0 0 5px 0" }}>Library Dashboard</h2>
                    <p style={{ margin: 0, color: "#666" }}>Welcome, <strong>{user?.name}</strong></p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={logout} style={{ padding: "8px 16px" }}>Logout</button>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Search books by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
            </div>

            {loading ? <p>Loading data...</p> : (
                <>
                    <div className="dashboard-section" style={{ marginBottom: "30px" }}>
                        <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "5px" }}>Available Books</h3>
                        {filteredAvailable.length === 0 ? <p style={{ color: "#888" }}>No available books found.</p> : (
                            <ul className="book-list" style={{ listStyle: "none", padding: 0 }}>
                                {filteredAvailable.map(b => (
                                    <li key={b.id} style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <strong style={{ fontSize: "16px" }}>{b.title}</strong>
                                            <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>by {b.author}</div>
                                        </div>
                                        <span style={{ background: "#d4edda", color: "#155724", padding: "5px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>AVAILABLE</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="dashboard-section" style={{ marginBottom: "30px" }}>
                        <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "5px" }}>Currently Issued</h3>
                        {filteredActiveIssued.length === 0 ? <p style={{ color: "#888" }}>No active issued books found.</p> : (
                            <ul className="book-list" style={{ listStyle: "none", padding: 0 }}>
                                {filteredActiveIssued.map(ib => (
                                    <li key={ib.issuedBook.id} style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", marginBottom: "10px", background: "#f8f9fa" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                            <strong style={{ fontSize: "16px" }}>{ib.book.title}</strong>
                                            <span style={{ background: isOverdue(ib.issuedBook.issueDate) ? "#f8d7da" : "#cce5ff", color: isOverdue(ib.issuedBook.issueDate) ? "#721c24" : "#004085", padding: "5px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                                                {isOverdue(ib.issuedBook.issueDate) ? "OVERDUE" : "ISSUED"}
                                            </span>
                                        </div>
                                        <div style={{ color: "#333", fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                            <span><strong>Author:</strong> {ib.book.author}</span>
                                            <span><strong style={{ color: ib.issuedBook.fine > 0 ? "#d9534f" : "inherit" }}>Calculated Fine:</strong> ₹{ib.issuedBook.fine}</span>
                                            <span><strong>Issued On:</strong> {ib.issuedBook.issueDate}</span>
                                            <span><strong>Due By:</strong> {getDueDate(ib.issuedBook.issueDate)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="dashboard-section" style={{ marginBottom: "30px" }}>
                        <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "5px" }}>Return History</h3>
                        {filteredReturned.length === 0 ? <p style={{ color: "#888" }}>No returned books found.</p> : (
                            <ul className="book-list" style={{ listStyle: "none", padding: 0 }}>
                                {filteredReturned.map(ib => (
                                    <li key={ib.issuedBook.id} style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", marginBottom: "10px", opacity: 0.8 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                            <strong style={{ fontSize: "16px", textDecoration: "line-through" }}>{ib.book.title}</strong>
                                            <span style={{ background: "#e2e3e5", color: "#383d41", padding: "5px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>RETURNED</span>
                                        </div>
                                        <div style={{ color: "#333", fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                            <span><strong>Due Date:</strong> {getDueDate(ib.issuedBook.issueDate)}</span>
                                            <span><strong>Returned On:</strong> {ib.issuedBook.returnDate}</span>
                                            <span style={{ gridColumn: "span 2" }}><strong>Final Fine:</strong> ₹{ib.issuedBook.fine}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default UserDashboard;