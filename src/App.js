/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sxhaapcnzbrlornlkxft.supabase.co",
  "sb_publishable_pN30Nd2M-cNVneBT7zKuXg_4hpcJge2"
);

const C = {
  primary: "#1A1F6E", secondary: "#C8102E",
  parchemin: "#F5F0E8", grisChaud: "#8B7355",
  blanc: "#FDFAF5", bleuClair: "#E8EAFA",
  rougeClair: "#FDECEA", bleuMoyen: "#3949AB",
};

const SUB = {
  concert:    { light: "#EDE7F6", text: "#4527A0" },
  repetition: { light: C.bleuClair, text: C.primary },
  concours:   { light: C.rougeClair, text: C.secondary },
  stage:      { light: C.bleuClair, text: C.bleuMoyen },
};

const fd = (d) => new Date(d).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
const fds = (d) => new Date(d).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });

const EVENTS = []; // chargé depuis Supabase

const BIBLIO_D = []; // chargé depuis Supabase
const BIBLIO_F = []; // chargé depuis Supabase
const REP_D    = []; // chargé depuis Supabase
const MEMBRES = []; // chargé depuis Supabase

// ── Styles ────────────────────────────────────────────────────────
const S = {
  card: { background:C.blanc, border:"1px solid #D4C9B0", borderRadius:12, padding:"12px 14px", marginBottom:10, boxShadow:"0 1px 4px rgba(26,31,110,0.06)" },
  badge: { display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" },
  secTitle: { fontFamily:"'Playfair Display', serif", fontSize:15, color:C.primary, marginBottom:12, fontWeight:700 },
  input: { width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid #D4C9B0", fontSize:13, fontFamily:"Inter, sans-serif", background:C.blanc, boxSizing:"border-box", outline:"none", marginBottom:10, color:C.primary },
  select: { width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid #D4C9B0", fontSize:13, fontFamily:"Inter, sans-serif", background:C.blanc, boxSizing:"border-box", outline:"none", marginBottom:10, color:C.primary },
  label: { fontSize:11, fontWeight:600, color:C.grisChaud, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4, display:"block" },
  btnP: { width:"100%", padding:"11px", borderRadius:10, border:"none", cursor:"pointer", background:C.primary, color:"#fff", fontWeight:700, fontSize:13, fontFamily:"Inter, sans-serif" },
  btnS: { width:"100%", padding:"11px", borderRadius:10, border:"1px solid #D4C9B0", cursor:"pointer", background:"transparent", color:C.grisChaud, fontWeight:600, fontSize:13, fontFamily:"Inter, sans-serif", marginTop:8 },
  btnD: { width:"100%", padding:"11px", borderRadius:10, border:"none", cursor:"pointer", background:C.rougeClair, color:C.secondary, fontWeight:700, fontSize:13, fontFamily:"Inter, sans-serif", marginTop:8 },
};

// ── Base components ───────────────────────────────────────────────
const TrompeLogo = ({ size=30, color="#C8102E" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M8 40 Q12 28 20 24 Q32 18 44 20 Q52 22 56 28 L52 32 Q48 26 40 24 Q30 22 22 28 Q14 34 12 44 Z" fill={color} opacity="0.9"/>
    <circle cx="10" cy="42" r="5" fill={color} opacity="0.7"/>
    <path d="M54 26 Q58 24 60 20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const BtnPlus = ({ onClick }) => (
  <button onClick={onClick} style={{ position:"fixed", bottom:28, right:20, width:52, height:52, borderRadius:"50%", border:"none", cursor:"pointer", background:C.secondary, color:"#fff", fontSize:28, boxShadow:"0 4px 16px rgba(200,16,46,0.35)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-end" }}>
    <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)" }}/>
    <div style={{ position:"relative", width:"100%", maxWidth:480, margin:"0 auto", background:C.parchemin, borderRadius:"18px 18px 0 0", padding:"20px 18px 36px", maxHeight:"88vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:17, color:C.primary }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:C.grisChaud }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const AA = ({ onEdit, onDelete }) => (
  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
    <button onClick={e=>{e.stopPropagation();onEdit();}} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"5px 7px", borderRadius:6, fontSize:13 }}>✏️</button>
    <button onClick={e=>{e.stopPropagation();onDelete();}} style={{ background:C.rougeClair, border:"none", cursor:"pointer", padding:"5px 7px", borderRadius:6, fontSize:13 }}>🗑</button>
  </div>
);

const Toast = ({ msg }) => (
  <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:C.primary, color:"#fff", padding:"10px 20px", borderRadius:20, fontSize:13, fontWeight:600, zIndex:200, whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>{msg}</div>
);

const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}>
    <div style={{ width:28, height:28, border:"3px solid #D4C9B0", borderTopColor:C.secondary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
  </div>
);

const Confirm = ({ msg, onConfirm, onClose }) => (
  <Modal title="Confirmer" onClose={onClose}>
    <div style={{ fontSize:14, color:C.primary, marginBottom:16 }}>{msg}</div>
    <button style={S.btnD} onClick={onConfirm}>Supprimer</button>
    <button style={S.btnS} onClick={onClose}>Annuler</button>
  </Modal>
);

const Breadcrumb = ({ items, onBack }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
    <button onClick={onBack} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"6px 12px", borderRadius:8, fontSize:12, color:C.primary, fontWeight:600 }}>← Retour</button>
    {items.map((it,i) => <span key={i} style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:14 }}>{it}</span>)}
  </div>
);

const DossierGrid = ({ dossiers, onOpen, isAdmin, onEdit, onDelete }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
    {dossiers.map(d => (
      <div key={d.id} onClick={()=>onOpen(d)} style={{ ...S.card, cursor:"pointer", textAlign:"center", padding:"18px 12px" }}>
        <div style={{ width:52, height:52, borderRadius:14, background:d.color+"20", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:26, border:`1px solid ${d.color}30` }}>{d.emoji}</div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13 }}>{d.nom}</div>
        <div style={{ fontSize:11, color:C.grisChaud, marginTop:3 }}>{d.count} {d.countLabel}</div>
        {isAdmin && onEdit && (
          <div style={{ marginTop:10, display:"flex", justifyContent:"center", gap:6 }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>onEdit(d)} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"3px 7px", borderRadius:6, fontSize:12 }}>✏️</button>
            <button onClick={()=>onDelete(d)} style={{ background:C.rougeClair, border:"none", cursor:"pointer", padding:"3px 7px", borderRadius:6, fontSize:12 }}>🗑</button>
          </div>
        )}
      </div>
    ))}
  </div>
);

// Universal audio card
const AudioCard = ({ nom, taille, favori, playing, onPlay, onFavori, onEdit, onDelete, isAdmin, bColor, bIcon }) => (
  <div style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
    <button onClick={onPlay} style={{ width:40, height:40, borderRadius:"50%", border:"none", cursor:"pointer", background:bColor||C.secondary, color:"#fff", fontSize:16, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 2px 8px ${(bColor||C.secondary)}50`, fontWeight:700 }}>
      {playing ? "⏸" : (bIcon||"▶")}
    </button>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{nom}</div>
      <div style={{ fontSize:11, color:C.grisChaud, marginTop:2 }}>{taille}</div>
      {playing && <div style={{ marginTop:6, height:3, background:"#D4C9B0", borderRadius:2 }}><div style={{ width:"40%", height:"100%", background:bColor||C.secondary, borderRadius:2 }}/></div>}
    </div>
    {isAdmin && (
      <div style={{ display:"flex", gap:4, flexShrink:0 }}>
        {onFavori !== undefined && (
          <button onClick={e=>{e.stopPropagation();onFavori();}} style={{ background:favori?"#FDF3E3":"#F5F5F5", border:"none", cursor:"pointer", padding:"5px 7px", borderRadius:6, fontSize:14 }}>{favori?"⭐":"☆"}</button>
        )}
        <button onClick={e=>{e.stopPropagation();onEdit();}} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"5px 7px", borderRadius:6, fontSize:13 }}>✏️</button>
        <button onClick={e=>{e.stopPropagation();onDelete();}} style={{ background:C.rougeClair, border:"none", cursor:"pointer", padding:"5px 7px", borderRadius:6, fontSize:13 }}>🗑</button>
      </div>
    )}
  </div>
);

const PdfCard = ({ nom, taille, url, onEdit, onDelete, isAdmin }) => (
  <div style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
    <div style={{ width:40, height:40, borderRadius:10, background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 2px 8px ${C.primary}40` }}>
      <span style={{ color:"#fff", fontSize:18 }}>📄</span>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{nom}</div>
      <div style={{ fontSize:11, color:C.grisChaud, marginTop:2 }}>{taille}</div>
    </div>
    {url && url!="#" && <a href={url} target="_blank" rel="noopener noreferrer" style={{ padding:"5px 10px", borderRadius:8, background:C.bleuClair, color:C.primary, fontSize:11, fontWeight:700, textDecoration:"none", flexShrink:0 }}>⬇ PDF</a>}
    {isAdmin && <AA onEdit={onEdit} onDelete={onDelete}/>}
  </div>
);

