import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "ADMIN") {
        window.location.replace("/");
        return null;
    }

    const [books, setBooks] = useState([]);
    const [searchBookTerm, setSearchBookTerm] = useState("");

    const [allStudents, setAllStudents] = useState([]);

    // Student Search / Focus State
    const [studentQuery, setStudentQuery] = useState("");
    const [student, setStudent] = useState(null);
    const [studentIssuedBooks, setStudentIssuedBooks] = useState([]);

    // Issue Book Selection state
    const [selectedBookToIssue, setSelectedBookToIssue] = useState("");

    // Add Book State
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [adding, setAdding] = useState(false);

    const navigate = useNavigate();

    const loadBooks = () => {
        axios.get("http://localhost:9999/api/admin/books")
            .then(res => setBooks(res.data))
            .catch(err => console.error("Failed to load books", err));
    };

    const loadUsers = () => {
        axios.get("http://localhost:9999/api/admin/users")
            .then(res => {
                // Filter out ADMINs if you want, but simply keeping users
                setAllStudents(res.data.filter(u => u.role === "USER"));
            })
            .catch(err => console.error("Failed to load users", err));
    }

    useEffect(() => {
        loadBooks();
        loadUsers();
    }, []);

    const logout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("user");
            sessionStorage.clear();
            window.location.replace("/");
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
            alert("Book added to Catalog!");
        } catch (err) {
            alert("Failed to add book.");
        } finally {
            setAdding(false);
        }
    };

    const loadStudentIssued = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:9999/api/admin/issued/${userId}`);
            setStudentIssuedBooks(res.data);
        } catch (err) {
            console.error("Failed to load student books", err);
        }
    };

    const selectStudent = (u) => {
        setStudent(u);
        setSelectedBookToIssue("");
        loadStudentIssued(u.id);
    };

    const issueBook = async (e) => {
        e.preventDefault();
        if (!student || !selectedBookToIssue) return;

        const issueDate = new Date().toISOString().split('T')[0];
        const dueD = new Date();
        dueD.setDate(dueD.getDate() + 7);
        const dueDate = dueD.toISOString().split('T')[0];

        if (!window.confirm(`Issue book ID (${selectedBookToIssue}) to ${student.name}?\n\nIssue Date: ${issueDate}\nDue Date: ${dueDate}`)) return;

        try {
            await axios.post(`http://localhost:9999/api/admin/issue?email=${encodeURIComponent(student.email)}&bookId=${selectedBookToIssue}`);
            loadBooks();
            loadStudentIssued(student.id);
            setSelectedBookToIssue("");
            alert("Book issued successfully.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Failed to issue book");
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

    const filteredStudents = allStudents.filter(s =>
    (s.name?.toLowerCase().includes(studentQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentQuery.toLowerCase()) ||
        s.id.toString().includes(studentQuery))
    );

    const activeIssued = studentIssuedBooks.filter(ib => !ib.issuedBook.returnDate);
    const returned = studentIssuedBooks.filter(ib => ib.issuedBook.returnDate);
    const availableBooksForSelect = books.filter(b => b.available !== false);

    // CSS styling constants
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
                    <h2 style={{ margin: "0 0 5px 0", color: "#24292e" }}>Administrator Workspace</h2>
                    <p style={{ margin: 0, color: "#586069", fontSize: "14px" }}>System Management Dashboard - <strong>{user?.name}</strong></p>
                </div>
                <button onClick={logout} style={btnDanger}>Logout</button>
            </header>

            <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", alignItems: "flex-start" }}>

                {/* LEFT COLUMN - Student List & Library Operations */}
                <div style={{ flex: "1 1 400px" }}>

                    <div style={cardStyle}>
                        <h3 style={{ marginTop: 0, borderBottom: "1px solid #eaecef", paddingBottom: "10px", color: "#24292e" }}>Student Directory</h3>

                        <div style={{ marginBottom: "15px" }}>
                            <input
                                type="text"
                                placeholder="Search students by Name, ID, or Email"
                                value={studentQuery}
                                onChange={(e) => setStudentQuery(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid #e1e4e8", borderRadius: "6px", background: "#f6f8fa" }}>
                            {filteredStudents.length === 0 ? (
                                <p style={{ padding: "15px", color: "#586069", margin: 0, textAlign: "center" }}>No students found.</p>
                            ) : (
                                filteredStudents.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => selectStudent(s)}
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #e1e4e8",
                                            cursor: "pointer",
                                            background: student?.id === s.id ? "#0366d6" : "#fff",
                                            color: student?.id === s.id ? "#fff" : "#24292e"
                                        }}
                                    >
                                        <strong style={{ fontSize: "15px", display: "block" }}>{s.name}</strong>
                                        <span style={{ fontSize: "13px", color: student?.id === s.id ? "#e1e4e8" : "#586069" }}>{s.email} | ID: {s.id}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Add Book Utility Form retained for Admin Convenience */}
                    <div style={cardStyle}>
                        <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "15px", color: "#586069" }}>Catalog Tool: Add New Book</h4>
                        <form onSubmit={addBook} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input placeholder="Book title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                                <input placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} style={inputStyle} />
                            </div>
                            <button type="submit" style={{ ...btnSuccess, padding: "10px", opacity: (!title || !author || adding) ? 0.6 : 1 }} disabled={adding || !title || !author}>
                                {adding ? "Adding..." : "+ Quick Add"}
                            </button>
                        </form>
                    </div>

                </div>

                {/* RIGHT COLUMN - Student Detail Profile & Issue Center */}
                <div style={{ flex: "2 1 600px" }}>
                    <div style={cardStyle}>

                        {!student ? (
                            <div style={{ textAlign: "center", padding: "50px 20px", color: "#586069" }}>
                                <h3 style={{ margin: "0 0 10px 0" }}>No Student Selected</h3>
                                <p style={{ margin: 0 }}>Please select a student from the directory on the left to handle book issues, returns, and library fines.</p>
                            </div>
                        ) : (
                            <>
                                {/* Student Profile Overview */}
                                <div style={{ background: "#f1f8ff", padding: "20px", borderRadius: "6px", border: "1px solid #c8e1ff", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h2 style={{ margin: "0 0 5px 0", color: "#0366d6" }}>{student.name}</h2>
                                        <div style={{ fontSize: "14px", color: "#24292e", display: "flex", gap: "15px" }}>
                                            <span><strong>Email:</strong> {student.email}</span>
                                            <span><strong>System ID:</strong> {student.id}</span>
                                        </div>
                                    </div>

                                    {/* Issue Book Form Explicitly Here in Profile Mode */}
                                    <form onSubmit={issueBook} style={{ display: "flex", gap: "10px", background: "#fff", padding: "10px", borderRadius: "6px", border: "1px solid #e1e4e8", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                                        <select
                                            style={{ ...inputStyle, width: "220px" }}
                                            value={selectedBookToIssue}
                                            onChange={(e) => setSelectedBookToIssue(e.target.value)}
                                        >
                                            <option value="">Select a Book to Issue...</option>
                                            {availableBooksForSelect.map(b => (
                                                <option key={b.id} value={b.id}>[ID: {b.id}] {b.title} - {b.author}</option>
                                            ))}
                                        </select>
                                        <button type="submit" style={{ ...btnPrimary, background: "#0366d6" }} disabled={!selectedBookToIssue}>
                                            Issue
                                        </button>
                                    </form>
                                </div>

                                {/* Active Issued Books */}
                                <h3 style={{ margin: "0 0 15px 0", borderBottom: "1px solid #eaecef", paddingBottom: "10px", color: "#24292e" }}>
                                    Currently Issued ({activeIssued.length})
                                </h3>

                                {activeIssued.length === 0 ? <p style={{ color: "#586069", fontSize: "14px", marginBottom: "30px" }}>No active books are checked out by this student.</p> : (
                                    <div style={{ marginBottom: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
                                        {activeIssued.map(ib => (
                                            <div key={ib.issuedBook.id} style={{ padding: "15px", background: "#fff", border: "1px solid #e1e4e8", borderRadius: "6px", borderLeft: "4px solid #0366d6" }}>

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                                    <div>
                                                        <strong style={{ fontSize: "16px", display: "block" }}>{ib.book.title}</strong>
                                                        <span style={{ fontSize: "13px", color: "#586069" }}>by {ib.book.author}</span>
                                                    </div>
                                                    <button onClick={() => returnBook(ib.issuedBook.id)} style={{ ...btnSuccess, padding: "8px 16px" }}>
                                                        Collect Return
                                                    </button>
                                                </div>

                                                <div style={{ fontSize: "14px", color: "#24292e", display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f6f8fa", padding: "12px", borderRadius: "4px" }}>
                                                    <span><strong>Issued:</strong> {ib.issuedBook.issueDate}</span>
                                                    <span><strong>Due Date:</strong> {getDueDate(ib.issuedBook.issueDate)}</span>

                                                    <div style={{ gridColumn: "span 2", marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #d1d5da", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <span style={{ fontSize: "15px" }}>Current Fine: <strong style={{ color: ib.issuedBook.fine > 0 ? "#cb2431" : "#28a745" }}>₹{ib.issuedBook.fine}</strong></span>
                                                        <button onClick={() => editFine(ib.issuedBook.id, ib.issuedBook.fine)} style={{ background: "none", border: "none", color: "#0366d6", cursor: "pointer", textDecoration: "underline", padding: 0, fontWeight: "600" }}>
                                                            Edit/Waive
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Returned History */}
                                <h3 style={{ margin: "0 0 15px 0", borderBottom: "1px solid #eaecef", paddingBottom: "10px", color: "#24292e" }}>
                                    Return History ({returned.length})
                                </h3>

                                {returned.length === 0 ? <p style={{ color: "#586069", fontSize: "14px" }}>No past returns processed.</p> : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {returned.map(ib => (
                                            <div key={ib.issuedBook.id} style={{ padding: "12px 15px", background: "#fafbfc", border: "1px solid #e1e4e8", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <strong style={{ fontSize: "14px", color: "#24292e", display: "block" }}>{ib.book.title}</strong>
                                                    <span style={{ fontSize: "12px", color: "#586069" }}>Returned: {ib.issuedBook.returnDate}</span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: "600", display: "block", color: ib.issuedBook.fine > 0 ? "#cb2431" : "#586069" }}>Final Fine: ₹{ib.issuedBook.fine}</span>
                                                    <button onClick={() => editFine(ib.issuedBook.id, ib.issuedBook.fine)} style={{ background: "none", border: "none", color: "#0366d6", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "12px" }}>Modify Fine</button>
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