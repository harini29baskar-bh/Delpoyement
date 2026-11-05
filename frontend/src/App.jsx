
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";

import {
  BookOpen,
  LayoutDashboard,
  Layers,
  Trophy,
  StickyNote,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Search,
  CheckCircle2,
  LockKeyhole,
  Menu,
  Flame, Target, Zap, TrendingUp, Bell, ChevronRight, PlayCircle,
  CalendarCheck, Activity, Users, Clock3, BookMarked, Settings,
  ChartNoAxesCombined, SearchCheck
} from "lucide-react";

import { api } from "./api";

const palette = { teal: "#168B83" };

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(x => setUser(x.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="center">Loading CodeZero…</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<AuthPage mode="login" onUser={setUser} />}
      />

      <Route
        path="/register"
        element={<AuthPage mode="register" />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route path="/activate" element={<TokenPage />} />

      <Route
        path="/reset-password"
        element={<TokenPage reset />}
      />

      <Route
        path="/*"
        element={
          user
            ? <Shell user={user} onUser={setUser} />
            : <Landing />
        }
      />
    </Routes>
  );
}

function Landing() {
  return (
    <div className="landing">
      <nav className="topnav">
        <b className="brand">V2<span>CodeZero</span></b>
        <div>
          <Link to="/login">Login</Link>
          <Link className="btn" to="/register">Get started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">YOUR DSA JOURNEY, STRUCTURED</div>

        <h1>
          Master DSA.
          <br />
          <em>Build Your SDE Career.</em>
        </h1>

        <p>
          A structured, phase-based DSA learning platform with 200 curated problems, progress tracking, XP, revisions and notes.
        </p>

        <div className="hero-actions">
          <Link className="btn" to="/register">
            Get started <span>→</span>
          </Link>

          <Link className="textlink" to="/login">
            Already a student? Sign in
          </Link>
        </div>

        <div className="hero-stats">
          <div><strong>10</strong><small>Learning phases</small></div>
          <div><strong>200</strong><small>Curated problems</small></div>
          <div><strong>XP</strong><small>Earn as you learn</small></div>
        </div>
      </section>

      <div className="feature-grid">
        <Feature
          title="Structured roadmap"
          text="Progress through carefully ordered DSA topics."
        />
        <Feature
          title="Track every win"
          text="Record completed problems and earn XP."
        />
        <Feature
          title="Learn consistently"
          text="Keep personal notes and schedule revisions."
        />
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="feature">
      <div className="feature-icon"><CheckCircle2 /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function AuthPage({ mode, onUser }) {
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const nav = useNavigate();

  const change = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (mode === "login") {
        const r = await api.post("/auth/login", form);
        onUser(r.data.user);
        nav("/");
      } else {
        const r = await api.post("/auth/request-access", form);
        setMessage(r.data.message);
      }
    } catch (e) {
      setError(
        e.response?.data?.message || "Something went wrong"
      );
    }
  }

  return (
    <div className="auth-wrap">
      <Link to="/" className="brand">
        V2<span>CodeZero</span>
      </Link>

      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">
          {mode === "login"
            ? "WELCOME BACK"
            : "JOIN THE LEARNING JOURNEY"}
        </div>

        <h1>
          {mode === "login"
            ? "Sign in"
            : "Request student access"}
        </h1>

        {mode === "register" && (
          <>
            <label>
              Full name
              <input name="name" required onChange={change} />
            </label>

            <label>
              Reason (optional)
              <textarea name="reason" onChange={change} />
            </label>
          </>
        )}

        <label>
          Email
          <input
            name="email"
            type="email"
            required
            onChange={change}
          />
        </label>

        {mode === "login" && (
          <>
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                onChange={change}
              />
            </label>

            <p className="muted">
              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </p>
          </>
        )}

        <button className="btn full">
          {mode === "login" ? "Sign in" : "Submit request"}
        </button>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <p className="muted">
          {mode === "login" ? (
            <>
              Need access? <Link to="/register">Request it</Link>
            </>
          ) : (
            <>
              Already approved? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post(
        "/auth/forgot-password",
        { email }
      );

      setMessage(
        response.data.message ||
        "If the account exists, a reset link has been sent."
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Unable to process your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Link to="/" className="brand">
        V2<span>CodeZero</span>
      </Link>

      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">ACCOUNT RECOVERY</div>

        <h1>Forgot password?</h1>

        <p>
          Enter your registered email address.
          We will send you a password reset link.
        </p>

        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </label>

        <button
          className="btn full"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <p className="muted">
          <Link to="/login">← Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}

function TokenPage({ reset = false }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  const token = new URLSearchParams(
    window.location.search
  ).get("token");

  async function submit(e) {
    e.preventDefault();

    try {
      const url = reset
        ? "/auth/reset-password"
        : "/auth/activate";

      const r = await api.post(url, { token, password });

      setMessage(r.data.message);
      setTimeout(() => nav("/login"), 1200);
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
        "Unable to complete request"
      );
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>
          {reset ? "Reset password" : "Activate account"}
        </h1>

        <label>
          New password
          <input
            type="password"
            minLength="10"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        <button className="btn full">Continue</button>

        <p>{message}</p>
      </form>
    </div>
  );
}

function Shell({ user, onUser }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const isAdmin = user.role === "admin";
  const links = isAdmin
    ? [
        ["Overview", "/admin", LayoutDashboard],
        ["Students", "/admin/students", Users],
        ["Requests", "/admin/requests", BookOpen],
        ["Problem library", "/problems", Search],
        ["Learning phases", "/roadmap", Layers],
        ["Audit logs", "/admin/audit", ShieldCheck]
      ]
    : [
        ["Dashboard", "/", LayoutDashboard],
        ["Learning roadmap", "/roadmap", Layers],
        ["Problems", "/problems", BookOpen],
        ["Topics", "/topics", BookMarked],
        ["Revision", "/revisions", CalendarDays],
        ["Notes", "/notes", StickyNote],
        ["Leaderboard", "/leaderboard", Trophy],
        ["Analytics", "/analytics", ChartNoAxesCombined]
      ];

  async function logout() {
    try { await api.post("/auth/logout"); } finally {
      onUser(null);
      nav("/login");
    }
  }

  return (
    <div className="app-shell">
      {open && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={open ? "sidebar show" : "sidebar"}>
        <Link to="/" className="side-brand"><span className="brand-mark">&lt;/&gt;</span> V2 <span>CodeZero</span></Link>
        <div className="side-label">{isAdmin ? "ADMIN CONSOLE" : "LEARNING SPACE"}</div>
        <nav className="side-nav">
          {links.map(([t, path, Icon]) => (
            <Link onClick={() => setOpen(false)} className="nav-link" to={path} key={path}>
              <Icon size={18} />{t}
            </Link>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{user.name?.[0]?.toUpperCase()}</span>
          <div><b>{user.name}</b><small>{isAdmin ? "Administrator" : "Student"}</small></div>
          <button className="icon-btn" onClick={logout} aria-label="Sign out"><LogOut size={17}/></button>
        </div>
      </aside>
      <main className="main">
        <header className="header">
          <button className="icon-btn mobile" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu /></button>
          <div className="global-search"><Search size={17}/><input aria-label="Search problems" placeholder="Search problems, topics or notes…" onKeyDown={e => { if(e.key === "Enter" && e.currentTarget.value.trim()) nav(`/problems?q=${encodeURIComponent(e.currentTarget.value.trim())}`); }}/></div>
          <div className="header-actions"><button className="icon-btn" aria-label="Notifications"><Bell size={18}/></button><span className="avatar">{user.name?.[0]?.toUpperCase()}</span></div>
        </header>
        <Routes>
          <Route path="/" element={isAdmin ? <AdminOverview /> : <Dashboard user={user} />} />
          <Route path="/roadmap" element={isAdmin ? <Roadmap /> : <Roadmap />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/topics" element={isAdmin ? <Navigate to="/problems" replace /> : <Topics />} />
          <Route path="/notes" element={isAdmin ? <Navigate to="/admin" replace /> : <Notes />} />
          <Route path="/revisions" element={isAdmin ? <Navigate to="/admin" replace /> : <Revisions />} />
          <Route path="/leaderboard" element={isAdmin ? <Navigate to="/admin" replace /> : <Leaderboard currentUser={user} />} />
          <Route path="/analytics" element={isAdmin ? <AdminOverview /> : <Analytics />} />
          <Route path="/admin" element={isAdmin ? <AdminOverview /> : <Navigate to="/" replace />} />
          <Route path="/admin/students" element={isAdmin ? <Students /> : <Navigate to="/" replace />} />
          <Route path="/admin/requests" element={isAdmin ? <Requests /> : <Navigate to="/" replace />} />
          <Route path="/admin/audit" element={isAdmin ? <Audit /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PageTitle({ eyebrow, title, sub }) {
  return (
    <div className="page-title">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/phases")])
      .then(([d, p]) => { setData(d.data); setPhases(p.data); })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);
  const current = phases.find(p => p.unlocked && p.percentage < 100) || phases[phases.length - 1];
  const statCards = [
    [Target, "Problems solved", data?.solved ?? "—", "of 200"],
    [Layers, "Current phase", current ? `Phase ${current.number}` : "—", current?.title || "Learning roadmap"],
    [Zap, "Total XP", data?.xp ?? "—", "Experience points"],
    [Flame, "Current streak", data ? `${data.streak || 0} days` : "—", "Keep your momentum"]
  ];
  return (
    <div className="content dashboard-content">
      <section className="welcome-banner">
        <div><div className="eyebrow">YOUR PERSONAL DSA WORKSPACE</div><h1>Welcome to V2 CodeZero <span>👋</span></h1><p>Learn DSA step by step, practice 200 problems and track your progress.</p></div>
        <div className="welcome-art"><div className="art-orbit">&lt;/&gt;</div><div className="art-bars"><i/><i/><i/><i/><i/></div></div>
      </section>
      <div className="stats-grid dashboard-stats">
        {statCards.map(([Icon, label, value, hint]) => <div className="stat-card modern-stat" key={label}><span className="stat-icon"><Icon size={21}/></span><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>)}
      </div>
      <div className="dashboard-grid">
        <section className="panel roadmap-panel">
          <div className="panel-head"><div><h2><Layers size={19}/> Your learning roadmap</h2><p>10 phases · 200 curated problems</p></div><Link className="subtle-link" to="/roadmap">View all <ChevronRight size={15}/></Link></div>
          <div className="phase-strip">
            {phases.slice(0,5).map(p => <Link className={`phase-tile ${p.percentage === 100 ? "complete" : p.unlocked ? "current" : "locked"}`} to={p.unlocked ? `/problems?phase=${p.number}` : "/roadmap"} key={p._id}><span className="phase-state">{p.percentage === 100 ? <CheckCircle2 size={18}/> : p.unlocked ? <PlayCircle size={18}/> : <LockKeyhole size={17}/>}</span><b>Phase {p.number}</b><small>{p.title}</small><strong>{p.completed}/{p.total}</strong></Link>)}
          </div>
          <div className="panel-foot"><span>Overall completion</span><b>{data?.progress ?? 0}%</b><div className="progress"><i style={{width:`${data?.progress || 0}%`}}/></div></div>
        </section>
        <aside className="dashboard-side">
          <section className="panel progress-panel"><div className="panel-head"><h3>Overall progress</h3><Activity size={18}/></div><div className="progress-ring" style={{"--progress":`${data?.progress || 0}%`}}><div><b>{data?.progress ?? 0}%</b><small>completed</small></div></div><p>{data?.solved ?? 0} / {data?.problems ?? 200} problems solved</p></section>
          <section className="panel goal-panel"><div className="panel-head"><h3><Target size={18}/> Today's goal</h3><span className="goal-count">{data?.solvedToday ?? 0}/5</span></div><p>Solve 5 problems today</p><div className="progress"><i style={{width:`${Math.min(100,((data?.solvedToday || 0)/5)*100)}%`}}/></div></section>
        </aside>
        <section className="panel continue-panel"><div className="panel-head"><div><h2><PlayCircle size={19}/> Continue learning</h2><p>Pick up where you left off</p></div></div><div className="continue-card"><span className="continue-icon">&lt;/&gt;</span><div><b>{current?.title || "Explore your DSA roadmap"}</b><small>{current ? `Phase ${current.number} · ${current.completed}/${current.total} problems completed` : "Start with Phase 1"}</small></div><Link className="btn" to={current ? `/problems?phase=${current.number}` : "/roadmap"}>Continue <ChevronRight size={16}/></Link></div></section>
        <section className="panel activity-panel"><div className="panel-head"><h2><Activity size={19}/> Recent activity</h2><span className="live-dot">Live data</span></div>{data?.recentActivity?.length ? data.recentActivity.map((a,i)=><div className="activity-row" key={`${a.id || a.title}-${i}`}><span className="activity-check"><CheckCircle2 size={16}/></span><div><b>{a.title}</b><small>{a.date ? new Date(a.date).toLocaleString() : "Recently completed"}</small></div><strong>+{a.xp || 0} XP</strong></div>) : <p className="empty compact">Your completed problems will appear here.</p>}</section>
      </div>
      {loadingData && <p className="muted loading-note">Loading your learning data…</p>}
    </div>
  );
}

function Roadmap() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/phases")
      .then(r => setItems(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="content">
      <PageTitle
        eyebrow="LEARNING PATH"
        title="Your DSA roadmap"
        sub="Complete each phase to unlock the next."
      />

      <div className="phase-grid">
        {items.map(p => (
          <Link
            className={`phase-card ${!p.unlocked ? "locked" : ""}`}
            to={p.unlocked ? `/problems?phase=${p.number}` : "/roadmap"}
            key={p._id}
            aria-disabled={!p.unlocked}
            onClick={e => { if (!p.unlocked) e.preventDefault(); }}
          >
            <div className="phase-top">
              <span className="phase-number">PHASE {p.number}</span>
              {p.unlocked ? <CheckCircle2 /> : <LockKeyhole />}
            </div>

            <h3>{p.title}</h3>
            <p>{p.description}</p>

            <div className="progress">
              <i style={{ width: `${p.percentage}%` }} />
            </div>

            <small>
              {p.completed}/{p.total} completed · {p.percentage}%
            </small>

            <div className="tags">
              {p.topics?.map(t => <span key={t}>{t}</span>)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Problems() {
  const [items, setItems] = useState([]);
  const initialParams = new URLSearchParams(window.location.search);
  const [q, setQ] = useState(initialParams.get("q") || "");
  const [difficulty, setD] = useState("");
  const [topic, setTopic] = useState(initialParams.get("topic") || "");
  const [phase, setPhase] = useState(initialParams.get("phase") || "");
  const [status, setStatus] = useState("");

  async function load() {
    const r = await api.get("/problems", {
      params: { q, difficulty, topic, phase }
    });
    setItems(r.data.filter(p => !status || (status === "completed" ? p.completed : !p.completed)));
  }

  useEffect(() => {
    load();
  }, [difficulty, topic, phase, status]);

  async function complete(p) {
    try {
      await api.post(`/problems/${p._id}/complete`);
      load();
    } catch (e) {
      alert(
        e.response?.data?.message ||
        "Could not complete problem"
      );
    }
  }

  return (
    <div className="content">
      <PageTitle
        eyebrow="PRACTICE LIBRARY"
        title="DSA problems"
        sub="Search, practice externally and track your progress."
      />

      <div className="filters">
        <div className="search">
          <Search size={18} />
          <input
            placeholder="Search problems…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
          />
        </div>

        <select value={difficulty} onChange={e => setD(e.target.value)}><option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
        <select value={topic} onChange={e => setTopic(e.target.value)}><option value="">All topics</option>{[...new Set(items.map(p=>p.topic).filter(Boolean))].sort().map(t=><option value={t} key={t}>{t}</option>)}</select>
        <select value={phase} onChange={e => setPhase(e.target.value)}><option value="">All phases</option>{Array.from({length:10},(_,i)=><option value={i+1} key={i}>Phase {i+1}</option>)}</select>
        <select value={status} onChange={e => setStatus(e.target.value)}><option value="">All status</option><option value="completed">Completed</option><option value="pending">Not completed</option></select>
        <button className="btn" onClick={load}>Apply filters</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Problem</th>
              <th>Phase</th>
              <th>Pattern</th>
              <th>Difficulty</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map(p => (
              <tr key={p._id}>
                <td><span className="muted">#{p.leetcodeId}</span></td>
                <td>
                  <b>{p.title}</b>
                  <small className="subline">{p.objective}</small>
                </td>
                <td>{p.phaseNumber}</td>
                <td>{p.pattern || p.topic}</td>
                <td>
                  <span className={`difficulty ${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={p.leetcodeUrl}
                    >
                      Open #{p.leetcodeId} ↗
                    </a>

                    {p.completed
                      ? <span className="done">Completed</span>
                      : (
                        <button
                          className="mini-btn"
                          onClick={() => complete(p)}
                        >
                          Mark done
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!items.length && (
          <p className="empty">
            No problems found. Seed the database if this is a new installation.
          </p>
        )}
      </div>
    </div>
  );
}

function Topics() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/problems").then(r => setItems(r.data)).catch(() => {}); }, []);
  const groups = [...new Set(items.map(p => p.topic).filter(Boolean))].sort();
  return <div className="content"><PageTitle eyebrow="TOPIC LIBRARY" title="Explore DSA topics" sub="Browse concepts covered by your learning roadmap."/><div className="topic-grid">{groups.map(topic => { const list=items.filter(p=>p.topic===topic); const done=list.filter(p=>p.completed).length; return <Link className="topic-card" to={`/problems?topic=${encodeURIComponent(topic)}`} key={topic}><span className="topic-symbol"><BookMarked/></span><h3>{topic}</h3><p>{list.length} curated problems</p><div className="progress"><i style={{width:`${list.length ? done/list.length*100 : 0}%`}}/></div><small>{done} completed <ChevronRight size={14}/></small></Link>; })}</div></div>;
}

function Analytics() {
  const [data,setData]=useState(null); const [phases,setPhases]=useState([]);
  useEffect(()=>{Promise.all([api.get("/dashboard"),api.get("/phases")]).then(([d,p])=>{setData(d.data);setPhases(p.data);}).catch(()=>{});},[]);
  return <div className="content"><PageTitle eyebrow="YOUR PERFORMANCE" title="Learning analytics" sub="Understand your progress across the DSA roadmap."/><div className="stats-grid"><div className="stat-card"><span>Problems solved</span><strong>{data?.solved ?? "—"}</strong></div><div className="stat-card"><span>Total XP</span><strong>{data?.xp ?? "—"}</strong></div><div className="stat-card"><span>Current streak</span><strong>{data?.streak ?? 0} days</strong></div><div className="stat-card"><span>Overall progress</span><strong>{data?.progress ?? 0}%</strong></div></div><section className="panel analytics-panel"><h2>Phase-wise progress</h2>{phases.map(p=><div className="analytics-phase" key={p._id}><div><b>Phase {p.number}: {p.title}</b><span>{p.completed}/{p.total} · {p.percentage}%</span></div><div className="progress"><i style={{width:`${p.percentage}%`}}/></div></div>)}</section></div>;
}

function Notes() {
  const [notes, setNotes] = useState([]);
  const [problems, setProblems] = useState([]);
  const [problemId, setId] = useState("");
  const [content, setContent] = useState("");

  async function load() {
    const [n, p] = await Promise.all([
      api.get("/notes"),
      api.get("/problems")
    ]);

    setNotes(n.data);
    setProblems(p.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    await api.post("/notes", { problemId, content });
    setContent("");
    load();
  }

  return (
    <div className="content">
      <PageTitle
        eyebrow="YOUR KNOWLEDGE BASE"
        title="Personal notes"
        sub="Keep important observations attached to problems."
      />

      <form className="panel note-form" onSubmit={save}>
        <select
          required
          value={problemId}
          onChange={e => setId(e.target.value)}
        >
          <option value="">Choose a problem</option>
          {problems.map(p => (
            <option value={p._id} key={p._id}>{p.title}</option>
          ))}
        </select>

        <textarea
          required
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your approach, edge cases or learnings…"
        />

        <button className="btn">Save note</button>
      </form>

      <div className="note-grid">
        {notes.map(n => (
          <article className="note-card" key={n._id}>
            <h3>{n.problemId?.title || "Problem note"}</h3>
            <p>{n.content}</p>
            <button
              className="text-danger"
              onClick={async () => {
                await api.delete(`/notes/${n._id}`);
                load();
              }}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function Revisions() {
  const [items, setItems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [problemId, setId] = useState("");
  const [dueDate, setDue] = useState("");

  async function load() {
    const [a, b] = await Promise.all([
      api.get("/revisions"),
      api.get("/problems")
    ]);

    setItems(a.data);
    setProblems(b.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/revisions", { problemId, dueDate });
    setId("");
    setDue("");
    load();
  }

  return (
    <div className="content">
      <PageTitle
        eyebrow="RETAIN WHAT YOU LEARN"
        title="Revision queue"
        sub="Schedule problems to revisit and strengthen recall."
      />

      <form className="panel revision-form" onSubmit={add}>
        <select
          required
          value={problemId}
          onChange={e => setId(e.target.value)}
        >
          <option value="">Choose a problem</option>
          {problems.map(p => (
            <option value={p._id} key={p._id}>{p.title}</option>
          ))}
        </select>

        <input
          type="date"
          required
          value={dueDate}
          onChange={e => setDue(e.target.value)}
        />

        <button className="btn">Add revision</button>
      </form>

      <div className="list-panel">
        {items.map(x => (
          <div className="list-row" key={x._id}>
            <div>
              <b>{x.problemId?.title}</b>
              <small>{new Date(x.dueDate).toLocaleDateString()}</small>
            </div>

            <div className="actions">
              <button
                className="mini-btn"
                onClick={async () => {
                  await api.patch(`/revisions/${x._id}`, {
                    status: "completed"
                  });
                  load();
                }}
              >
                Complete
              </button>

              <button
                className="text-danger"
                onClick={async () => {
                  await api.delete(`/revisions/${x._id}`);
                  load();
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboard({ currentUser }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/leaderboard").then(r => setRows(r.data));
  }, []);

  return (
    <div className="content">
      <PageTitle
        eyebrow="COMMUNITY"
        title="Leaderboard"
        sub="Celebrate consistency and problem-solving progress."
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Problems solved</th>
              <th>XP</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(x => (
              <tr className={x.name === currentUser?.name ? "leaderboard-self" : ""} key={x.rank}>
                <td>#{x.rank}</td>
                <td><b>{x.name}</b>{x.name === currentUser?.name && <span className="you-label">YOU</span>}</td>
                <td>{x.solved}</td>
                <td>{x.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get("/admin/overview")
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="content">
      <PageTitle
        eyebrow="ADMIN CONSOLE"
        title="Platform overview"
        sub="Monitor student access and learning activity."
      />

      <div className="stats-grid">
        {[
          ["Students", data.total],
          ["Pending requests", data.pending],
          ["Active", data.active],
          ["Suspended", data.suspended],
          ["Problems solved", data.solves],
          ["Total XP awarded", data.totalXp]
        ].map(([a, b]) => (
          <div className="stat-card" key={a}>
            <span>{a}</span>
            <strong>{b ?? "—"}</strong>
          </div>
        ))}
      </div>

      <section className="panel admin-registrations">
        <div className="panel-head"><div><h2><TrendingUp size={18}/> Registrations</h2><p>New student accounts over the last 30 days</p></div><span className="live-dot">Last 30 days</span></div>
        <div className="registration-bars">{(data.registrations || []).slice(-14).map((item,index,arr)=>{const max=Math.max(1,...arr.map(x=>x.count));return <div className="registration-bar" key={item._id} title={`${item._id}: ${item.count}`}><i style={{height:`${Math.max(5,item.count/max*100)}%`}}/><small>{new Date(item._id).getUTCDate()}</small></div>;})}</div>
        <div className="chart-caption"><span>Daily registrations</span><b>{(data.registrations || []).reduce((sum,item)=>sum+item.count,0)} new students</b></div>
      </section>
      <div className="admin-shortcuts">
        <Link to="/admin/requests"><Users/><b>Review access requests</b><ChevronRight/></Link>
        <Link to="/admin/students"><ShieldCheck/><b>Manage students</b><ChevronRight/></Link>
        <Link to="/problems"><BookOpen/><b>Problem library</b><ChevronRight/></Link>
        <Link to="/admin/audit"><Activity/><b>View audit logs</b><ChevronRight/></Link>
      </div>
    </div>
  );
}

function Requests() {
  const [rows, setRows] = useState([]);

  async function load() {
    const r = await api.get("/admin/requests");
    setRows(r.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id, action) {
    const r = await api.post(`/admin/requests/${id}/${action}`);
    alert(r.data.message);
    load();
  }

  return (
    <div className="content">
      <PageTitle
        eyebrow="ACCESS CONTROL"
        title="Student requests"
        sub="Approve or reject requests to join CodeZero."
      />

      <div className="list-panel">
        {rows.map(x => (
          <div className="list-row" key={x._id}>
            <div>
              <b>{x.name}</b>
              <small>
                {x.email} · {x.reason || "No reason provided"}
              </small>
            </div>

            <div className="actions">
              <button
                className="mini-btn"
                onClick={() => act(x._id, "approve")}
              >
                Approve
              </button>

              <button
                className="text-danger"
                onClick={() => act(x._id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {!rows.length && (
          <p className="empty">No pending requests.</p>
        )}
      </div>
    </div>
  );
}

function Students() {
  const [rows, setRows] = useState([]);

  async function load() {
    const r = await api.get("/admin/students");
    setRows(r.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function status(id, s) {
    await api.patch(`/admin/students/${id}/status`, {
      status: s
    });
    load();
  }

  return (
    <div className="content">
      <PageTitle
        eyebrow="STUDENT DIRECTORY"
        title="Manage students"
        sub="Review account status and access."
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.status}</td>
                <td>
                  <button
                    className="mini-btn"
                    onClick={() =>
                      status(
                        u._id,
                        u.status === "suspended"
                          ? "active"
                          : "suspended"
                      )
                    }
                  >
                    {u.status === "suspended"
                      ? "Reactivate"
                      : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Audit() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/admin/audit").then(r => setRows(r.data));
  }, []);

  return (
    <div className="content">
      <PageTitle
        eyebrow="SECURITY & GOVERNANCE"
        title="Audit log"
        sub="Recent administrative events."
      />

      <div className="list-panel">
        {rows.map(x => (
          <div className="list-row" key={x._id}>
            <b>{x.action}</b>
            <small>{new Date(x.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