const FileCard = ({ nom, taille, url, typeLabel, onEdit, onDelete, isAdmin }) => (
  <div style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
    <div style={{ width:40, height:40, borderRadius:10, background:"#E8E0D0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ color:C.grisChaud, fontSize:18 }}>{typeLabel==="MIDI"?"🎹":"📎"}</span>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{nom}</div>
      <div style={{ fontSize:11, color:C.grisChaud, marginTop:2 }}>{typeLabel} · {taille}</div>
    </div>
    {url && url!="#" && <a href={url} target="_blank" rel="noopener noreferrer" style={{ padding:"5px 10px", borderRadius:8, background:"#E8E0D0", color:C.grisChaud, fontSize:11, fontWeight:700, textDecoration:"none", flexShrink:0 }}>⬇</a>}
    {isAdmin && <AA onEdit={onEdit} onDelete={onDelete}/>}
  </div>
);

// ── Menu déroulant ────────────────────────────────────────────────
function MenuDeroulant({ isAdmin, onNav, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if(ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  const items = [
    { id:"profil",       emoji:"👤", label:"Mon profil",        desc:"Modifier mes informations" },
    { id:"membres",      emoji:"👥", label:"Annuaire membres",  desc:"Voir tous les membres" },
    ...(isAdmin?[{ id:"admin", emoji:"⚙️", label:"Paramètres admin", desc:"Gérer l'application" }]:[]),
    { id:"deconnexion",  emoji:"🚪", label:"Déconnexion",        desc:"", danger:true },
  ];
  return (
    <div ref={ref} style={{ position:"absolute", top:"100%", right:0, width:240, background:C.blanc, borderRadius:14, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", border:"1px solid #D4C9B0", zIndex:200, overflow:"hidden", marginTop:6 }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid #E8E0D0", background:C.primary }}>
        <div style={{ fontFamily:"'Playfair Display', serif", color:"#fff", fontSize:13, fontWeight:700 }}>{currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Membre"}</div>
        <div style={{ color:"#A8B8D8", fontSize:11, marginTop:2 }}>{currentUser?.email||""}</div>
        {isAdmin && <span style={{ ...S.badge, background:C.secondary+"33", color:C.secondary, fontSize:9, marginTop:4 }}>Admin</span>}
      </div>
      {items.map(item => (
        <button key={item.id} onClick={()=>{onNav(item.id);onClose();}} style={{ width:"100%", padding:"11px 14px", border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:10, textAlign:"left", borderBottom:item.id==="deconnexion"?"none":"1px solid #F0EAE0" }}>
          <span style={{ fontSize:18, flexShrink:0 }}>{item.emoji}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:item.danger?C.secondary:C.primary }}>{item.label}</div>
            {item.desc && <div style={{ fontSize:11, color:C.grisChaud }}>{item.desc}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Modales profil / membres / admin ─────────────────────────────
function ModalProfil({ onClose, showToast, currentUser, setCurrentUser }) {
  const [f, setF] = useState({ prenom: currentUser?.prenom||"", nom: currentUser?.nom||"", email: currentUser?.email||"", role: currentUser?.role||"", adresse: currentUser?.adresse||"" });
  const s = (k,v) => setF(x=>({...x,[k]:v}));
  const initials = f.prenom&&f.nom ? `${f.prenom[0]}${f.nom[0]}` : "?";
  const save = async () => {
    if(!currentUser?.id) return;
    const payload = { prenom:f.prenom, nom:f.nom, role:f.role, adresse:f.adresse };
    await supabase.from("membres").update(payload).eq("id", currentUser.id);
    setCurrentUser(u=>({...u,...payload}));
    showToast("Profil mis à jour ✓"); onClose();
  };
  return (
    <Modal title="Mon profil" onClose={onClose}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:20, margin:"0 auto 18px" }}>{initials}</div>
      <label style={S.label}>Prénom</label><input style={S.input} value={f.prenom} onChange={e=>s("prenom",e.target.value)}/>
      <label style={S.label}>Nom</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
      <label style={S.label}>Email</label><input style={{ ...S.input, opacity:0.6 }} value={f.email} disabled/>
      <label style={S.label}>Rôle</label><input style={S.input} value={f.role} onChange={e=>s("role",e.target.value)}/>
      <label style={S.label}>Adresse</label><input style={S.input} value={f.adresse} onChange={e=>s("adresse",e.target.value)}/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={onClose}>Annuler</button>
    </Modal>
  );
}

function ModalMembres({ isAdmin, onClose, showToast }) {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("membres").select("*").order("nom").then(({data})=>{ setMembres(data||[]); setLoading(false); });
  }, []);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const Form = ({ init }) => {
    const [f, setF] = useState(init||{ prenom:"", nom:"", email:"", role:"", adresse:"", is_admin:false });
    const s = (k,v) => setF(x=>({...x,[k]:v}));
    const save = async () => {
      if(!f.prenom||!f.nom) return;
      const payload = { prenom:f.prenom, nom:f.nom, email:f.email, role:f.role, adresse:f.adresse, is_admin:f.is_admin };
      if(f.id) {
        await supabase.from("membres").update(payload).eq("id",f.id);
        setMembres(m=>m.map(x=>x.id===f.id?{...x,...payload}:x));
      } else {
        const { data } = await supabase.from("membres").insert([payload]).select().single();
        if(data) setMembres(m=>[...m,data]);
      }
      showToast(f.id?"Modifié ✓":"Ajouté ✓"); setModal(null);
    };
    return (
      <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"flex-end" }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} onClick={()=>setModal(null)}/>
        <div style={{ position:"relative", width:"100%", maxWidth:480, margin:"0 auto", background:C.parchemin, borderRadius:"18px 18px 0 0", padding:"20px 18px 36px", maxHeight:"85vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16, color:C.primary }}>{f.id?"Modifier":"Nouveau membre"}</div>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.grisChaud }}>×</button>
          </div>
          <label style={S.label}>Prénom *</label><input style={S.input} value={f.prenom} onChange={e=>s("prenom",e.target.value)}/>
          <label style={S.label}>Nom *</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
          <label style={S.label}>Email</label><input style={S.input} value={f.email} onChange={e=>s("email",e.target.value)}/>
          <label style={S.label}>Rôle</label><input style={S.input} value={f.role} onChange={e=>s("role",e.target.value)} placeholder="1ère trompe"/>
          <label style={S.label}>Adresse</label><input style={S.input} value={f.adresse} onChange={e=>s("adresse",e.target.value)}/>
          {isAdmin && <label style={{ ...S.label, display:"flex", alignItems:"center", gap:8, textTransform:"none", fontSize:13, marginBottom:14 }}><input type="checkbox" checked={f.is_admin} onChange={e=>s("is_admin",e.target.checked)} style={{ width:16, height:16 }}/>Administrateur</label>}
          <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Ajouter"}</button>
          <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
        </div>
      </div>
    );
  };
  return (
    <Modal title="Annuaire membres" onClose={onClose}>
      {loading ? <Spinner/> : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {membres.map(m => (
          <div key={m.id} style={{ ...S.card, padding:"10px 12px", marginBottom:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12, marginBottom:6 }}>{m.prenom[0]}{m.nom[0]}</div>
              {isAdmin && (
                <div style={{ display:"flex", gap:3 }}>
                  <button onClick={()=>setModal(m)} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"2px 5px", borderRadius:5, fontSize:11 }}>✏️</button>
                  <button onClick={()=>setConfirm(m)} style={{ background:C.rougeClair, border:"none", cursor:"pointer", padding:"2px 5px", borderRadius:5, fontSize:11 }}>🗑</button>
                </div>
              )}
            </div>
            <div style={{ fontWeight:600, color:C.primary, fontSize:12 }}>{m.prenom} {m.nom}</div>
            <div style={{ fontSize:10, color:C.grisChaud, marginTop:1 }}>{m.role}</div>
            {m.is_admin && <span style={{ ...S.badge, background:C.rougeClair, color:C.secondary, fontSize:8, marginTop:3 }}>Admin</span>}
            {m.adresse && <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid #E8E0D0" }}><a href={`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, color:C.secondary, textDecoration:"none" }}>📍 {m.adresse}</a></div>}
          </div>
        ))}
      </div>
      </div>}
      {isAdmin && <button style={S.btnP} onClick={()=>setModal({new:true})}>+ Ajouter un membre</button>}
      {modal && !modal.new && <Form init={modal}/>}
      {modal?.new && <Form init={null}/>}
      {confirm && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.blanc, borderRadius:16, padding:24, margin:20 }}>
            <div style={{ fontSize:14, marginBottom:16 }}>Supprimer {confirm.prenom} {confirm.nom} ?</div>
            <button style={S.btnD} onClick={()=>{supabase.from("membres").delete().eq("id",confirm.id).then(()=>{ setMembres(m=>m.filter(x=>x.id!==confirm.id));showToast("Supprimé ✓");setConfirm(null); });}}>Supprimer</button>
            <button style={S.btnS} onClick={()=>setConfirm(null)}>Annuler</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Modal Admin avec icônes ───────────────────────────────────────
function ModalAdmin({ onClose, apparence, setApparence, showToast }) {
  const [page, setPage] = useState(null);
  const [local, setLocal] = useState({...apparence});
  const s = (k,v) => setLocal(a=>({...a,[k]:v}));
  const save = () => { setApparence(local); showToast("Enregistré ✓"); setPage(null); };

  const EMOJIS_EVENTS = ["🏆","🥇","🥈","🥉","🎺","🎶","🎵","🎸","🎼","🌟","⭐","🎯","🏅","🎖","🎉","🎪","🔔","🎀","🌲","🎗",""];
  const COLORS_BULLE = [
    {v:"#C8102E",l:"Rouge"},{v:"#1A1F6E",l:"Bleu marine"},{v:"#3949AB",l:"Bleu"},
    {v:"#7B1FA2",l:"Violet"},{v:"#1B5E20",l:"Vert"},{v:"#E65100",l:"Orange"},{v:"#212121",l:"Noir"},
  ];
  const COLORS_HEADER = [
    {v:"#1A1F6E",l:"Bleu marine"},{v:"#C8102E",l:"Rouge"},{v:"#1B2A1A",l:"Vert forêt"},
    {v:"#212121",l:"Noir"},{v:"#4A148C",l:"Violet"},{v:"#B71C1C",l:"Rouge foncé"},
  ];
  const COLORS_ACCENT = [
    {v:"#C8102E",l:"Rouge"},{v:"#C8860A",l:"Or"},{v:"#3949AB",l:"Bleu"},
    {v:"#7B1FA2",l:"Violet"},{v:"#E65100",l:"Orange"},{v:"#ffffff",l:"Blanc"},
  ];
  const ICONS_BULLE = ["▶","🎶","🎵","🎺","♪","🔊",""];

  const IconRow = ({ label, k, bg }) => (
    <div style={{ marginBottom:14 }}>
      <div style={S.label}>{label}</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {EMOJIS_EVENTS.map((o,i) => (
          <button key={i} onClick={()=>s(k,o)} style={{ width:38, height:38, borderRadius:8, border:local[k]===o?`2px solid ${C.secondary}`:"1px solid #D4C9B0", background:local[k]===o?bg:C.blanc, cursor:"pointer", fontSize:o?18:11, color:o?"inherit":C.grisChaud, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {o||"∅"}
          </button>
        ))}
      </div>
    </div>
  );

  const ColorRow = ({ options, k }) => (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18 }}>
      {options.map(o => (
        <div key={o.v} onClick={()=>s(k,o.v)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:o.v, border:local[k]===o.v?"3px solid #333":"2px solid #D4C9B0" }}/>
          <span style={{ fontSize:9, color:C.grisChaud }}>{o.l}</span>
        </div>
      ))}
    </div>
  );

  const MENU = [
    { id:"audio",  e:"🔴", l:"Bulle audio",       d:"Couleur et icône des fichiers audio" },
    { id:"icones", e:"🏆", l:"Icônes événements", d:"Concours, concerts, stages, résultats" },
    { id:"header", e:"🎨", l:"Couleur du header", d:"Fond de la barre de navigation" },
    { id:"accent", e:"✨", l:"Couleur accent",     d:"Boutons et soulignements" },
    { id:"autres", e:"📧", l:"Autres réglages",   d:"Notifications, invitations, export" },
  ];

  if (!page) return (
    <Modal title="Paramètres admin" onClose={onClose}>
      {MENU.map(item => (
        <div key={item.id} onClick={()=>setPage(item.id)} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, cursor:"pointer", marginBottom:8 }}>
          <span style={{ fontSize:24 }}>{item.e}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, color:C.primary, fontSize:13 }}>{item.l}</div>
            <div style={{ fontSize:11, color:C.grisChaud }}>{item.d}</div>
          </div>
          <span style={{ color:C.grisChaud, fontSize:18 }}>›</span>
        </div>
      ))}
      <button style={S.btnS} onClick={onClose}>Fermer</button>
    </Modal>
  );

  if (page==="audio") return (
    <Modal title="Bulle audio" onClose={()=>setPage(null)}>
      <div style={{ display:"flex", alignItems:"center", gap:12, background:"#F0F0F0", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", background:local.bulleColor, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:700, boxShadow:`0 3px 10px ${local.bulleColor}60`, flexShrink:0 }}>{local.bulleIcon}</div>
        <div><div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13 }}>La Royale — Aperçu</div><div style={{ fontSize:11, color:C.grisChaud }}>Fanfare · 3.2 Mo</div></div>
      </div>
      <label style={S.label}>Icône</label>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
        {ICONS_BULLE.map((o,i) => (
          <button key={i} onClick={()=>s("bulleIcon",o)} style={{ width:52, height:52, borderRadius:10, border:local.bulleIcon===o?`2px solid ${C.secondary}`:"1px solid #D4C9B0", background:local.bulleIcon===o?C.rougeClair:C.blanc, cursor:"pointer", fontSize:o?22:12, color:o?"inherit":C.grisChaud, display:"flex", alignItems:"center", justifyContent:"center" }}>{o||"∅"}</button>
        ))}
      </div>
      <label style={S.label}>Couleur</label>
      <ColorRow options={COLORS_BULLE} k="bulleColor"/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  if (page==="icones") return (
    <Modal title="Icônes événements" onClose={()=>setPage(null)}>
      <div style={{ fontSize:12, color:C.grisChaud, marginBottom:14 }}>∅ = aucune icône affichée</div>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13, marginBottom:10 }}>Résultats concours</div>
      <IconRow label="Classement général" k="iconeGlobal"  bg={C.rougeClair}/>
      <IconRow label="Radoux"             k="iconeRadoux"  bg={C.bleuClair}/>
      <IconRow label="Basse"              k="iconeBasse"   bg="#EDE7F6"/>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13, margin:"6px 0 10px" }}>Types d'événements</div>
      <IconRow label="Concours"    k="iconeConcours"   bg={C.rougeClair}/>
      <IconRow label="Concerts"    k="iconeConcert"    bg="#EDE7F6"/>
      <IconRow label="Stages"      k="iconeStage"      bg={C.bleuClair}/>
      <IconRow label="Répétitions" k="iconeRepetition" bg="#E8E0D0"/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  if (page==="header") return (
    <Modal title="Couleur du header" onClose={()=>setPage(null)}>
      <div style={{ height:56, borderRadius:12, background:local.headerColor, marginBottom:20, display:"flex", alignItems:"center", paddingLeft:16 }}>
        <span style={{ color:"#fff", fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14 }}>Les Échos d'Occitanie</span>
      </div>
      <ColorRow options={COLORS_HEADER} k="headerColor"/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  if (page==="accent") return (
    <Modal title="Couleur accent" onClose={()=>setPage(null)}>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <div style={{ height:36, flex:1, borderRadius:8, background:local.accentColor }}/>
        <div style={{ height:36, flex:1, borderRadius:8, background:local.accentColor, opacity:0.3 }}/>
        <div style={{ width:36, height:36, borderRadius:"50%", background:local.accentColor }}/>
      </div>
      <ColorRow options={COLORS_ACCENT} k="accentColor"/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  if (page==="autres") return (
    <Modal title="Autres réglages" onClose={()=>setPage(null)}>
      {[["📧","Inviter un membre","Envoyer un lien de connexion"],["🔔","Notifications","Gérer les alertes email"],["💾","Exporter","CSV ou JSON"]].map(([e,t,d])=>(
        <div key={t} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
          <span style={{ fontSize:22 }}>{e}</span>
          <div><div style={{ fontWeight:600, color:C.primary, fontSize:13 }}>{t}</div><div style={{ fontSize:11, color:C.grisChaud }}>{d}</div></div>
        </div>
      ))}
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );
  return null;
}

// ── ACCUEIL ───────────────────────────────────────────────────────
function AccueilTab({ favoris, favorisEvents=[], allEvents=EVENTS, apparence={} }) {
  const today = new Date();
  const upcoming = allEvents.filter(e=>new Date(e.date)>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const nextRep = upcoming.find(e=>e.type==="repetition");
  const next3 = upcoming.filter(e=>e.type!=="repetition").slice(0,3);
  const dernierConcours = allEvents.filter(e=>e.type==="concours"&&new Date(e.date)<today).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const ap = apparence;

  const evIcons = { concert:ap.iconeConcert||"🎶", concours:ap.iconeConcours||"🏆", stage:ap.iconeStage||"🌲", repetition:ap.iconeRepetition||"🎺" };
  const evLabels = { concert:"Concert", concours:"Concours", stage:"Stage", repetition:"Répétition" };

  return (
    <div>
      {/* Prochaine répétition */}
      {nextRep && (
        <div style={{ background:ap.headerColor||C.primary, borderRadius:16, padding:"20px 18px", marginBottom:16, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-20, right:-20, opacity:0.07 }}><TrompeLogo size={120} color="#fff"/></div>
          <div style={{ fontSize:11, color:"#A8B8D8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Prochaine répétition</div>
          <div style={{ fontFamily:"'Playfair Display', serif", color:"#fff", fontSize:20, fontWeight:700, marginBottom:4, textTransform:"capitalize" }}>{fd(nextRep.date)}</div>
          <div style={{ color:"#C8D8F0", fontSize:13 }}>🕐 {nextRep.heure}</div>
          <div style={{ color:"#C8D8F0", fontSize:13, marginTop:3 }}>📍 {nextRep.lieu}</div>
        </div>
      )}

      {/* Dernier concours pleine largeur */}
      {dernierConcours && (
        <div style={{ background:C.blanc, border:"1px solid #D4C9B0", borderRadius:16, padding:"18px", marginBottom:16, boxShadow:"0 1px 4px rgba(26,31,110,0.06)" }}>
          <div style={{ fontSize:11, color:C.grisChaud, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Dernier concours</div>
          <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:16, marginBottom:2 }}>{dernierConcours.titre||"Concours"}</div>
          <div style={{ fontSize:12, color:C.grisChaud, marginBottom:14 }}>{fds(dernierConcours.date)} · {dernierConcours.lieu}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {dernierConcours.placeGlobale && (
              <div style={{ display:"flex", alignItems:"center", gap:12, background:C.rougeClair, borderRadius:10, padding:"10px 14px" }}>
                {ap.iconeGlobal && <span style={{ fontSize:24, flexShrink:0 }}>{ap.iconeGlobal}</span>}
                <div>
                  <div style={{ fontSize:10, color:C.grisChaud, textTransform:"uppercase", letterSpacing:"0.05em" }}>Classement général</div>
                  <div style={{ fontWeight:700, color:C.secondary, fontSize:16 }}>{dernierConcours.placeGlobale} prix</div>
                </div>
              </div>
            )}
            {dernierConcours.placeRadoux && (
              <div style={{ display:"flex", alignItems:"center", gap:12, background:C.bleuClair, borderRadius:10, padding:"10px 14px" }}>
                {ap.iconeRadoux && <span style={{ fontSize:24, flexShrink:0 }}>{ap.iconeRadoux}</span>}
                <div>
                  <div style={{ fontSize:10, color:C.grisChaud, textTransform:"uppercase", letterSpacing:"0.05em" }}>Radoux</div>
                  <div style={{ fontWeight:700, color:C.primary, fontSize:16 }}>{dernierConcours.placeRadoux} prix</div>
                </div>
              </div>
            )}
            {dernierConcours.placeBasse && (
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"#EDE7F6", borderRadius:10, padding:"10px 14px" }}>
                {ap.iconeBasse && <span style={{ fontSize:24, flexShrink:0 }}>{ap.iconeBasse}</span>}
                <div>
                  <div style={{ fontSize:10, color:C.grisChaud, textTransform:"uppercase", letterSpacing:"0.05em" }}>Basse</div>
                  <div style={{ fontWeight:700, color:"#4527A0", fontSize:16 }}>{dernierConcours.placeBasse} prix</div>
                </div>
              </div>
            )}
          </div>
          {dernierConcours.noteAdmin && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #E8E0D0", fontSize:13, color:C.primary, lineHeight:1.7, fontStyle:"italic" }}>{dernierConcours.noteAdmin}</div>
          )}
        </div>
      )}

      {/* Fanfares concours épinglées */}
      {favoris.length>0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ ...S.secTitle, display:"flex", alignItems:"center", gap:8 }}><span>⭐</span> Fanfares concours</div>
          {favoris.map(f => (
            <div key={f.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
              <button style={{ width:40, height:40, borderRadius:"50%", border:"none", cursor:"pointer", background:ap.bulleColor||C.secondary, color:"#fff", fontSize:16, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{ap.bulleIcon||"▶"}</button>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13 }}>{f.nom}</div>
                <div style={{ fontSize:11, color:C.grisChaud }}>Fanfare concours · {f.taille}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Épinglés sur l'accueil */}
      {favorisEvents.length>0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ ...S.secTitle, display:"flex", alignItems:"center", gap:8 }}><span>📌</span> À la une</div>
          {favorisEvents.map(ev => {
            const sc = SUB[ev.type];
            return (
              <div key={ev.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:sc.light, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18 }}>{evIcons[ev.type]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:C.primary, fontSize:13 }}>{ev.titre||evLabels[ev.type]}</div>
                  <div style={{ fontSize:11, color:C.grisChaud, marginTop:2, textTransform:"capitalize" }}>{fd(ev.date)} · {ev.heure}</div>
                </div>
                <span style={{ ...S.badge, background:sc.light, color:sc.text }}>{evLabels[ev.type]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* 3 prochains événements */}
      {next3.length>0 && (
        <div>
          <div style={S.secTitle}>Prochains événements</div>
          {next3.map(ev => {
            const sc = SUB[ev.type];
            return (
              <div key={ev.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:sc.light, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:18 }}>{evIcons[ev.type]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:C.primary, fontSize:13 }}>{ev.titre||evLabels[ev.type]}</div>
                  <div style={{ fontSize:11, color:C.grisChaud, marginTop:2, textTransform:"capitalize" }}>{fd(ev.date)} · {ev.heure}</div>
                </div>
                <span style={{ ...S.badge, background:sc.light, color:sc.text }}>{evLabels[ev.type]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── AGENDA ────────────────────────────────────────────────────────
function AgendaTab({ isAdmin, showToast, onFavorisChange, allEvents, setAllEvents, apparence={} }) {
  const events = allEvents||EVENTS;
  const setEvents = setAllEvents||(()=>{});
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [subTab, setSubTab] = useState("avenir");
  const today = new Date();
  const ap = apparence;

  const upcoming = events.filter(e=>new Date(e.date)>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const past     = events.filter(e=>new Date(e.date)<today).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const pastConcours = past.filter(e=>e.type==="concours");

  const toggleFav = async (id) => {
    const ev = events.find(e=>e.id===id);
    if(!ev) return;
    const newFav = !ev.favori;
    await supabase.from("evenements").update({ favori: newFav }).eq("id", id);
    const updated = events.map(e=>e.id===id?{...e,favori:newFav}:e);
    setEvents(updated);
    if(onFavorisChange) onFavorisChange(updated.filter(e=>e.favori));
  };

  const save = async (f) => {
    const payload = {
      type: f.type, titre: f.titre||"", date: f.date,
      heure: f.heure, lieu: f.lieu, note: f.note||"",
      favori: f.favori||false, note_admin: f.noteAdmin||"",
      place_globale: f.placeGlobale||"", place_radoux: f.placeRadoux||"", place_basse: f.placeBasse||"",
    };
    if(f.id) {
      await supabase.from("evenements").update(payload).eq("id", f.id);
      const updated = events.map(e=>e.id===f.id?{...f}:e);
      setEvents(updated); if(onFavorisChange) onFavorisChange(updated.filter(e=>e.favori));
    } else {
      const { data } = await supabase.from("evenements").insert([payload]).select().single();
      if(data) {
        const nev = {...f, id:data.id, noteAdmin:"", placeGlobale:"", placeRadoux:"", placeBasse:""};
        const updated = [...events, nev];
        setEvents(updated); if(onFavorisChange) onFavorisChange(updated.filter(e=>e.favori));
      }
    }
    showToast(f.id?"Modifié ✓":"Ajouté ✓"); setModal(null);
  };

  const getList = () => {
    if(subTab==="avenir")   return upcoming;
    if(subTab==="concerts") return [...upcoming,...past].filter(e=>e.type==="concert");
    if(subTab==="concours") return upcoming.filter(e=>e.type==="concours");
    if(subTab==="stages")   return [...upcoming,...past].filter(e=>e.type==="stage");
    if(subTab==="palmares") return pastConcours;
    return [];
  };

  const SUBTABS = [
    { id:"avenir",   l:"À venir",    color:C.primary },
    { id:"concerts", l:"Concerts",   color:"#4527A0" },
    { id:"concours", l:"Concours",   color:C.secondary },
    { id:"stages",   l:"Stages",     color:C.bleuMoyen },
    { id:"palmares", l:"🏆 Palmarès", color:"#8B0000" },
  ];
  const LABELS = { concert:"Concert", repetition:"Répétition", concours:"Concours", stage:"Stage" };

  const EF = ({ init }) => {
    const [f, setF] = useState(init||{ type:"repetition", titre:"", date:"", heure:"", lieu:"", note:"", placeGlobale:"", placeRadoux:"", placeBasse:"" });
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    return (
      <Modal title={f.id?"Modifier":"Nouvel événement"} onClose={()=>setModal(null)}>
        <label style={S.label}>Type</label>
        <select style={S.select} value={f.type} onChange={e=>s("type",e.target.value)}>
          <option value="repetition">Répétition</option><option value="concert">Concert</option><option value="concours">Concours</option><option value="stage">Stage</option>
        </select>
        <label style={S.label}>Titre</label><input style={S.input} value={f.titre||""} onChange={e=>s("titre",e.target.value)} placeholder="Optionnel"/>
        <label style={S.label}>Date *</label><input type="date" style={S.input} value={f.date} onChange={e=>s("date",e.target.value)}/>
        <label style={S.label}>Heure</label><input style={S.input} value={f.heure} onChange={e=>s("heure",e.target.value)} placeholder="18h30"/>
        <label style={S.label}>Lieu *</label><input style={S.input} value={f.lieu} onChange={e=>s("lieu",e.target.value)}/>
        <label style={S.label}>Note / résultat</label><input style={S.input} value={f.note} onChange={e=>s("note",e.target.value)} placeholder="1er prix…"/>
        {f.type==="concours" && <>
          <label style={S.label}>Place générale</label><input style={S.input} value={f.placeGlobale||""} onChange={e=>s("placeGlobale",e.target.value)} placeholder="1er"/>
          <label style={S.label}>Place Radoux</label><input style={S.input} value={f.placeRadoux||""} onChange={e=>s("placeRadoux",e.target.value)} placeholder="2ème"/>
          <label style={S.label}>Place Basse</label><input style={S.input} value={f.placeBasse||""} onChange={e=>s("placeBasse",e.target.value)} placeholder="1er"/>
        </>}
        <button style={S.btnP} onClick={()=>f.date&&f.lieu&&save(f)}>{f.id?"Enregistrer":"Ajouter"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  const list = getList();

  return (
    <>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:12, marginBottom:8, scrollbarWidth:"none" }}>
        {SUBTABS.map(st => (
          <button key={st.id} onClick={()=>setSubTab(st.id)} style={{ padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer", whiteSpace:"nowrap", fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:subTab===st.id?700:400, background:subTab===st.id?st.color:"#E8E0D0", color:subTab===st.id?"#fff":C.grisChaud, transition:"all 0.18s", flexShrink:0 }}>{st.l}</button>
        ))}
      </div>

      {subTab==="palmares" ? (
        <div>
          {list.map((ev, i) => {
            const [editNote, setEditNote] = useState(false);
            return (
              <div key={ev.id} style={{ ...S.card, borderLeft:`4px solid ${i===0?C.secondary:"#D4C9B0"}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:14 }}>{ev.titre}</div>
                    <div style={{ fontSize:11, color:C.grisChaud }}>{fds(ev.date)} · {ev.lieu}</div>
                  </div>
                  {i===0 && <span style={{ ...S.badge, background:C.rougeClair, color:C.secondary }}>Dernier</span>}
                  {isAdmin && <AA onEdit={()=>setModal(ev)} onDelete={()=>setConfirm(ev)}/>}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                  {ev.placeGlobale && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, background:C.rougeClair, borderRadius:8, padding:"7px 12px" }}>
                      {ap.iconeGlobal && <span style={{ fontSize:18 }}>{ap.iconeGlobal}</span>}
                      <div><div style={{ fontSize:10, color:C.grisChaud, textTransform:"uppercase" }}>Classement général</div><div style={{ fontWeight:700, color:C.secondary, fontSize:14 }}>{ev.placeGlobale} prix</div></div>
                    </div>
                  )}
                  {ev.placeRadoux && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, background:C.bleuClair, borderRadius:8, padding:"7px 12px" }}>
                      {ap.iconeRadoux && <span style={{ fontSize:18 }}>{ap.iconeRadoux}</span>}
                      <div><div style={{ fontSize:10, color:C.grisChaud, textTransform:"uppercase" }}>Radoux</div><div style={{ fontWeight:700, color:C.primary, fontSize:14 }}>{ev.placeRadoux} prix</div></div>
                    </div>
                  )}
                  {ev.placeBasse && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, background:"#EDE7F6", borderRadius:8, padding:"7px 12px" }}>
                      {ap.iconeBasse && <span style={{ fontSize:18 }}>{ap.iconeBasse}</span>}
                      <div><div style={{ fontSize:10, color:C.grisChaud, textTransform:"uppercase" }}>Basse</div><div style={{ fontWeight:700, color:"#4527A0", fontSize:14 }}>{ev.placeBasse} prix</div></div>
                    </div>
                  )}
                </div>
                {isAdmin && !editNote && (
                  <button onClick={()=>setEditNote(true)} style={{ background:"none", border:"1px dashed #D4C9B0", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, color:C.grisChaud, width:"100%", textAlign:"left" }}>
                    {ev.noteAdmin||"＋ Ajouter une note (visible sur l'accueil)"}
                  </button>
                )}
                {isAdmin && editNote && (
                  <textarea defaultValue={ev.noteAdmin||""} autoFocus placeholder="Note sur ce concours…" style={{ ...S.input, minHeight:70, resize:"vertical", marginBottom:6 }}
                    onBlur={e=>{const val=e.target.value; supabase.from("evenements").update({note_admin:val}).eq("id",ev.id).then(()=>{ setEvents(events.map(x=>x.id===ev.id?{...x,noteAdmin:val}:x));setEditNote(false);showToast("Note enregistrée ✓"); });}}
                  />
                )}
                {!isAdmin && ev.noteAdmin && (
                  <div style={{ fontSize:13, color:C.primary, fontStyle:"italic", paddingTop:8, borderTop:"1px solid #E8E0D0" }}>{ev.noteAdmin}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {list.length===0 && <div style={{ color:C.grisChaud, fontSize:13, paddingTop:20 }}>Aucun événement.</div>}
          {subTab==="avenir" && list.filter(e=>e.type==="repetition").length>0 && (
            <div style={{ background:C.bleuClair, border:`1px solid ${C.primary}30`, borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:11, color:C.primary, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>📅 Répétitions à venir</div>
              {list.filter(e=>e.type==="repetition").map(ev => (
                <div key={ev.id} style={{ display:"flex", alignItems:"center", paddingBottom:6, marginBottom:6, borderBottom:`1px solid ${C.primary}20` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:C.primary, fontSize:13, textTransform:"capitalize" }}>{fd(ev.date)}</div>
                    <div style={{ fontSize:11, color:C.bleuMoyen }}>🕐 {ev.heure} · {ev.lieu}</div>
                  </div>
                  {isAdmin && <AA onEdit={()=>setModal(ev)} onDelete={()=>setConfirm(ev)}/>}
                </div>
              ))}
            </div>
          )}
          {list.filter(e=>e.type!=="repetition").map(ev => {
            const sc = SUB[ev.type];
            return (
              <div key={ev.id} style={S.card}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <span style={{ ...S.badge, background:sc.light, color:sc.text, marginBottom:6 }}>{LABELS[ev.type]}</span>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:14, textTransform:"capitalize" }}>{fd(ev.date)}</div>
                    <div style={{ fontSize:12, color:C.grisChaud, marginTop:3 }}>🕐 {ev.heure} — {ev.lieu}</div>
                    {ev.note && <div style={{ fontSize:12, color:C.secondary, fontWeight:600, marginTop:5 }}>{ev.note}</div>}
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    <button onClick={e=>{e.stopPropagation();toggleFav(ev.id);}} style={{ background:ev.favori?"#FDF3E3":"#F5F5F5", border:"none", cursor:"pointer", padding:"5px 7px", borderRadius:6, fontSize:14 }} title="Épingler sur l'accueil">{ev.favori?"⭐":"☆"}</button>
                    {isAdmin && <AA onEdit={()=>setModal(ev)} onDelete={()=>setConfirm(ev)}/>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isAdmin && <BtnPlus onClick={()=>setModal("new")}/>}
      {modal && <EF init={modal==="new"?null:modal}/>}
      {confirm && <Confirm msg="Supprimer cet événement ?" onConfirm={()=>{supabase.from("evenements").delete().eq("id",confirm.id).then(()=>{ setEvents(events.filter(e=>e.id!==confirm.id));showToast("Supprimé ✓");setConfirm(null); });}} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── BIBLIO ────────────────────────────────────────────────────────
function BiblioTab({ isAdmin, showToast, favoris, setFavoris, apparence={} }) {
  const [dossiers, setDossiers] = useState(BIBLIO_D);
  const [fichiers, setFichiers] = useState(BIBLIO_F);
  const [actif, setActif] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const ap = apparence;

  const EMOJIS = ["🎺","🎵","🎹","🎛","📄","📁","🏆","🎶"];
  const COLS   = [C.primary, C.secondary, C.bleuMoyen, "#4527A0","#8B0000","#333"];

  const toggleFav = (f) => {
    const nv = !f.favori;
    setFichiers(fs=>fs.map(x=>x.id===f.id?{...x,favori:nv}:x));
    if(nv) setFavoris(prev=>[...prev,{...f,favori:true}]);
    else   setFavoris(prev=>prev.filter(x=>x.id!==f.id));
    showToast(nv?"⭐ Ajouté aux fanfares concours":"Retiré des favoris");
  };

  const DF = ({ init }) => {
    const [f, setF] = useState(init||{ nom:"", emoji:"📁", color:C.primary });
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const save=()=>{
      if(!f.nom) return;
      if(f.id) setDossiers(d=>d.map(x=>x.id===f.id?f:x)); else setDossiers(d=>[...d,{...f,id:Date.now()}]);
      showToast(f.id?"Modifié ✓":"Dossier créé ✓"); setModal(null);
    };
    return (
      <Modal title={f.id?"Modifier":"Nouveau dossier"} onClose={()=>setModal(null)}>
        <label style={S.label}>Nom *</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
        <label style={S.label}>Icône</label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {EMOJIS.map(e=><button key={e} onClick={()=>s("emoji",e)} style={{ width:36, height:36, borderRadius:8, border:f.emoji===e?`2px solid ${C.secondary}`:"1px solid #D4C9B0", background:f.emoji===e?C.rougeClair:C.blanc, cursor:"pointer", fontSize:18 }}>{e}</button>)}
        </div>
        <label style={S.label}>Couleur</label>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {COLS.map(col=><button key={col} onClick={()=>s("color",col)} style={{ width:28, height:28, borderRadius:"50%", border:f.color===col?"3px solid #333":"2px solid transparent", background:col, cursor:"pointer" }}/>)}
        </div>
        <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Créer"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  const FF = ({ init }) => {
    const did = actif?.id||dossiers[0]?.id;
    const [f, setF] = useState(init||{ dossier_id:did, nom:"", type:"audio", url:"", taille:"" });
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const save=()=>{
      if(!f.nom) return;
      if(f.id) setFichiers(fs=>fs.map(x=>x.id===f.id?f:x)); else setFichiers(fs=>[...fs,{...f,id:Date.now(),favori:false}]);
      showToast("Fichier ajouté ✓"); setModal(null);
    };
    return (
      <Modal title={f.id?"Modifier":"Nouveau fichier"} onClose={()=>setModal(null)}>
        <label style={S.label}>Dossier</label>
        <select style={S.select} value={f.dossier_id} onChange={e=>s("dossier_id",parseInt(e.target.value))}>
          {dossiers.map(d=><option key={d.id} value={d.id}>{d.emoji} {d.nom}</option>)}
        </select>
        <label style={S.label}>Type</label>
        <select style={S.select} value={f.type} onChange={e=>s("type",e.target.value)}>
          <option value="audio">Audio</option><option value="pdf">PDF</option><option value="midi">MIDI</option><option value="autre">Autre</option>
        </select>
        <label style={S.label}>Nom *</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
        <label style={S.label}>URL</label><input style={S.input} value={f.url} onChange={e=>s("url",e.target.value)} placeholder="https://drive.google.com/…"/>
        <label style={S.label}>Taille</label><input style={S.input} value={f.taille} onChange={e=>s("taille",e.target.value)} placeholder="2.4 Mo"/>
        <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Ajouter"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  if(!actif) return (
    <>
      <DossierGrid
        dossiers={dossiers.map(d=>({...d,count:fichiers.filter(f=>f.dossier_id===d.id).length,countLabel:"fichier(s)"}))}
        onOpen={setActif} isAdmin={isAdmin}
        onEdit={d=>setModal({t:"dossier",data:d})}
        onDelete={d=>setConfirm({id:d.id,t:"dossier",msg:`Supprimer "${d.nom}" ?`})}
      />
      {isAdmin && <BtnPlus onClick={()=>setModal({t:"choix"})}/>}
      {modal?.t==="choix" && (
        <Modal title="Ajouter…" onClose={()=>setModal(null)}>
          {[["dossier","📁","Nouveau dossier"],["fichier","📎","Nouveau fichier"]].map(([id,e,t])=>(
            <div key={id} onClick={()=>setModal({t:id})} style={{ ...S.card, cursor:"pointer", display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <span style={{ fontSize:22 }}>{e}</span><div style={{ fontWeight:700, color:C.primary, fontSize:13 }}>{t}</div>
            </div>
          ))}
          <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
        </Modal>
      )}
      {modal?.t==="dossier" && !modal.data && <DF init={null}/>}
      {modal?.t==="dossier" && modal.data && <DF init={modal.data}/>}
      {modal?.t==="fichier" && <FF init={null}/>}
      {confirm && <Confirm msg={confirm.msg} onConfirm={()=>{setDossiers(d=>d.filter(x=>x.id!==confirm.id));showToast("Supprimé ✓");setConfirm(null);}} onClose={()=>setConfirm(null)}/>}
    </>
  );

  const contenu = fichiers.filter(f=>f.dossier_id===actif.id);
  return (
    <>
      <Breadcrumb items={[`${actif.emoji} ${actif.nom}`]} onBack={()=>setActif(null)}/>
      {contenu.length===0 && <div style={{ color:C.grisChaud, fontSize:13 }}>Dossier vide — bouton + pour ajouter.</div>}
      {contenu.map(f => {
        if(f.type==="audio") return <AudioCard key={f.id} nom={f.nom} taille={f.taille} favori={f.favori} playing={playing===f.id} onPlay={()=>setPlaying(playing===f.id?null:f.id)} onFavori={()=>toggleFav(f)} onEdit={()=>setModal({t:"fichier",data:f})} onDelete={()=>setConfirm({id:f.id,t:"fichier",msg:`Supprimer "${f.nom}" ?`})} isAdmin={isAdmin} bColor={ap.bulleColor} bIcon={ap.bulleIcon}/>;
        if(f.type==="pdf")   return <PdfCard  key={f.id} nom={f.nom} taille={f.taille} url={f.url} onEdit={()=>setModal({t:"fichier",data:f})} onDelete={()=>setConfirm({id:f.id,t:"fichier",msg:`Supprimer "${f.nom}" ?`})} isAdmin={isAdmin}/>;
        return <FileCard key={f.id} nom={f.nom} taille={f.taille} url={f.url} typeLabel={f.type==="midi"?"MIDI":"Fichier"} onEdit={()=>setModal({t:"fichier",data:f})} onDelete={()=>setConfirm({id:f.id,t:"fichier",msg:`Supprimer "${f.nom}" ?`})} isAdmin={isAdmin}/>;
      })}
      {isAdmin && <BtnPlus onClick={()=>setModal({t:"fichier"})}/>}
      {modal?.t==="fichier" && <FF init={modal.data||{dossier_id:actif.id,nom:"",type:"audio",url:"",taille:""}}/>}
      {confirm && <Confirm msg={confirm.msg} onConfirm={()=>{setFichiers(f=>f.filter(x=>x.id!==confirm.id));showToast("Supprimé ✓");setConfirm(null);}} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── RÉPÉTITION ────────────────────────────────────────────────────
function RepetitionTab({ isAdmin, showToast, apparence={} }) {
  const [dossiers, setDossiers] = useState(REP_D);
  const [actif, setActif] = useState(null);
  const [sousActif, setSousActif] = useState(null);
  const [openNote, setOpenNote] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const ap = apparence;

  const SDF = ({ init, dossierId }) => {
    const [f, setF] = useState(init||{ nom:"", date:new Date().toISOString().split("T")[0] });
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const dData = dossiers.find(x=>x.id===dossierId);
    const auto = f.date ? `${dData?.id==="dm"?"Séance":"Répétition"} ${new Date(f.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}` : "";
    const save=()=>{
      const nom = f.nom||auto; if(!nom) return;
      setDossiers(ds=>ds.map(d=>{
        if(d.id!==dossierId) return d;
        if(f.id) return {...d,sousDossiers:d.sousDossiers.map(s=>s.id===f.id?{...s,nom,date:f.date}:s)};
        return {...d,sousDossiers:[{id:Date.now().toString(),nom,date:f.date,notes:[]},...d.sousDossiers]};
      }));
      showToast("Dossier créé ✓"); setModal(null);
    };
    return (
      <Modal title={f.id?"Modifier":"Nouveau dossier"} onClose={()=>setModal(null)}>
        <label style={S.label}>Date de la séance *</label><input type="date" style={S.input} value={f.date} onChange={e=>s("date",e.target.value)}/>
        <label style={S.label}>Nom du dossier</label><input style={S.input} value={f.nom||""} onChange={e=>s("nom",e.target.value)} placeholder={auto}/>
        <div style={{ fontSize:11, color:C.grisChaud, marginBottom:12, marginTop:-6 }}>Laisse vide pour nommer automatiquement avec la date</div>
        <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Créer"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  const NF = ({ init, dossierId, sdId }) => {
    const [f, setF] = useState(init||{ titre:"", contenu:"" });
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const save=()=>{
      if(!f.titre||!f.contenu) return;
      setDossiers(ds=>ds.map(d=>{
        if(d.id!==dossierId) return d;
        return {...d,sousDossiers:d.sousDossiers.map(sd=>{
          if(sd.id!==sdId) return sd;
          if(f.id) return {...sd,notes:sd.notes.map(n=>n.id===f.id?f:n)};
          return {...sd,notes:[{...f,id:Date.now()},...sd.notes]};
        })};
      }));
      showToast(f.id?"Modifié ✓":"Publié ✓"); setModal(null);
    };
    return (
      <Modal title={f.id?"Modifier":"Nouvelle note"} onClose={()=>setModal(null)}>
        <label style={S.label}>Titre *</label><input style={S.input} value={f.titre} onChange={e=>s("titre",e.target.value)}/>
        <label style={S.label}>Contenu *</label>
        <textarea value={f.contenu} onChange={e=>s("contenu",e.target.value)} style={{ ...S.input, minHeight:130, resize:"vertical" }}/>
        <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Publier"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  // Niveau 1
  if(!actif) return <DossierGrid dossiers={dossiers.map(d=>({...d,count:d.sousDossiers.length,countLabel:"séance(s)"}))} onOpen={setActif} isAdmin={false}/>;

  const dData = dossiers.find(x=>x.id===actif.id);

  // Niveau 2
  if(!sousActif) return (
    <>
      <Breadcrumb items={[`${dData.emoji} ${dData.nom}`]} onBack={()=>setActif(null)}/>
      {dData.sousDossiers.length===0 && <div style={{ color:C.grisChaud, fontSize:13 }}>Aucune séance — bouton + pour en créer une.</div>}
      {dData.sousDossiers.map(sd => (
        <div key={sd.id} onClick={()=>setSousActif(sd)} style={{ ...S.card, cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:dData.color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, border:`1px solid ${dData.color}30` }}>📁</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:13 }}>{sd.nom}</div>
            <div style={{ fontSize:11, color:C.grisChaud, marginTop:2 }}>{sd.notes.length} note(s)</div>
          </div>
          {isAdmin && (
            <div style={{ display:"flex", gap:4 }} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setModal({t:"sd",data:sd})} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"4px 7px", borderRadius:6, fontSize:13 }}>✏️</button>
              <button onClick={()=>setConfirm({dossierId:actif.id,sdId:sd.id,msg:`Supprimer "${sd.nom}" ?`})} style={{ background:C.rougeClair, border:"none", cursor:"pointer", padding:"4px 7px", borderRadius:6, fontSize:13 }}>🗑</button>
            </div>
          )}
        </div>
      ))}
      {isAdmin && <BtnPlus onClick={()=>setModal({t:"sd"})}/>}
      {modal?.t==="sd" && <SDF init={modal.data||null} dossierId={actif.id}/>}
      {confirm && <Confirm msg={confirm.msg} onConfirm={()=>{setDossiers(ds=>ds.map(d=>d.id!==confirm.dossierId?d:{...d,sousDossiers:d.sousDossiers.filter(s=>s.id!==confirm.sdId)}));showToast("Supprimé ✓");setConfirm(null);}} onClose={()=>setConfirm(null)}/>}
    </>
  );

  // Niveau 3
  const sd = dData.sousDossiers.find(x=>x.id===sousActif.id);
  const toggleFavRep = (n) => {
    setDossiers(ds=>ds.map(d=>d.id!==actif.id?d:{...d,sousDossiers:d.sousDossiers.map(s=>s.id!==sd.id?s:{...s,notes:s.notes.map(x=>x.id===n.id?{...x,favori:!x.favori}:x)})}));
    showToast(!n.favori?"⭐ Ajouté aux favoris":"Retiré des favoris");
  };

  return (
    <>
      <Breadcrumb items={[`${dData.emoji} ${dData.nom}`, `› ${sd.nom}`]} onBack={()=>{setSousActif(null);setOpenNote(null);}}/>
      {sd.notes.length===0 && <div style={{ color:C.grisChaud, fontSize:13 }}>Aucune note — bouton + pour en créer une.</div>}
      {sd.notes.map(n => {
        const isAudio = n.type==="audio" || dData.id==="enreg";
        if(isAudio) return (
          <div key={n.id}>
            <AudioCard nom={n.titre} taille={n.duree||""} favori={n.favori||false} playing={openNote===n.id} onPlay={()=>setOpenNote(openNote===n.id?null:n.id)} onFavori={()=>toggleFavRep(n)} onEdit={()=>setModal({t:"note",data:n})} onDelete={()=>setConfirm({noteId:n.id,dossierId:actif.id,sdId:sd.id,msg:`Supprimer "${n.titre}" ?`})} isAdmin={isAdmin} bColor={ap.bulleColor} bIcon={ap.bulleIcon}/>
            {openNote===n.id && <div style={{ background:C.blanc, border:"1px solid #D4C9B0", borderRadius:10, padding:"12px 14px", marginTop:-6, marginBottom:10, fontSize:13, color:C.primary, lineHeight:1.8, whiteSpace:"pre-line" }}>{n.contenu}</div>}
          </div>
        );
        return (
          <div key={n.id} style={{ ...S.card, cursor:"pointer" }} onClick={()=>setOpenNote(openNote===n.id?null:n.id)}>
            <div style={{ display:"flex", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.primary, fontSize:14 }}>{n.titre}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                {isAdmin && (
                  <div style={{ display:"flex", gap:4 }} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setModal({t:"note",data:n})} style={{ background:C.bleuClair, border:"none", cursor:"pointer", padding:"4px 7px", borderRadius:6, fontSize:13 }}>✏️</button>
                    <button onClick={()=>setConfirm({noteId:n.id,dossierId:actif.id,sdId:sd.id,msg:`Supprimer "${n.titre}" ?`})} style={{ background:C.rougeClair, border:"none", cursor:"pointer", padding:"4px 7px", borderRadius:6, fontSize:13 }}>🗑</button>
                  </div>
                )}
                <span style={{ color:C.grisChaud, fontSize:16, transform:openNote===n.id?"rotate(180deg)":"none", transition:"0.2s" }}>▾</span>
              </div>
            </div>
            {openNote===n.id && <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #D4C9B0", fontSize:13, color:C.primary, lineHeight:1.8, whiteSpace:"pre-line" }}>{n.contenu}</div>}
          </div>
        );
      })}
      {isAdmin && <BtnPlus onClick={()=>setModal({t:"note"})}/>}
      {modal?.t==="note" && <NF init={modal.data||null} dossierId={actif.id} sdId={sd.id}/>}
      {confirm?.noteId && <Confirm msg={confirm.msg} onConfirm={()=>{setDossiers(ds=>ds.map(d=>d.id!==confirm.dossierId?d:{...d,sousDossiers:d.sousDossiers.map(s=>s.id!==confirm.sdId?s:{...s,notes:s.notes.filter(n=>n.id!==confirm.noteId)})}));showToast("Supprimé ✓");setConfirm(null);}} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── APP ───────────────────────────────────────────────────────────
const IcHome  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const IcCal   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcMusic = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IcRep   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>;

const TABS = [
  { id:"accueil",    l:"Accueil",    ic:<IcHome/> },
  { id:"agenda",     l:"Agenda",     ic:<IcCal/> },
  { id:"biblio",     l:"Biblio",     ic:<IcMusic/> },
  { id:"repetition", l:"Répétition", ic:<IcRep/> },
];

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = async () => {
    if(!email) return;
    setLoading(true);
    await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: window.location.origin } });
    setSent(true); setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", background:C.parchemin, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <TrompeLogo size={56} color={C.secondary}/>
      <div style={{ fontFamily:"'Playfair Display', serif", color:C.primary, fontSize:22, fontWeight:700, marginTop:16, textAlign:"center" }}>Les Échos d'Occitanie</div>
      <div style={{ color:C.grisChaud, fontSize:12, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:36 }}>Groupe de Trompe de Chasse</div>
      {!sent ? (
        <div style={{ width:"100%", maxWidth:320 }}>
          <div style={{ fontSize:13, color:C.primary, marginBottom:10, fontWeight:600 }}>Connexion par email</div>
          <input type="email" placeholder="ton@email.fr" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid #D4C9B0", fontSize:14, fontFamily:"Inter, sans-serif", background:C.blanc, boxSizing:"border-box", outline:"none", marginBottom:10, color:C.primary }}/>
          <button onClick={login} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", cursor:"pointer", background:C.primary, color:"#fff", fontWeight:700, fontSize:14, fontFamily:"Inter, sans-serif" }}>{loading?"Envoi…":"Recevoir le lien de connexion"}</button>
        </div>
      ) : (
        <div style={{ textAlign:"center", maxWidth:280 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📬</div>
          <div style={{ fontWeight:700, color:C.primary, fontSize:15, marginBottom:8 }}>Lien envoyé !</div>
          <div style={{ fontSize:13, color:C.grisChaud, lineHeight:1.6 }}>Consulte ta boîte mail et clique sur le lien pour accéder à l'application.</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState("accueil");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalMenu, setModalMenu] = useState(null);
  const [favoris, setFavoris] = useState([]);
  const [favorisEvents, setFavorisEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [apparence, setApparenceState] = useState({
    bulleColor:"#C8102E", bulleIcon:"▶",
    headerColor:"#1A1F6E", accentColor:"#C8102E",
    iconeGlobal:"🏆", iconeRadoux:"🎺", iconeBasse:"🎶",
    iconeConcert:"🎶", iconeConcours:"🏆", iconeStage:"🌲", iconeRepetition:"🎺",
  });

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if(data.session) loadUser(data.session.user.email);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if(s) loadUser(s.user.email);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (email) => {
    const { data } = await supabase.from("membres").select("*").eq("email", email).single();
    if(data) { setIsAdmin(data.is_admin||false); setCurrentUser(data); }
  };

  // Load events
  useEffect(() => {
    if(!session) return;
    supabase.from("evenements").select("*").order("date").then(({ data }) => {
      const evs = (data||[]).map(e => ({
        id: e.id, type: e.type, titre: e.titre||"",
        date: e.date, heure: e.heure, lieu: e.lieu, note: e.note||"",
        favori: e.favori||false, noteAdmin: e.note_admin||"",
        placeGlobale: e.place_globale||"", placeRadoux: e.place_radoux||"", placeBasse: e.place_basse||"",
      }));
      setAllEvents(evs);
      setFavorisEvents(evs.filter(e=>e.favori));
    });
  }, [session]);

  // Load apparence
  useEffect(() => {
    if(!session) return;
    supabase.from("apparence").select("*").eq("id",1).single().then(({ data }) => {
      if(data) setApparenceState({
        bulleColor: data.bulle_color||"#C8102E",
        bulleIcon:  data.bulle_icon||"▶",
        headerColor: data.header_color||"#1A1F6E",
        accentColor: data.accent_color||"#C8102E",
        iconeGlobal:    data.icone_global||"🏆",
        iconeRadoux:    data.icone_radoux||"🎺",
        iconeBasse:     data.icone_basse||"🎶",
        iconeConcert:   data.icone_concert||"🎶",
        iconeConcours:  data.icone_concours||"🏆",
        iconeStage:     data.icone_stage||"🌲",
        iconeRepetition:data.icone_repetition||"🎺",
      });
    });
  }, [session]);

  // Save apparence to Supabase
  const setApparence = async (ap) => {
    setApparenceState(ap);
    await supabase.from("apparence").upsert({
      id: 1,
      bulle_color: ap.bulleColor, bulle_icon: ap.bulleIcon,
      header_color: ap.headerColor, accent_color: ap.accentColor,
      icone_global: ap.iconeGlobal, icone_radoux: ap.iconeRadoux,
      icone_basse: ap.iconeBasse, icone_concert: ap.iconeConcert,
      icone_concours: ap.iconeConcours, icone_stage: ap.iconeStage,
      icone_repetition: ap.iconeRepetition,
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2200); };
  const handleMenu = (id) => {
    if(id==="deconnexion"){ supabase.auth.signOut(); return; }
    setModalMenu(id);
  };

  if(session===undefined) return <div style={{ minHeight:"100vh", background:C.parchemin }}/>;
  if(!session) return <AuthScreen/>;

  return (
    <div style={{ minHeight:"100vh", background:C.parchemin, fontFamily:"Inter, sans-serif", maxWidth:480, margin:"0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap'); *{box-sizing:border-box} ::-webkit-scrollbar{display:none}`}</style>

      {/* Header */}
      <div style={{ background:apparence.headerColor||C.primary, padding:"14px 16px 0", position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 16px rgba(26,31,110,0.3)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <TrompeLogo size={32} color={apparence.accentColor||C.secondary}/>
            <div>
              <div style={{ fontFamily:"'Playfair Display', serif", color:"#fff", fontSize:15, fontWeight:700, lineHeight:1.2 }}>Les Échos d'Occitanie</div>
              <div style={{ color:"#A8B8D8", fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase" }}>Trompe de Chasse{isAdmin?" · Admin":""}</div>
            </div>
          </div>
          <div style={{ position:"relative" }}>
            <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:apparence.accentColor||C.secondary, border:"none", cursor:"pointer", width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, fontFamily:"'Playfair Display', serif" }}>
              {currentUser ? `${currentUser.prenom[0]}${currentUser.nom[0]}` : "?"}
            </button>
            {menuOpen && <MenuDeroulant isAdmin={isAdmin} onNav={handleMenu} onClose={()=>setMenuOpen(false)}/>}
          </div>
        </div>
        <div style={{ display:"flex" }}>
          {TABS.map(t => {
            const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"8px 2px 10px", border:"none", background:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:active?(apparence.accentColor||C.secondary):"#6B8AAA", position:"relative", transition:"color 0.18s" }}>
                {t.ic}
                <span style={{ fontSize:8, fontWeight:active?700:400, letterSpacing:"0.03em", textTransform:"uppercase" }}>{t.l}</span>
                {active && <div style={{ position:"absolute", bottom:0, left:"10%", right:"10%", height:2, background:apparence.accentColor||C.secondary, borderRadius:"2px 2px 0 0" }}/>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:"18px 14px 80px" }}>
        {tab==="accueil"    && <AccueilTab favoris={favoris} favorisEvents={favorisEvents} apparence={apparence} allEvents={allEvents}/>}
        {tab==="agenda"     && <AgendaTab isAdmin={isAdmin} showToast={showToast} onFavorisChange={setFavorisEvents} allEvents={allEvents} setAllEvents={setAllEvents} apparence={apparence}/>}
        {tab==="biblio"     && <BiblioTab isAdmin={isAdmin} showToast={showToast} favoris={favoris} setFavoris={setFavoris} apparence={apparence}/>}
        {tab==="repetition" && <RepetitionTab isAdmin={isAdmin} showToast={showToast} apparence={apparence}/>}
      </div>

      {modalMenu==="profil"  && <ModalProfil onClose={()=>setModalMenu(null)} showToast={showToast} currentUser={currentUser} setCurrentUser={setCurrentUser}/>}
      {modalMenu==="membres" && <ModalMembres isAdmin={isAdmin} onClose={()=>setModalMenu(null)} showToast={showToast}/>}
      {modalMenu==="admin"   && <ModalAdmin onClose={()=>setModalMenu(null)} apparence={apparence} setApparence={setApparence} showToast={showToast}/>}

      {toast && <Toast msg={toast}/>}
    </div>
  );
}