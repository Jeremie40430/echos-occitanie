import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sxhaapcnzbrlornlkxft.supabase.co",
  "sb_publishable_pN30Nd2M-cNVneBT7zKuXg_4hpcJge2"
);

const COLORS = {
  foret: "#1C2B1A", cuivre: "#C8860A", parchemin: "#F5F0E8",
  vertMoyen: "#2D4A2A", grisChaud: "#8B7355", blanc: "#FDFAF5",
};

const SUB_COLORS = {
  concert:    { bg: "#7B2D8B", light: "#F3E8F7", text: "#5A1E68" },
  repetition: { bg: "#1565C0", light: "#E8F0FB", text: "#0D47A1" },
  concours:   { bg: "#C8860A", light: "#FDF3E3", text: "#7A5000" },
  stage:      { bg: "#2E7D32", light: "#E8F5E9", text: "#1B5E20" },
};

const REP_SUBTABS = [
  { id: "chantees",    label: "🎵 Chantées",    color: "#7B2D8B" },
  { id: "midi",        label: "🎹 MIDI",         color: "#1565C0" },
  { id: "multipistes", label: "🎛 Multipistes",  color: "#C8860A" },
  { id: "partitions",  label: "📄 Partitions",   color: "#2E7D32" },
  { id: "taches",      label: "✅ Tâches",       color: "#B71C1C" },
];

const statutColors = {
  "Terminé":  { bg: "#E8F5E9", text: "#1B5E20" },
  "En cours": { bg: "#FFF8E1", text: "#7A5000" },
  "À faire":  { bg: "#FDECEA", text: "#B71C1C" },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

const DifficultyDots = ({ level }) => (
  <span style={{ display: "flex", gap: 3 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i <= level ? COLORS.cuivre : "#D4C9B0", display: "inline-block" }}/>
    ))}
  </span>
);

// Icons
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconMusic = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconDoc = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;

