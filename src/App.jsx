import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const CATEGORIES = {
  income: [
    { id: "salary", label: "Salary", icon: "💼" },
    { id: "freelance", label: "Freelance", icon: "💻" },
    { id: "investment", label: "Investment", icon: "📈" },
    { id: "gift", label: "Gift", icon: "🎁" },
  ],
  expense: [
    { id: "food", label: "Food", icon: "🍔" },
    { id: "transport", label: "Transport", icon: "🚗" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "bills", label: "Bills", icon: "📋" },
    { id: "health", label: "Health", icon: "💊" },
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "other", label: "Other", icon: "📦" },
  ],
};

const CAT_COLORS = {
  salary: "#4ade80", freelance: "#34d399", investment: "#6ee7b7", gift: "#a7f3d0",
  food: "#f87171", transport: "#fb923c", shopping: "#fbbf24", bills: "#60a5fa",
  health: "#e879f9", entertainment: "#818cf8", education: "#38bdf8", other: "#94a3b8",
};

const INITIAL_TRANSACTIONS = [
  { id: 1, type: "income", category: "salary", amount: 5000, note: "Monthly salary", date: "2026-03-01" },
  { id: 2, type: "expense", category: "food", amount: 120, note: "Groceries", date: "2026-03-02" },
  { id: 3, type: "expense", category: "transport", amount: 45, note: "Uber rides", date: "2026-03-02" },
  { id: 4, type: "income", category: "freelance", amount: 800, note: "Design project", date: "2026-03-03" },
  { id: 5, type: "expense", category: "bills", amount: 200, note: "Electricity bill", date: "2026-03-03" },
  { id: 6, type: "expense", category: "entertainment", amount: 60, note: "Netflix + Spotify", date: "2026-03-04" },
  { id: 7, type: "expense", category: "shopping", amount: 340, note: "New shoes", date: "2026-03-04" },
];

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "expense", category: "food", amount: "", note: "", date: new Date().toISOString().slice(0, 10) });
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([cat, val]) => ({
      name: CATEGORIES.expense.find(c => c.id === cat)?.label || cat,
      value: val, color: CAT_COLORS[cat] || "#94a3b8", cat,
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const areaData = useMemo(() => {
    const days = {};
    [...transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
      if (!days[t.date]) days[t.date] = { date: t.date, income: 0, expense: 0 };
      days[t.date][t.type] += t.amount;
    });
    let running = 0;
    return Object.values(days).map(d => {
      running += d.income - d.expense;
      return { date: d.date.slice(5), balance: running, income: d.income, expense: d.expense };
    });
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => filter === "all" || t.type === filter).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [transactions, filter]);

  const handleAdd = () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return;
    setTransactions(prev => [...prev, { id: Date.now(), ...form, amount: Number(form.amount) }]);
    setForm({ type: "expense", category: "food", amount: "", note: "", date: new Date().toISOString().slice(0, 10) });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setDeleteId(null);
  };

  const getCatInfo = (type, cat) => {
    const list = type === "income" ? CATEGORIES.income : CATEGORIES.expense;
    return list.find(c => c.id === cat) || { label: cat, icon: "📦" };
  };

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#080c14", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Sora:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 18px; border-radius: 8px; transition: all 0.2s; color: #64748b; }
        .tab-btn.active { background: #0f3460; color: #38bdf8; }
        .tab-btn:hover:not(.active) { color: #94a3b8; background: #0d1b2a; }
        .card { background: #0d1b2a; border: 1px solid #1e3a5f; border-radius: 16px; }
        .stat-card { background: linear-gradient(135deg, #0d1b2a 0%, #0f2640 100%); border: 1px solid #1e3a5f; border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
        .add-btn { background: linear-gradient(135deg, #0ea5e9, #3b82f6); border: none; color: white; border-radius: 12px; padding: 12px 24px; cursor: pointer; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(14,165,233,0.3); }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14,165,233,0.4); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal { background: #0d1b2a; border: 1px solid #1e3a5f; border-radius: 20px; padding: 28px; width: 360px; max-width: 90vw; }
        .input { background: #080c14; border: 1px solid #1e3a5f; color: #e2e8f0; border-radius: 10px; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        .input:focus { border-color: #38bdf8; }
        .input option { background: #0d1b2a; }
        .tx-row { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; transition: background 0.15s; cursor: default; }
        .tx-row:hover { background: #0f2640; }
        .del-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; opacity: 0; transition: opacity 0.15s; padding: 4px; border-radius: 6px; }
        .tx-row:hover .del-btn { opacity: 1; }
        .type-toggle { display: flex; gap: 8px; margin-bottom: 16px; }
        .type-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #1e3a5f; background: #080c14; color: #64748b; font-family: 'DM Mono', monospace; font-size: 12px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em; }
        .type-btn.income.active { background: rgba(74,222,128,0.1); border-color: #4ade80; color: #4ade80; }
        .type-btn.expense.active { background: rgba(248,113,113,0.1); border-color: #f87171; color: #f87171; }
        .pill { background: #0f2640; border-radius: 20px; padding: 4px 10px; font-size: 11px; color: #38bdf8; }
        .confirm-modal { background: #0d1b2a; border: 1px solid #ef4444; border-radius: 16px; padding: 24px; width: 300px; text-align: center; }
        .danger-btn { background: #ef4444; border: none; color: white; border-radius: 10px; padding: 10px 24px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 13px; }
        .cancel-btn { background: #1e3a5f; border: none; color: #94a3b8; border-radius: 10px; padding: 10px 24px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 13px; }
      `}</style>

      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0ea5e9,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>₹</div>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>FinTrack</div>
            <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: "0.15em", textTransform: "uppercase" }}>Personal Finance</div>
          </div>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add</button>
      </div>

      <div style={{ padding: "16px 24px 0", display: "flex", gap: 4 }}>
        {["dashboard", "transactions", "analytics"].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "20px 24px 32px" }}>
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "linear-gradient(135deg, #0c2a4a 0%, #0f3460 50%, #1a1a4e 100%)", border: "1px solid #1e3a5f", borderRadius: 20, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Total Balance</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 44, fontWeight: 700, color: balance >= 0 ? "#4ade80" : "#f87171", letterSpacing: "-2px" }}>{fmt(balance)}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}><span style={{ color: "#4ade80" }}>↑ Savings Rate: {savingsRate}%</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="stat-card">
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Income</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#4ade80" }}>{fmt(totalIncome)}</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Expenses</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#f87171" }}>{fmt(totalExpense)}</div>
              </div>
            </div>
            {areaData.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Balance Trend</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #1e3a5f", borderRadius: 10, fontSize: 12 }} formatter={(v) => fmt(v)} />
                    <Area type="monotone" dataKey="balance" stroke="#38bdf8" fill="url(#balGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Recent</div>
              {transactions.slice(-5).reverse().map(t => {
                const cat = getCatInfo(t.type, t.category);
                return (
                  <div key={t.id} className="tx-row">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: t.type === "income" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'Sora', sans-serif" }}>{t.note || cat.label}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{cat.label} · {t.date}</div>
                    </div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: t.type === "income" ? "#4ade80" : "#f87171" }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["all", "income", "expense"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid", borderColor: filter === f ? "#38bdf8" : "#1e3a5f", background: filter === f ? "rgba(56,189,248,0.1)" : "transparent", color: filter === f ? "#38bdf8" : "#64748b", cursor: "pointer", fontFamily: "DM Mono", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{f}</button>
              ))}
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}><span className="pill">{filtered.length} entries</span></span>
            </div>
            <div className="card" style={{ padding: "8px 12px" }}>
              {filtered.map(t => {
                const cat = getCatInfo(t.type, t.category);
                return (
                  <div key={t.id} className="tx-row">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: t.type === "income" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'Sora', sans-serif" }}>{t.note || cat.label}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{cat.label} · {t.date}</div>
                    </div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: t.type === "income" ? "#4ade80" : "#f87171", marginRight: 4 }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </div>
                    <button className="del-btn" onClick={() => setDeleteId(t.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Spending Breakdown</div>
              {expenseByCategory.length === 0 ? (
                <div style={{ textAlign: "center", color: "#475569", padding: 24 }}>No expense data yet.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} strokeWidth={0}>
                        {expenseByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #1e3a5f", borderRadius: 10, fontSize: 12 }} formatter={(v) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    {expenseByCategory.map(e => (
                      <div key={e.cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{fmt(e.value)}</div>
                        <div style={{ fontSize: 11, color: "#475569", width: 36, textAlign: "right" }}>{Math.round((e.value / totalExpense) * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: "#f1f5f9", marginBottom: 20 }}>New Transaction</div>
            <div className="type-toggle">
              <button className={`type-btn expense ${form.type === "expense" ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, type: "expense", category: "food" }))}>↓ Expense</button>
              <button className={`type-btn income ${form.type === "income" ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, type: "income", category: "salary" }))}>↑ Income</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Amount</div>
                <input className="input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="0" />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Category</div>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {(form.type === "income" ? CATEGORIES.income : CATEGORIES.expense).map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Note</div>
                <input className="input" type="text" placeholder="Add a note..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} maxLength={60} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Date</div>
                <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", background: "#1e3a5f", border: "none", color: "#94a3b8", borderRadius: 10, cursor: "pointer", fontFamily: "DM Mono", fontSize: 13 }}>Cancel</button>
                <button className="add-btn" style={{ flex: 2 }} onClick={handleAdd}>Add Transaction</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Delete this transaction?</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="danger-btn" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
