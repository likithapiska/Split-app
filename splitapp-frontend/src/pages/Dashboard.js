import React, { useEffect, useState } from "react";
import API from "../api/api";

function Dashboard() {

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState({});

  // USERS
  const [addUserName, setAddUserName] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");

  // ================= STYLES =================

  const cardStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginBottom: "10px",
    fontSize: "15px",
  };

  const buttonStyle = {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  // ================= FETCH GROUPS =================

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ================= FETCH EXPENSES =================

  const fetchExpenses = async (groupId) => {
    try {
      const res = await API.get(`/expenses/${groupId}`);
      setExpenses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH BALANCE =================

  const fetchBalance = async (groupId) => {
    try {
      const res = await API.get(`/expenses/balance/${groupId}`);
      setBalance(res.data || {});
    } catch (err) {
      console.log(err);
    }
  };

  // ================= GROUP CLICK =================

  const handleGroupClick = (g) => {
    setSelectedGroup(g);

    const id = g._id || g.id;

    fetchExpenses(id);
    fetchBalance(id);
  };

  // ================= ADD EXPENSE =================

 const addExpense = async () => {
  try {

    const id = selectedGroup?._id;

    if (!id) {
      return alert("Please select a group");
    }

    if (!title.trim()) {
      return alert("Enter expense title");
    }

    if (!amount || Number(amount) <= 0) {
      return alert("Enter valid amount");
    }

    if (!paidBy) {
      return alert("Select who paid");
    }

    const members = selectedGroup.members.map(
      (m) => m.userId?._id || m.userId
    );

    await API.post("/expenses", {
      groupId: id,
      title: title.trim(),
      amount: Number(amount),
      paidBy,
      members,
    });

    // CLEAR INPUTS
    setTitle("");
    setAmount("");
    setPaidBy("");

    // REFRESH
    await fetchExpenses(id);
    await fetchBalance(id);

    alert("Expense Added ✅");

  } catch (err) {

    console.log("ADD EXPENSE ERROR:", err);

    alert(
      err.response?.data?.message ||
      "Failed to add expense"
    );
  }
};
   

  // ================= DELETE EXPENSE =================

  const deleteExpense = async (expenseId) => {
    try {
      const id = selectedGroup._id;

      await API.delete(`/expenses/${expenseId}`);

      fetchExpenses(id);
      fetchBalance(id);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= USER NAME =================

  const getUserName = (userId) => {
    const user = selectedGroup?.members?.find(
      (m) =>
        String(m.userId?._id || m.userId) === String(userId)
    );

    return user?.name || "User";
  };

  // ================= SETTLEMENT =================

  const calculateSettlements = () => {

    const creditors = [];
    const debtors = [];

    Object.entries(balance || {}).forEach(([id, amt]) => {

      if (amt > 0) {
        creditors.push({ id, amt });
      }

      else if (amt < 0) {
        debtors.push({ id, amt: -amt });
      }
    });

    const result = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {

      const d = debtors[i];
      const c = creditors[j];

      const x = Math.min(d.amt, c.amt);

      result.push({
        from: d.id,
        to: c.id,
        amount: x,
      });

      d.amt -= x;
      c.amt -= x;

      if (d.amt === 0) i++;
      if (c.amt === 0) j++;
    }

    return result;
  };

  // ================= ADD USER =================

  const addUser = async () => {
    try {

      const id = selectedGroup._id;

      await API.post(`/groups/${id}/member`, {
        name: addUserName,
      });

      setAddUserName("");

      fetchGroups();

      const updated = await API.get("/groups");

      const newSelected = updated.data.find(
        (g) => g._id === selectedGroup._id
      );

      setSelectedGroup(newSelected);

    } catch (err) {
      console.log(err);
      alert("Failed to add user");
    }
  };

  // ================= UPDATE USER =================

  const updateUser = async () => {
    try {

      const id = selectedGroup._id;

      await API.put(`/groups/${id}/member`, {
        userId: editingUser,
        name: editName,
      });

      setEditingUser(null);
      setEditName("");

      const updated = await API.get("/groups");

      setGroups(updated.data);

      const newSelected = updated.data.find(
        (g) => g._id === selectedGroup._id
      );

      setSelectedGroup(newSelected);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to right, #eef2ff, #fdf2f8)",
        padding: "25px",
        fontFamily: "Arial",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          ...cardStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#4f46e5", margin: 0 }}>
            💸 Split App
          </h1>

          <p style={{ color: "gray" }}>
            Split expenses 
          </p>
        </div>

        <button
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>

      {/* GROUPS */}

      <div style={{ ...cardStyle, marginTop: "20px" }}>

        <h2 style={{ color: "#4f46e5" }}>
          👥 Your Groups
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {groups.map((g) => (
            <button
              key={g._id}
              onClick={() => handleGroupClick(g)}
              style={{
                background:
                  selectedGroup?._id === g._id
                    ? "#4f46e5"
                    : "#eef2ff",

                color:
                  selectedGroup?._id === g._id
                    ? "white"
                    : "#4f46e5",

                border: "none",
                padding: "10px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {!selectedGroup && (
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            color: "gray",
            fontSize: "20px",
          }}
        >
          👈 Select a group
        </div>
      )}

      {selectedGroup && (
        <>

          {/* MEMBERS */}

          <div style={{ ...cardStyle, marginTop: "20px" }}>

            <h2 style={{ color: "#4f46e5" }}>
              👥 Members
            </h2>

            {selectedGroup.members.map((m) => (
              <div
                key={m.userId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  background: "#f9fafb",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                <span>{m.name}</span>

                <button
                  onClick={() => {
                    setEditingUser(m.userId);
                    setEditName(m.name);
                  }}
                  style={{
                    border: "none",
                    background: "#4f46e5",
                    color: "white",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  ✏️
                </button>
              </div>
            ))}

            <input
              placeholder="Add new member"
              value={addUserName}
              onChange={(e) =>
                setAddUserName(e.target.value)
              }
              style={inputStyle}
            />

            <button
              onClick={addUser}
              style={buttonStyle}
            >
              Add User
            </button>

            {editingUser && (
              <div style={{ marginTop: "15px" }}>

                <input
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  style={inputStyle}
                />

                <button
                  onClick={updateUser}
                  style={buttonStyle}
                >
                  Save Name
                </button>
              </div>
            )}
          </div>

          {/* ADD EXPENSE */}

          <div style={{ ...cardStyle, marginTop: "20px" }}>

            <h2 style={{ color: "#4f46e5" }}>
              ➕ Add Expense
            </h2>

            <input
              placeholder="Expense Title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              style={inputStyle}
            />

            <input
              placeholder="Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              style={inputStyle}
            />

            <select
              value={paidBy}
              onChange={(e) =>
                setPaidBy(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Who paid?
              </option>

              {selectedGroup.members.map((m) => (
                <option
                  key={m.userId}
                  value={m.userId}
                >
                  {m.name}
                </option>
              ))}
            </select>

            <button
              onClick={addExpense}
              style={buttonStyle}
            >
              Add Expense
            </button>
          </div>

          {/* CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >

            {/* EXPENSES */}

            <div style={cardStyle}>

              <h2 style={{ color: "#4f46e5" }}>
                💸 Expenses
              </h2>

              {expenses.map((e) => (
                <div
                  key={e._id}
                  style={{
                    background: "#f9fafb",
                    padding: "12px",
                    borderRadius: "12px",
                    marginBottom: "10px",

                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong>{e.title}</strong>

                    <p style={{ margin: 0, color: "gray" }}>
                      Paid by {getUserName(e.paidBy)}
                    </p>
                  </div>

                  <div>
                    <strong>₹{e.amount}</strong>

                    <button
                      onClick={() =>
                        deleteExpense(e._id)
                      }
                      style={{
                        marginLeft: "10px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BALANCE */}

          

<div style={cardStyle}>

  <h2 style={{ color: "#4f46e5" }}>
    ⚖️ Balance
  </h2>

  {Object.entries(balance).map(([id, amt]) => {

    // FIX FLOATING VALUES
    const fixedAmt =
      Math.abs(amt) < 0.01 ? 0 : amt;

    return (
      <div
        key={id}
        style={{
          background:
            fixedAmt >= 0
              ? "#dcfce7"
              : "#fee2e2",

          padding: "12px",
          borderRadius: "12px",
          marginBottom: "10px",

          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <strong>
          {getUserName(id)}
        </strong>

        <strong
          style={{
            color:
              fixedAmt >= 0
                ? "green"
                : "red",
          }}
        >
          ₹{fixedAmt.toFixed(2)}
        </strong>
      </div>
    );
  })}
</div>
            {/* SETTLEMENT */}

            <div style={cardStyle}>

              <h2 style={{ color: "#4f46e5" }}>
                🤝 Settlement
              </h2>

              {calculateSettlements().map(
                (s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#eef2ff",
                      padding: "12px",
                      borderRadius: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>
                      {getUserName(s.from)}
                    </strong>

                    <span> pays </span>

                    <strong>
                      {getUserName(s.to)}
                    </strong>

                    <span>
                      {" "}
                      ₹{s.amount}
                    </span>
                  </div>
                )
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;