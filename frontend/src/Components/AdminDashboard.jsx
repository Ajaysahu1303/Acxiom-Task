import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [books, setBooks] = useState([]);
    const [searchBookTerm, setSearchBookTerm] = useState("");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");

    // Student Search State
    const [studentQuery, setStudentQuery] = useState("");
    const [student, setStudent] = useState(null);
    const [studentIssuedBooks, setStudentIssuedBooks] = useState([]);
    const [searchStudentError, setSearchStudentError] = useState("");

    // Loading states
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [adding, setAdding] = useState(false);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const loadBooks = () => {
        setLoadingBooks(true);
        axios.get("http://localhost:9999/api/admin/books")
            .then(res => setBooks(res.data))
            .catch(err => console.error("Failed to load books", err))
            .finally(() => setLoadingBooks(false));
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const logout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("user");
            navigate("/", { replace: true });
        }
    };

    const addBook = async (e) => {
        e.preventDefault();
        if (!title || !author) return;
        setAdding(true);
        try {
            await axios.post("http://localhost:9999/api/admin/books", { title, author, available: true });
            setTitle("");
            setAuthor("");
            loadBooks();
        } catch (err) {
            alert("Failed to add book.");
        } finally {
            setAdding(false);
        }
    };

    const searchStudent = async (e) => {
        e.preventDefault();
        setSearchStudentError("");
        try {
            const res = await axios.get(`http://localhost:9999/api/admin/user?query=${studentQuery}`);
            if (res.data && res.data.id) {
                setStudent(res.data);
                loadStudentIssued(res.data.id);
            } else {
                setStudent(null);
                setSearchStudentError("No student found with that ID or Email.");
            }
        } catch (err) {
            console.error(err);
            setSearchStudentError("Error searching student.");
        }
    }

    const loadStudentIssued = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:9999/api/admin/issued/${userId}`);
            setStudentIssuedBooks(res.data);
        } catch (err) {
            console.error("Failed to load student books", err);
        }
    };

    const issueBook = async (bookId) => {
        if (!student) return alert("Please select a student first in the Student Management section!");

        const issueDate = new Date().toISOString().split('T')[0];
        const dueD = new Date();
        dueD.setDate(dueD.getDate() + 7);
        const dueDate = dueD.toISOString().split('T')[0];

        if (!window.confirm(`Issue this book to ${student.name}?\n\nIssue Date: ${issueDate}\nDue Date: ${dueDate}`)) return;

        try {
            await axios.post(`http://localhost:9999/api/admin/issue?userId=${student.id}&bookId=${bookId}`);
            loadBooks();
            loadStudentIssued(student.id);
            alert("Book issued successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to issue book");
        }
    }

    const returnBook = async (issuedBookId) => {
        const returnDate = new Date().toISOString().split('T')[0];
        if (!window.confirm(`Confirm returning this book?\n\nReturn Date: ${returnDate}`)) return;
        try {
            await axios.post(`http://localhost:9999/api/admin/return/${issuedBookId}`);
            loadBooks();
            loadStudentIssued(student.id);
        } catch (err) {
            console.error(err);
            alert("Failed to return book");
        }
    }

    const editFine = async (issuedBookId, currentFine) => {
        const amountStr = window.prompt("Enter new fine amount (₹) for waiver/correction:", currentFine);
        if (amountStr !== null) {
            const amount = parseInt(amountStr);
            if (!isNaN(amount) && amount >= 0) {
                try {
                    await axios.post(`http://localhost:9999/api/admin/fine/${issuedBookId}?amount=${amount}`);
                    loadStudentIssued(student.id);
                } catch (e) {
                    console.error(e);
                    alert("Failed to update fine.");
                }
            } else {
                alert("Invalid fine amount.");
            }
        }
    }

    const getDueDate = (issueDate) => {
        const d = new Date(issueDate);
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    };

    const filteredBooks = books.filter(b =>
    (b.title?.toLowerCase().includes(searchBookTerm.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchBookTerm.toLowerCase()))
    );

    const activeIssued = studentIssuedBooks.filter(ib => !ib.issuedBook.returnDate);
    const returned = studentIssuedBooks.filter(ib => ib.issuedBook.returnDate);

    // CSS styling constants for a clean, human-written look without external UI libraries
    const cardStyle = { background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e1e4e8", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
    const inputStyle = { padding: "10px", fontSize: "14px", borderRadius: "4px", border: "1px solid #d1d5da", width: "100%", boxSizing: "border-box" };
    const btnPrimary = { background: "#0366d6", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" };
    const btnSuccess = { background: "#28a745", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" };
    const btnDanger = { background: "#d73a49", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#24292e" }}>

            {/* Header Section */}
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e1e4e8", paddingBottom: "15px", marginBottom: "25px" }}>
                <div>
                    <h2 style={{ margin: "0 0 5px 0", color: "#24292e" }}>Administrator Dashboard</h2>
                    <p style={{ margin: 0, color: "#586069", fontSize: "14px" }}>Welcome back, <strong>{user?.name}</strong></p>
                </div>
                <button onClick={logout} style={btnDanger}>Logout</button>
            </header>

            <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", alignItems: "flex-start" }}>

                {/* Book Management Section */}
                <div style={{ flex: "1 1 500px" }}>
                    <div style={cardStyle}>
                        <h3 style={{ marginTop: 0, borderBottom: "1px solid #eaecef", paddingBottom: "10px", color: "#24292e" }}>Book Management</h3>

                        {/* Add Book */}
                        <div style={{ background: "#f6f8fa", padding: "15px", borderRadius: "6px", marginBottom: "20px", border: "1px solid #e1e4e8" }}>
                            <h4 style={{ margin: "0 0 12px 0", fontSize: "15px" }}>Add New Book</h4>
                            <form onSubmit={addBook} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <input
                                        placeholder="Enter book title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Enter author name"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <small style={{ color: (!title || !author) ? "#cb2431" : "transparent" }}>
                                        * Please fill in both fields to add a book.
                                    </small>
                                    <button type="submit" style={{ ...btnPrimary, opacity: (!title || !author || adding) ? 0.6 : 1 }} disabled={adding || !title || !author}>
                                        {adding ? "Adding..." : "Add Book"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Search Book */}
                        <div style={{ marginBottom: "15px" }}>
                            <input
                                type="text"
                                placeholder="Search by title or author"
                                value={searchBookTerm}
                                onChange={(e) => setSearchBookTerm(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* Book List */}
                        {loadingBooks ? <p style={{ color: "#586069" }}>Loading catalog...</p> : (
                            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e1e4e8", borderRadius: "6px" }}>
                                {filteredBooks.length === 0 ? (
                                    <p style={{ padding: "15px", color: "#586069", margin: 0, textAlign: "center" }}>No books found matching criteria.</p>
                                ) : (
                                    filteredBooks.map(b => (
                                        <div key={b.id} style={{ padding: "12px 15px", borderBottom: "1px solid #e1e4e8", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
                                            <div>
                                                <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>{b.title}</strong>
                                                <span style={{ color: "#586069", fontSize: "13px" }}>by {b.author}</span>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                                                <span style={{
                                                    padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600",
                                                    background: b.available !== false ? "#dcffe4" : "#ffeef0",
                                                    color: b.available !== false ? "#1a7f37" : "#cb2431"
                                                }}>
                                                    {b.available !== false ? "AVAILABLE" : "ISSUED"}
                                                </span>
                                                {b.available !== false && (
                                                    <button onClick={() => issueBook(b.id)} style={{ ...btnPrimary, padding: "5px 10px", fontSize: "12px", background: "#0366d6" }}>
                                                        Issue Book
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Student Management Section */}
                <div style={{ flex: "1 1 500px" }}>
                    <div style={cardStyle}>
                        <h3 style={{ marginTop: 0, borderBottom: "1px solid #eaecef", paddingBottom: "10px", color: "#24292e" }}>Student Management</h3>

                        {/* Student Search */}
                        <form onSubmit={searchStudent} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                            <input
                                type="text"
                                placeholder="Search student by User ID or Email"
                                value={studentQuery}
                                onChange={(e) => setStudentQuery(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <button type="submit" style={{ ...btnPrimary, background: "#28a745" }}>Search</button>
                        </form>
                        {searchStudentError && <p style={{ color: "#cb2431", margin: "0 0 15px 0", fontSize: "14px" }}>{searchStudentError}</p>}

                        {student && (
                            <>
                                {/* Student Profile */}
                                <div style={{ background: "#f1f8ff", padding: "15px", borderRadius: "6px", border: "1px solid #c8e1ff", marginBottom: "20px" }}>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#0366d6" }}>{student.name}</h4>
                                    <div style={{ fontSize: "14px", color: "#24292e", display: "flex", gap: "20px" }}>
                                        <span><strong>Email:</strong> {student.email}</span>
                                        <span><strong>User ID:</strong> {student.id}</span>
                                    </div>
                                </div>

                                {/* Active Issued Books */}
                                <h4 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>Issued Books ({activeIssued.length})</h4>
                                {activeIssued.length === 0 ? <p style={{ color: "#586069", fontSize: "14px", marginBottom: "20px" }}>No books currently issued.</p> : (
                                    <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {activeIssued.map(ib => (
                                            <div key={ib.issuedBook.id} style={{ padding: "15px", background: "#fff", border: "1px solid #e1e4e8", borderRadius: "6px", borderLeft: "4px solid #0366d6" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                                    <strong style={{ fontSize: "15px" }}>{ib.book.title}</strong>
                                                    <button onClick={() => returnBook(ib.issuedBook.id)} style={btnSuccess}>
                                                        Mark as Returned
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: "13px", color: "#586069", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                                    <span><strong>Issue Date:</strong> {ib.issuedBook.issueDate}</span>
                                                    <span><strong>Due Date:</strong> {getDueDate(ib.issuedBook.issueDate)}</span>
                                                    <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "15px", marginTop: "4px", padding: "8px", background: "#f6f8fa", borderRadius: "4px" }}>
                                                        <span style={{ fontSize: "14px" }}>Fine: <strong style={{ color: ib.issuedBook.fine > 0 ? "#cb2431" : "#24292e" }}>₹{ib.issuedBook.fine}</strong></span>
                                                        <button onClick={() => editFine(ib.issuedBook.id, ib.issuedBook.fine)} style={{ background: "none", border: "none", color: "#0366d6", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "13px" }}>
                                                            Edit/Waive Fine
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Returned History */}
                                <h4 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>Return History ({returned.length})</h4>
                                {returned.length === 0 ? <p style={{ color: "#586069", fontSize: "14px" }}>No past returns.</p> : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {returned.map(ib => (
                                            <div key={ib.issuedBook.id} style={{ padding: "12px 15px", background: "#fafbfc", border: "1px solid #e1e4e8", borderRadius: "6px" }}>
                                                <strong style={{ fontSize: "14px", color: "#24292e" }}>{ib.book.title}</strong>
                                                <div style={{ fontSize: "13px", color: "#586069", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                                                    <span>Returned: {ib.issuedBook.returnDate}</span>
                                                    <span>Final Fine: ₹{ib.issuedBook.fine}
                                                        <button onClick={() => editFine(ib.issuedBook.id, ib.issuedBook.fine)} style={{ background: "none", border: "none", color: "#0366d6", cursor: "pointer", textDecoration: "underline", marginLeft: "10px", padding: 0, fontSize: "12px" }}>Modify</button>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;