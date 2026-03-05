import { useState, useRef, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const STOCKS = [
  { id: 1, name: "Reliance Industries", ticker: "RELIANCE", qty: 10, avg: 2450, ltp: 2891, sector: "Energy" },
  { id: 2, name: "TCS", ticker: "TCS", qty: 5, avg: 3200, ltp: 3654, sector: "IT" },
  { id: 3, name: "HDFC Bank", ticker: "HDFCBANK", qty: 15, avg: 1580, ltp: 1723, sector: "Banking" },
  { id: 4, name: "Infosys", ticker: "INFY", qty: 8, avg: 1420, ltp: 1389, sector: "IT" },
  { id: 5, name: "Wipro", ticker: "WIPRO", qty: 20, avg: 420, ltp: 467, sector: "IT" },
];
const MF = [
  { id: 1, name: "Mirae Asset Large Cap", invested: 50000, current: 68400, returns: 36.8, type: "Equity" },
  { id: 2, name: "Axis Bluechip Fund", invested: 30000, current: 38900, returns: 29.7, type: "Equity" },
  { id: 3, name: "HDFC Short Term Debt", invested: 20000, current: 22100, returns: 10.5, type: "Debt" },
  { id: 4, name: "Parag Parikh Flexi Cap", invested: 40000, current: 57600, returns: 44.0, type: "Equity" },
];
const GOALS = [
  { id: 1, name: "Emergency Fund", icon: "🛡️", target: 300000, current: 185000, deadline: "Dec 2026", color: "#38bdf8" },
  { id: 2, name: "New Car", icon: "🚗", target: 800000, current: 320000, deadline: "Jun 2027", color: "#fb923c" },
  { id: 3, name: "Europe Trip", icon: "✈️", target: 150000, current: 89000, deadline: "Mar 2026", color: "#a78bfa" },
  { id: 4, name: "House Down Payment", icon: "🏠", target: 2000000, current: 450000, deadline: "Jan 2029", color: "#4ade80" },
];
const TRANSACTIONS = [
  { id: 1, type: "credit", title: "Salary - Google", amount: 125000, date: "Mar 01", cat: "💼" },
  { id: 2, type: "debit", title: "Zomato", amount: 850, date: "Mar 02", cat: "🍔" },
  { id: 3, type: "debit", title: "Uber", amount: 340, date: "Mar 02", cat: "🚗" },
  { id: 4, type: "credit", title: "Freelance - Design", amount: 18000, date: "Mar 03", cat: "💻" },
  { id: 5, type: "debit", title: "HDFC Credit Card Bill", amount: 24500, date: "Mar 04", cat: "💳" },
];
const NET_WORTH_HISTORY = [
  { month: "Sep", value: 1240000 }, { month: "Oct", value: 1310000 },
  { month: "Nov", value: 1290000 }, { month: "Dec", value: 1380000 },
  { month: "Jan", value: 1420000 }, { month: "Feb", value: 1510000 },
  { month: "Mar", value: 1624800 },
];
const BUDGET = [
  { cat: "Food", icon: "🍔", budget: 15000, spent: 11200, color: "#f87171" },
  { cat: "Transport", icon: "🚗", budget: 8000, spent: 5400, color: "#fb923c" },
  { cat: "Shopping", icon: "🛍️", budget: 10000, spent: 12300, color: "#fbbf24" },
  { cat: "Bills", icon: "📋", budget: 25000, spent: 24500, color: "#60a5fa" },
  { cat: "Fun", icon: "🎬", budget: 3000, spent: 1100, color: "#a78bfa" },
  { cat: "Health", icon: "💊", budget: 5000, spent: 1800, color: "#34d399" },
];

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
const CORRECT_OTP = "123456";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{display:none}
  .card{background:#0c1520;border:1px solid #162032;border-radius:20px}
  .tab-bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#080f18;border-top:1px solid #162032;display:flex;z-index:100;padding:8px 0 14px}
  .tab-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:6px 0}
  .pill{display:inline-flex;align-items:center;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);border-radius:20px;padding:3px 10px;font-size:11px;color:#38bdf8;font-weight:600}
  .pill.green{background:rgba(74,222,128,0.1);border-color:rgba(74,222,128,0.2);color:#4ade80}
  .pill.red{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.2);color:#f87171}
  .trow{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #0d1b2a}
  .trow:last-child{border:none}
  .pbar{height:6px;border-radius:3px;background:#162032;overflow:hidden}
  .pfill{height:100%;border-radius:3px}
  .stitle{font-size:11px;color:#4a6080;letter-spacing:.15em;text-transform:uppercase;font-weight:700;margin-bottom:14px}
  .srow{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;transition:background .15s}
  .srow:hover{background:#0d1b2a}
  .btn-primary{background:linear-gradient(135deg,#0ea5e9,#2563eb);color:white;border:none;border-radius:14px;padding:16px;font-size:15px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;width:100%;box-shadow:0 4px 20px rgba(14,165,233,0.3);transition:all .2s}
  .btn-primary:disabled{opacity:.45;cursor:not-allowed}
  .btn-primary:not(:disabled):active{transform:scale(0.98)}
  .otp-box{background:#0c1520;border:2px solid #162032;color:#f1f5f9;border-radius:14px;width:48px;height:58px;text-align:center;font-size:26px;font-weight:800;font-family:'Bricolage Grotesque',sans-serif;outline:none;transition:border .2s,box-shadow .2s;caret-color:#38bdf8}
  .otp-box:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,0.15)}
  .otp-box.ok{border-color:#38bdf8}
  .otp-box.err{border-color:#f87171;box-shadow:0 0 0 3px rgba(248,113,113,0.12)}
  .phone-inp{background:#0c1520;border:2px solid #162032;color:#f1f5f9;border-radius:14px;padding:16px;font-size:20px;font-weight:600;font-family:'Bricolage Grotesque',sans-serif;outline:none;width:100%;transition:border .2s,box-shadow .2s;letter-spacing:2px}
  .phone-inp:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,0.15)}
  .phone-inp::placeholder{color:#1e3a5f;letter-spacing:1px;font-size:16px;font-weight:400}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fu{animation:fadeUp .45s ease both}
  .fi{animation:fadeIn .3s ease both}
  .shake{animation:shake .4s ease}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
`;

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("phone"); // phone | otp | app
  const [phone, setPhone] = useState("");

  return (
    <>
      <style>{CSS}</style>
      {screen === "phone" && <PhoneScreen phone={phone} setPhone={setPhone} onNext={() => setScreen("otp")} />}
      {screen === "otp"   && <OTPScreen phone={phone} onBack={() => setScreen("phone")} onSuccess={() => setScreen("app")} />}
      {screen === "app"   && <MainApp />}
    </>
  );
}

// ── PHONE SCREEN ─────────────────────────────────────────────────────────────
function PhoneScreen({ phone, setPhone, onNext }) {
  const valid = phone.length === 10;
  return (
    <div style={{ background: "#050a0f", minHeight: "100vh", maxWidth: 430, margin: "0 auto", padding: "0 24px", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)", width: 350, height: 350, background: "radial-gradient(circle,rgba(14,165,233,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div className="fu" style={{ paddingTop: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg,#0ea5e9,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 26, fontWeight: 800, color: "white", boxShadow: "0 8px 24px rgba(14,165,233,0.35)" }}>W</div>
        <div>
          <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>WealthOS</div>
          <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700 }}>Smart Finance</div>
        </div>
      </div>

      {/* Headline */}
      <div className="fu" style={{ marginTop: 44, animationDelay: ".08s" }}>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 32, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2 }}>Your money,<br /><span style={{ color: "#38bdf8" }}>smarter.</span></div>
        <div style={{ fontSize: 14, color: "#4a6080", marginTop: 12, lineHeight: 1.75 }}>Track stocks, MFs, budgets & goals — all in one place.</div>
      </div>

      {/* Feature pills */}
      <div className="fu" style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, animationDelay: ".16s" }}>
        {["📈  Real-time stock & MF portfolio", "🎯  Smart budget tracking", "🚀  Goal-based savings planner"].map(f => (
          <div key={f} style={{ background: "#0c1520", border: "1px solid #162032", borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#94a3b8" }}>{f}</div>
        ))}
      </div>

      {/* Phone input */}
      <div className="fu" style={{ marginTop: 36, animationDelay: ".24s" }}>
        <div style={{ fontSize: 11, color: "#4a6080", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Enter your mobile number</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "#0c1520", border: "2px solid #162032", borderRadius: 14, padding: "16px 14px", fontSize: 18, fontWeight: 700, color: "#4a6080", fontFamily: "'Bricolage Grotesque',sans-serif", flexShrink: 0 }}>+91</div>
          <input className="phone-inp" type="tel" maxLength={10} placeholder="98765 43210"
            value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            onKeyDown={e => e.key === "Enter" && valid && onNext()} />
        </div>
        <div style={{ fontSize: 12, color: "#1e3a5f", marginTop: 8 }}>We'll send a 6-digit OTP to verify</div>
      </div>

      <div className="fu" style={{ marginTop: 20, animationDelay: ".3s" }}>
        <button className="btn-primary" disabled={!valid} onClick={onNext}>Send OTP →</button>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ textAlign: "center", paddingBottom: 32, fontSize: 11, color: "#1e3a5f" }}>By continuing you agree to our Terms & Privacy Policy</div>
    </div>
  );
}

// ── OTP SCREEN ───────────────────────────────────────────────────────────────
function OTPScreen({ phone, onBack, onSuccess }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(30);
  const [shakeKey, setShakeKey] = useState(0);
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const verify = (code) => {
    setVerifying(true);
    setTimeout(() => {
      if (code === CORRECT_OTP) { onSuccess(); }
      else {
        setError(true); setVerifying(false);
        setShakeKey(k => k + 1);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => refs.current[0]?.focus(), 30);
      }
    }, 900);
  };

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next); setError(false);
    if (val && i < 5) refs.current[i + 1]?.focus();
    const full = next.join("");
    if (full.length === 6 && next.every(d => d)) verify(full);
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...otp]; next[i - 1] = ""; setOtp(next);
    }
  };

  const handlePaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setOtp(p.split("")); refs.current[5]?.focus(); setTimeout(() => verify(p), 80); }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div style={{ background: "#050a0f", minHeight: "100vh", maxWidth: 430, margin: "0 auto", padding: "0 24px", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)", width: 350, height: 350, background: "radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div className="fu" style={{ paddingTop: 52 }}>
        <button onClick={onBack} style={{ background: "#0c1520", border: "1px solid #162032", color: "#94a3b8", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>← Back</button>
      </div>

      <div className="fu" style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", animationDelay: ".08s" }}>
        <div style={{ width: 76, height: 76, borderRadius: 24, background: "linear-gradient(135deg,#0c2a4a,#0f3460)", border: "1px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, boxShadow: "0 8px 30px rgba(14,165,233,0.15)", marginBottom: 22 }}>📱</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9", textAlign: "center" }}>Verify your number</div>
        <div style={{ fontSize: 14, color: "#4a6080", marginTop: 10, textAlign: "center", lineHeight: 1.7 }}>OTP sent to <span style={{ color: "#38bdf8", fontWeight: 700 }}>+91 {phone.slice(0,5)} {phone.slice(5)}</span></div>
        <div style={{ marginTop: 10, background: "#0c1520", border: "1px solid #162032", borderRadius: 10, padding: "6px 14px", fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
          💡 Use <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: 2 }}>123456</span> to login
        </div>
      </div>

      {/* OTP boxes */}
      <div key={shakeKey} className={`fu ${error ? "shake" : ""}`} style={{ marginTop: 40, display: "flex", gap: 9, justifyContent: "center", animationDelay: ".16s" }} onPaste={handlePaste}>
        {otp.map((d, i) => (
          <input key={i} ref={el => refs.current[i] = el}
            className={`otp-box ${d ? "ok" : ""} ${error ? "err" : ""}`}
            type="tel" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)} />
        ))}
      </div>

      {error && <div className="fi" style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#f87171", fontWeight: 600 }}>❌ Incorrect OTP. Please try again.</div>}

      {/* Progress */}
      <div className="fu" style={{ marginTop: 20, animationDelay: ".22s" }}>
        <div className="pbar" style={{ height: 4 }}>
          <div className="pfill" style={{ width: `${(filled / 6) * 100}%`, background: error ? "#f87171" : "linear-gradient(to right,#0ea5e9,#2563eb)", transition: "width .2s" }} />
        </div>
        <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#1e3a5f" }}>{filled}/6 digits entered</div>
      </div>

      <div className="fu" style={{ marginTop: 20, animationDelay: ".28s" }}>
        <button className="btn-primary" disabled={filled < 6 || verifying} onClick={() => verify(otp.join(""))}>
          {verifying ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span className="spinner" /> Verifying...</span> : "Verify & Login →"}
        </button>
      </div>

      <div className="fu" style={{ marginTop: 20, textAlign: "center", animationDelay: ".32s" }}>
        {timer > 0
          ? <span style={{ fontSize: 13, color: "#1e3a5f" }}>Resend in <span style={{ color: "#38bdf8", fontWeight: 700 }}>{timer}s</span></span>
          : <button onClick={() => { setTimer(30); setOtp(["","","","","",""]); setTimeout(() => refs.current[0]?.focus(), 30); }} style={{ background: "none", border: "none", color: "#38bdf8", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Resend OTP</button>}
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp() {
  const [tab, setTab] = useState("home");
  const stockValue = STOCKS.reduce((s, st) => s + st.qty * st.ltp, 0);
  const stockInvested = STOCKS.reduce((s, st) => s + st.qty * st.avg, 0);
  const mfValue = MF.reduce((s, m) => s + m.current, 0);
  const mfInvested = MF.reduce((s, m) => s + m.invested, 0);
  const netWorth = stockValue + mfValue + 284500;

  const tabs = [
    { id: "home", icon: "⬡", label: "Home" },
    { id: "stocks", icon: "📈", label: "Stocks" },
    { id: "mf", icon: "🏦", label: "MF" },
    { id: "budget", icon: "🎯", label: "Budget" },
    { id: "goals", icon: "🚀", label: "Goals" },
  ];

  return (
    <div style={{ background: "#050a0f", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#e8edf2", maxWidth: 430, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#0ea5e9,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 800, color: "white" }}>W</div>
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>WealthOS</div>
            <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700 }}>Pro Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0c1520", border: "1px solid #162032", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>🔔</div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0f3460,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#38bdf8" }}>V</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }} className="fu">
        {tab === "home"   && <HomePage netWorth={netWorth} stockValue={stockValue} mfValue={mfValue} bankBalance={284500} />}
        {tab === "stocks" && <StocksPage stockValue={stockValue} stockInvested={stockInvested} />}
        {tab === "mf"     && <MFPage mfValue={mfValue} mfInvested={mfInvested} />}
        {tab === "budget" && <BudgetPage />}
        {tab === "goals"  && <GoalsPage />}
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <div key={t.id} className="tab-item" onClick={() => setTab(t.id)}>
            <div style={{ fontSize: 18, opacity: tab === t.id ? 1 : 0.35 }}>{t.icon}</div>
            <div style={{ fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 700, color: tab === t.id ? "#38bdf8" : "#4a6080" }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontSize: 14, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 15, color }}>{fmtShort(value)}</div>
      <div style={{ fontSize: 9, color: "#4a6080", marginTop: 2, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
    </div>
  );
}

function HomePage({ netWorth, stockValue, mfValue, bankBalance }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2144,#091428)", border: "1px solid #162032", borderRadius: 24, padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 10, color: "#4a6080", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Total Net Worth</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 40, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1.5px", marginBottom: 8 }}>{fmtShort(netWorth)}</div>
        <span className="pill green">↑ +8.2% this month</span>
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <StatCard label="Stocks" value={stockValue} color="#38bdf8" icon="📈" />
          <StatCard label="MF" value={mfValue} color="#a78bfa" icon="🏦" />
          <StatCard label="Bank" value={bankBalance} color="#4ade80" icon="🏛️" />
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">Net Worth Trend</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={NET_WORTH_HISTORY}>
            <defs>
              <linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "#4a6080", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#0c1520", border: "1px solid #162032", borderRadius: 10, fontSize: 12 }} formatter={v => [fmtShort(v), "Net Worth"]} />
            <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="url(#nwg)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="stitle">Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[["💸","Send"],["📥","Receive"],["📊","Invest"],["🧾","Pay Bill"]].map(([icon, label]) => (
            <div key={label} style={{ background: "#0c1520", border: "1px solid #162032", borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="stitle" style={{ margin: 0 }}>Recent Transactions</div>
          <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600, cursor: "pointer" }}>See all →</span>
        </div>
        {TRANSACTIONS.map(t => (
          <div key={t.id} className="trow">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: t.type === "credit" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{t.cat}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e8edf2" }}>{t.title}</div>
              <div style={{ fontSize: 11, color: "#4a6080", marginTop: 2 }}>{t.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.type === "credit" ? "#4ade80" : "#f87171" }}>{t.type === "credit" ? "+" : "-"}{fmtShort(t.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StocksPage({ stockValue, stockInvested }) {
  const gl = stockValue - stockInvested;
  const pct = ((gl / stockInvested) * 100).toFixed(1);
  const sectorData = useMemo(() => Object.entries(STOCKS.reduce((m, s) => { m[s.sector] = (m[s.sector] || 0) + s.qty * s.ltp; return m; }, {})).map(([name, value]) => ({ name, value })), []);
  const COLORS = ["#38bdf8", "#a78bfa", "#4ade80", "#fb923c", "#f87171"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1628,#0d1f3c)", border: "1px solid #162032", borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#4a6080", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Stock Portfolio</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 34, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1px" }}>{fmtShort(stockValue)}</div>
        <div style={{ marginTop: 10 }}><span className={`pill ${gl >= 0 ? "green" : "red"}`}>{gl >= 0 ? "↑" : "↓"} {fmt(Math.abs(gl))} ({pct}%)</span></div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">Sector Allocation</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart><Pie data={sectorData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>{sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            {sectorData.map((s, i) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                <div style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>{s.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e8edf2" }}>{fmtShort(s.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">Holdings ({STOCKS.length})</div>
        {STOCKS.map(s => {
          const sgl = s.qty * s.ltp - s.qty * s.avg;
          const sgp = ((sgl / (s.qty * s.avg)) * 100).toFixed(1);
          return (
            <div key={s.id} className="srow">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#162032", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#38bdf8", flexShrink: 0, letterSpacing: "-.5px" }}>{s.ticker.slice(0,4)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#4a6080", marginTop: 2 }}>{s.qty} shares · Avg {fmt(s.avg)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e8edf2" }}>{fmtShort(s.qty * s.ltp)}</div>
                <div style={{ fontSize: 11, color: sgl >= 0 ? "#4ade80" : "#f87171", fontWeight: 700, marginTop: 2 }}>{sgl >= 0 ? "+" : ""}{sgp}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MFPage({ mfValue, mfInvested }) {
  const pct = (((mfValue - mfInvested) / mfInvested) * 100).toFixed(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#0f0a28,#1a0d3c)", border: "1px solid #1e1642", borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#6a5080", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Mutual Fund Portfolio</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 34, fontWeight: 800, color: "#f1f5f9" }}>{fmtShort(mfValue)}</div>
        <span className="pill" style={{ marginTop: 10, display: "inline-flex", background: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.3)", color: "#a78bfa" }}>↑ +{pct}% overall</span>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">SIP Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["₹15,000","Monthly SIP","#a78bfa"],["3 Active","Total SIPs","#4ade80"],["Apr 10","Next SIP","#38bdf8"],["28.4%","XIRR","#fb923c"]].map(([val, label, color]) => (
            <div key={label} style={{ background: "#080f18", borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, color }}>{val}</div>
              <div style={{ fontSize: 10, color: "#4a6080", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">Your Funds</div>
        {MF.map(f => (
          <div key={f.id} className="trow">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(167,139,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              <span style={{ fontSize: 10, background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderRadius: 6, padding: "2px 7px", fontWeight: 700, marginTop: 4, display: "inline-block" }}>{f.type}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8edf2" }}>{fmtShort(f.current)}</div>
              <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, marginTop: 2 }}>+{f.returns}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetPage() {
  const total = BUDGET.reduce((s, b) => s + b.budget, 0);
  const spent = BUDGET.reduce((s, b) => s + b.spent, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1f10,#0d2a18)", border: "1px solid #0f3020", borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#4a6060", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>March 2026 Budget</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 34, fontWeight: 800, color: "#f1f5f9" }}>{fmtShort(spent)} <span style={{ fontSize: 18, color: "#4a6080", fontWeight: 600 }}>/ {fmtShort(total)}</span></div>
        <div style={{ marginTop: 14 }}>
          <div className="pbar" style={{ height: 8 }}>
            <div className="pfill" style={{ width: `${(spent / total) * 100}%`, background: "linear-gradient(to right,#4ade80,#22c55e)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{fmtShort(total - spent)} remaining</span>
            <span style={{ fontSize: 12, color: "#4a6080" }}>{Math.round((spent / total) * 100)}% used</span>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">By Category</div>
        {BUDGET.map(b => {
          const over = b.spent > b.budget;
          return (
            <div key={b.cat} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{b.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e8edf2" }}>{b.cat}</span>
                  {over && <span className="pill red" style={{ fontSize: 9, padding: "2px 6px" }}>Over</span>}
                </div>
                <span style={{ fontSize: 12, color: over ? "#f87171" : "#94a3b8", fontWeight: 600 }}>{fmtShort(b.spent)}/{fmtShort(b.budget)}</span>
              </div>
              <div className="pbar"><div className="pfill" style={{ width: `${Math.min((b.spent / b.budget) * 100, 100)}%`, background: over ? "#f87171" : b.color }} /></div>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="stitle">Spending vs Budget</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={BUDGET} margin={{ left: -20 }}>
            <XAxis dataKey="cat" tick={{ fill: "#4a6080", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#0c1520", border: "1px solid #162032", borderRadius: 10, fontSize: 11 }} formatter={(v, n) => [fmtShort(v), n]} />
            <Bar dataKey="budget" fill="#162032" radius={[4,4,0,0]} name="Budget" />
            <Bar dataKey="spent" radius={[4,4,0,0]} name="Spent">{BUDGET.map((b, i) => <Cell key={i} fill={b.spent > b.budget ? "#f87171" : b.color} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GoalsPage() {
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  const totalSaved = GOALS.reduce((s, g) => s + g.current, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#0a1020,#10142e)", border: "1px solid #1a1e40", borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 10, color: "#4a4a80", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Financial Goals</div>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 34, fontWeight: 800, color: "#f1f5f9" }}>{fmtShort(totalSaved)}</div>
        <div style={{ fontSize: 13, color: "#4a4a80", marginTop: 4 }}>saved towards {fmtShort(totalTarget)} total target</div>
        <div style={{ marginTop: 12 }}>
          <div className="pbar" style={{ height: 8 }}>
            <div className="pfill" style={{ width: `${(totalSaved / totalTarget) * 100}%`, background: "linear-gradient(to right,#a78bfa,#7c3aed)" }} />
          </div>
        </div>
      </div>
      {GOALS.map(g => {
        const pct = Math.round((g.current / g.target) * 100);
        return (
          <div key={g.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${g.color}15`, border: `1px solid ${g.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{g.name}</div>
                  <span className="pill" style={{ background: `${g.color}18`, borderColor: `${g.color}35`, color: g.color }}>{pct}%</span>
                </div>
                <div style={{ fontSize: 12, color: "#4a6080", marginTop: 4 }}>Target by {g.deadline}</div>
                <div style={{ marginTop: 12 }}>
                  <div className="pbar"><div className="pfill" style={{ width: `${pct}%`, background: `linear-gradient(to right,${g.color}88,${g.color})` }} /></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: g.color }}>{fmtShort(g.current)} saved</span>
                  <span style={{ fontSize: 12, color: "#4a6080" }}>{fmtShort(g.target - g.current)} to go</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <button className="btn-primary">+ Add New Goal</button>
    </div>
  );
}