const TrompeLogo = ({ size = 30, color = "#C8860A" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M8 40 Q12 28 20 24 Q32 18 44 20 Q52 22 56 28 L52 32 Q48 26 40 24 Q30 22 22 28 Q14 34 12 44 Z" fill={color} opacity="0.9"/>
    <circle cx="10" cy="42" r="5" fill={color} opacity="0.7"/>
    <path d="M54 26 Q58 24 60 20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M56 30 Q61 30 63 26" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
    <div style={{ width: 28, height: 28, border: `3px solid #D4C9B0`, borderTopColor: COLORS.cuivre, borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const styles = {
  card: { background: COLORS.blanc, border: "1px solid #D4C9B0", borderRadius: 12, padding: "12px 14px", marginBottom: 10, boxShadow: "0 1px 4px rgba(28,43,26,0.06)" },
  badge: { display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 },
  dateText: { fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 14, textTransform: "capitalize" },
  lieuText: { fontSize: 12, color: COLORS.grisChaud, marginTop: 3 },
  noteText: { fontSize: 12, color: COLORS.vertMoyen, marginTop: 5, fontStyle: "italic" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, color: COLORS.foret, marginBottom: 12, fontWeight: 700 },
  leftNav: { display: "flex", flexDirection: "column", gap: 5, paddingTop: 4, paddingRight: 10, flexShrink: 0, width: 96 },
  divider: { width: 1, background: "#D4C9B0", marginRight: 12, flexShrink: 0 },
};

const subTabBtn = (isActive, color) => ({
  padding: "8px 8px", borderRadius: 10, border: "none", cursor: "pointer",
  fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: isActive ? 700 : 400,
  textAlign: "left", lineHeight: 1.4,
  background: isActive ? color : "transparent",
  color: isActive ? "#fff" : COLORS.grisChaud,
  transition: "all 0.18s",
});

// ── Auth screen ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return;
    setLoading(true);
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.parchemin, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <TrompeLogo size={56} color={COLORS.cuivre} />
      <div style={{ fontFamily: "'Playfair Display', serif", color: COLORS.foret, fontSize: 22, fontWeight: 700, marginTop: 16, textAlign: "center" }}>Les Échos d'Occitanie</div>
      <div style={{ color: COLORS.grisChaud, fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 36 }}>Groupe de Trompe de Chasse</div>
      {!sent ? (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: COLORS.foret, marginBottom: 10, fontWeight: 600 }}>Connexion par email</div>
          <input
            type="email" placeholder="ton@email.fr" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D4C9B0", fontSize: 14, fontFamily: "Inter, sans-serif", background: COLORS.blanc, boxSizing: "border-box", outline: "none", marginBottom: 10 }}
          />
          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", background: COLORS.cuivre, color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "Inter, sans-serif" }}>
            {loading ? "Envoi…" : "Recevoir le lien de connexion"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", maxWidth: 280 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
          <div style={{ fontWeight: 700, color: COLORS.foret, fontSize: 15, marginBottom: 8 }}>Lien envoyé !</div>
          <div style={{ fontSize: 13, color: COLORS.grisChaud, lineHeight: 1.6 }}>Consulte ta boîte mail et clique sur le lien pour accéder à l'application.</div>
        </div>
      )}
    </div>
  );
}

// ── Agenda ───────────────────────────────────────────────────────────────────
const agendaSubTabs = [
  { id: "tous", label: "Tous" },
  { id: "concert", label: "Concerts", color: "#7B2D8B" },
  { id: "repetition", label: "Répétitions", color: "#1565C0" },
  { id: "concours", label: "Concours", color: "#C8860A" },
  { id: "stage", label: "Stages", color: "#2E7D32" },
];

function AgendaTab() {
  const [subTab, setSubTab] = useState("tous");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();

  useEffect(() => {
    supabase.from("evenements").select("*").order("date").then(({ data }) => {
      setEvents(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = subTab === "tous" ? events : events.filter(e => e.type === subTab);
  const upcoming = filtered.filter(e => new Date(e.date) >= today);
  const past = filtered.filter(e => new Date(e.date) < today);

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 130px)" }}>
      <div style={styles.leftNav}>
        {agendaSubTabs.map(st => {
          const isActive = subTab === st.id;
          const color = st.color || COLORS.foret;
          return (
            <button key={st.id} onClick={() => setSubTab(st.id)} style={subTabBtn(isActive, color)}>
              {st.color && <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: isActive ? "rgba(255,255,255,0.7)" : st.color, marginBottom: 4 }}/>}
              {st.label}
            </button>
          );
        })}
      </div>
      <div style={styles.divider}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? <Spinner /> : (
          <>
            {upcoming.length === 0 && past.length === 0 && <div style={{ color: COLORS.grisChaud, fontSize: 13, paddingTop: 20 }}>Aucun événement.</div>}
            {upcoming.length > 0 && (
              <>
                <div style={styles.sectionTitle}>À venir</div>
                {upcoming.map(ev => {
                  const sc = SUB_COLORS[ev.type];
                  return (
                    <div key={ev.id} style={styles.card}>
                      <span style={{ ...styles.badge, background: sc.light, color: sc.text }}>{{ concert:"Concert", repetition:"Répétition", concours:"Concours", stage:"Stage" }[ev.type]}</span>
                      <div style={styles.dateText}>{formatDate(ev.date)}</div>
                      <div style={styles.lieuText}>🕐 {ev.heure} — {ev.lieu}</div>
                      {ev.note && <div style={styles.noteText}>{ev.note}</div>}
                    </div>
                  );
                })}
              </>
            )}
            {past.length > 0 && (
              <>
                <div style={{ ...styles.sectionTitle, marginTop: 20, opacity: 0.55 }}>Passés</div>
                {[...past].reverse().map(ev => {
                  const sc = SUB_COLORS[ev.type];
                  return (
                    <div key={ev.id} style={{ ...styles.card, opacity: 0.6 }}>
                      <span style={{ ...styles.badge, background: sc.light, color: sc.text }}>{{ concert:"Concert", repetition:"Répétition", concours:"Concours", stage:"Stage" }[ev.type]}</span>
                      <div style={styles.dateText}>{formatDate(ev.date)}</div>
                      <div style={styles.lieuText}>🕐 {ev.heure} — {ev.lieu}</div>
                      {ev.note && <div style={{ ...styles.noteText, color: COLORS.cuivre, fontWeight: 600 }}>{ev.note}</div>}
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Répertoire ───────────────────────────────────────────────────────────────
function RepertoireTab() {
  const [subTab, setSubTab] = useState("chantees");
  const [morceaux, setMorceaux] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [taches, setTaches] = useState([]);
  const [, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [openPiste, setOpenPiste] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.from("morceaux").select("*").order("titre"),
      supabase.from("fichiers").select("*"),
      supabase.from("taches").select("*, membres(prenom, nom), morceaux(titre)"),
      supabase.from("membres").select("prenom, nom, id"),
    ]).then(([m, f, t, mb]) => {
      setMorceaux(m.data || []);
      setFichiers(f.data || []);
      setTaches(t.data || []);
      setMembres(mb.data || []);
      setLoading(false);
    });
  }, []);

  const byType = (type) => fichiers.filter(f => f.type === type);

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 130px)" }}>
      <div style={styles.leftNav}>
        {REP_SUBTABS.map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)} style={subTabBtn(subTab === st.id, st.color)}>{st.label}</button>
        ))}
      </div>
      <div style={styles.divider}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? <Spinner /> : (
          <>
            {/* Fanfares chantées */}
            {subTab === "chantees" && (
              byType("chantee").length === 0
                ? morceaux.map(m => (
                    <div key={m.id} style={{ ...styles.card, display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => setPlaying(playing === m.id ? null : m.id)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", background: playing === m.id ? "#7B2D8B" : COLORS.vertMoyen, color: "#fff", fontSize: 12 }}>
                        {playing === m.id ? "⏸" : "▶"}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{m.titre}</div>
                        <div style={{ fontSize: 11, color: COLORS.grisChaud, marginTop: 2 }}>{m.compositeur} · {m.duree}</div>
                        {playing === m.id && <div style={{ marginTop: 7, height: 3, background: "#D4C9B0", borderRadius: 2 }}><div style={{ width: "38%", height: "100%", background: "#7B2D8B", borderRadius: 2 }}/></div>}
                      </div>
                      <DifficultyDots level={m.difficulte}/>
                    </div>
                  ))
                : byType("chantee").map(f => (
                    <div key={f.id} style={styles.card}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => setPlaying(playing === f.id ? null : f.id)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", background: playing === f.id ? "#7B2D8B" : COLORS.vertMoyen, color: "#fff", fontSize: 12 }}>
                          {playing === f.id ? "⏸" : "▶"}
                        </button>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{f.nom}</div>
                          <div style={{ fontSize: 11, color: COLORS.grisChaud }}>{f.taille}</div>
                        </div>
                      </div>
                    </div>
                  ))
            )}

            {/* MIDI */}
            {subTab === "midi" && (
              byType("midi").length === 0
                ? <div style={{ color: COLORS.grisChaud, fontSize: 13, paddingTop: 16 }}>Aucun fichier MIDI — ajoutez-en depuis l'interface admin.</div>
                : byType("midi").map(f => (
                    <div key={f.id} style={styles.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{f.nom}</div>
                          <div style={{ fontSize: 11, color: COLORS.grisChaud, marginTop: 2 }}>{f.taille}</div>
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 11px", borderRadius: 8, background: "#E8F0FB", color: "#1565C0", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>⬇ Télécharger</a>
                      </div>
                    </div>
                  ))
            )}

            {/* Multipistes */}
            {subTab === "multipistes" && (
              byType("multipiste").length === 0
                ? <div style={{ color: COLORS.grisChaud, fontSize: 13, paddingTop: 16 }}>Aucun fichier multipiste pour l'instant.</div>
                : byType("multipiste").map(f => (
                    <div key={f.id} style={styles.card}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{f.nom}</div>
                          <div style={{ fontSize: 11, color: COLORS.grisChaud }}>{f.taille}</div>
                        </div>
                        <button onClick={() => setOpenPiste(openPiste === f.id ? null : f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.grisChaud, fontSize: 16 }}>{openPiste === f.id ? "▴" : "▾"}</button>
                      </div>
                      {openPiste === f.id && f.meta?.pistes && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #D4C9B0", display: "flex", flexDirection: "column", gap: 6 }}>
                          {f.meta.pistes.map((p, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 22, height: 22, borderRadius: 5, background: `hsl(${30 + i * 45},60%,45%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>{i + 1}</div>
                              <span style={{ fontSize: 12, color: COLORS.foret }}>{p}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
            )}

            {/* Partitions */}
            {subTab === "partitions" && (
              byType("partition").length === 0
                ? morceaux.map(m => (
                    <div key={m.id} style={{ ...styles.card, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 42, background: "#E8F5E9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }}>📄</span>
                        <span style={{ fontSize: 8, color: "#2E7D32", fontWeight: 700 }}>PDF</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{m.titre}</div>
                        <div style={{ fontSize: 11, color: COLORS.grisChaud }}>{m.compositeur}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#D4C9B0" }}>Non uploadé</span>
                    </div>
                  ))
                : byType("partition").map(f => (
                    <div key={f.id} style={{ ...styles.card, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 42, background: "#E8F5E9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }}>📄</span>
                        <span style={{ fontSize: 8, color: "#2E7D32", fontWeight: 700 }}>PDF</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{f.nom}</div>
                        <div style={{ fontSize: 11, color: COLORS.grisChaud }}>{f.taille}</div>
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 11px", borderRadius: 8, background: "#E8F5E9", color: "#2E7D32", fontSize: 11, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>⬇ PDF</a>
                    </div>
                  ))
            )}

            {/* Tâches */}
            {subTab === "taches" && (
              <>
                <div style={{ fontSize: 11, color: COLORS.grisChaud, marginBottom: 8 }}>
                  {taches.filter(t => t.statut === "Terminé").length}/{taches.length} tâches terminées
                </div>
                <div style={{ height: 5, background: "#D4C9B0", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ width: taches.length ? `${(taches.filter(t => t.statut === "Terminé").length / taches.length) * 100}%` : "0%", height: "100%", background: "#2E7D32", borderRadius: 3 }}/>
                </div>
                {taches.length === 0
                  ? <div style={{ color: COLORS.grisChaud, fontSize: 13 }}>Aucune tâche assignée pour l'instant.</div>
                  : taches.map(t => {
                      const sc = statutColors[t.statut] || statutColors["À faire"];
                      return (
                        <div key={t.id} style={styles.card}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 13 }}>{t.morceaux?.titre || "—"}</div>
                              <div style={{ fontSize: 12, color: COLORS.grisChaud, marginTop: 3 }}>
                                <span style={{ fontWeight: 600, color: COLORS.vertMoyen }}>{t.membres ? `${t.membres.prenom} ${t.membres.nom}` : "—"}</span> · {t.role}
                              </div>
                            </div>
                            <span style={{ ...styles.badge, background: sc.bg, color: sc.text, flexShrink: 0 }}>{t.statut}</span>
                          </div>
                        </div>
                      );
                    })
                }
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Membres ──────────────────────────────────────────────────────────────────
function MembresTab() {
  const [membres, setMembres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("membres").select("*").order("nom").then(({ data }) => {
      setMembres(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {membres.map(m => (
        <div key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)} style={{ ...styles.card, cursor: "pointer", border: selected === m.id ? `2px solid ${COLORS.cuivre}` : styles.card.border }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.vertMoyen, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.cuivre, fontWeight: 700, fontSize: 14, fontFamily: "'Playfair Display', serif", marginBottom: 7 }}>
            {m.prenom[0]}{m.nom[0]}
          </div>
          <div style={{ fontWeight: 600, color: COLORS.foret, fontSize: 13 }}>{m.prenom} {m.nom}</div>
          <div style={{ fontSize: 11, color: COLORS.grisChaud, marginTop: 2 }}>{m.role}</div>
          {m.is_admin && <span style={{ ...styles.badge, background: "#FDF3E3", color: "#7A5000", marginTop: 4 }}>Admin</span>}
          {selected === m.id && m.adresse && (
            <div style={{ marginTop: 9, paddingTop: 9, borderTop: "1px solid #D4C9B0" }}>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: COLORS.cuivre, textDecoration: "none" }}>
                📍 {m.adresse}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Notes DM ─────────────────────────────────────────────────────────────────
function ProgrammesTab() {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("notes_dm").select("*, membres(prenom, nom)").order("created_at", { ascending: false }).then(({ data }) => {
      setNotes(data || []);
      if (data?.length) setOpen(data[0].id);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {notes.map(p => (
        <div key={p.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => setOpen(open === p.id ? null : p.id)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ ...styles.badge, background: p.type === "retour" ? "#2D4A2A22" : "#C8860A22", color: p.type === "retour" ? COLORS.vertMoyen : "#8B5E00" }}>
                {p.type === "retour" ? "Retour DM" : "Programme"}
              </span>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: COLORS.foret, fontSize: 14, marginTop: 5 }}>{p.titre}</div>
              <div style={{ fontSize: 11, color: COLORS.grisChaud, marginTop: 2 }}>
                {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                {p.membres && ` · ${p.membres.prenom} ${p.membres.nom}`}
              </div>
            </div>
            <span style={{ color: COLORS.grisChaud, fontSize: 16, transform: open === p.id ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
          </div>
          {open === p.id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #D4C9B0", fontSize: 13, color: COLORS.foret, lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {p.contenu}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────
const tabs = [
  { id: "agenda",      label: "Agenda",    icon: <IconCalendar /> },
  { id: "repertoire",  label: "Répertoire", icon: <IconMusic /> },
  { id: "membres",     label: "Membres",   icon: <IconUsers /> },
  { id: "programmes",  label: "Notes DM",  icon: <IconDoc /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("agenda");
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div style={{ minHeight: "100vh", background: COLORS.parchemin }}/>;
  if (!session) return <AuthScreen />;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.parchemin, fontFamily: "Inter, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: COLORS.foret, padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrompeLogo size={32} color={COLORS.cuivre} />
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", color: COLORS.cuivre, fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>Les Échos d'Occitanie</div>
              <div style={{ color: "#A8B8A6", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>Groupe de Trompe de Chasse</div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B8468", fontSize: 11, fontFamily: "Inter, sans-serif" }}>
            Déconnexion
          </button>
        </div>
        <div style={{ display: "flex" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "8px 4px 10px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: isActive ? COLORS.cuivre : "#6B8468", position: "relative", transition: "color 0.18s" }}>
                {tab.icon}
                <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tab.label}</span>
                {isActive && <div style={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, background: COLORS.cuivre, borderRadius: "2px 2px 0 0" }}/>}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "18px 14px 40px" }}>
        {activeTab === "agenda"     && <AgendaTab />}
        {activeTab === "repertoire" && <RepertoireTab />}
        {activeTab === "membres"    && <MembresTab />}
        {activeTab === "programmes" && <ProgrammesTab />}
      </div>
    </div>
  );
}
