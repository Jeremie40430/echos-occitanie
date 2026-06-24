/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sxhaapcnzbrlornlkxft.supabase.co",
  "sb_publishable_pN30Nd2M-cNVneBT7zKuXg_4hpcJge2"
);

const C = {
  primary:"#1A1F6E", secondary:"#C8102E",
  parchemin:"#F5F0E8", grisChaud:"#8B7355",
  blanc:"#FDFAF5", bleuClair:"#E8EAFA",
  rougeClair:"#FDECEA", bleuMoyen:"#3949AB",
  vert:"#1B5E20", vertClair:"#E8F5E9",
};

const SUB = {
  concert:    { light:"#EDE7F6", text:"#4527A0" },
  repetition: { light:C.bleuClair, text:C.primary },
  concours:   { light:C.rougeClair, text:C.secondary },
  stage:      { light:C.bleuClair, text:C.bleuMoyen },
};

const fd  = (d) => new Date(d).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const fds = (d) => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const fdt = (d) => new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});

const S = {
  card:  { background:C.blanc, border:"1px solid #D4C9B0", borderRadius:12, padding:"12px 14px", marginBottom:10, boxShadow:"0 1px 4px rgba(26,31,110,0.06)" },
  badge: { display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" },
  secTitle: { fontFamily:"'Playfair Display', serif", fontSize:15, color:C.primary, marginBottom:12, fontWeight:700 },
  input:  { width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid #D4C9B0", fontSize:13, fontFamily:"Inter,sans-serif", background:C.blanc, boxSizing:"border-box", outline:"none", marginBottom:10, color:C.primary },
  select: { width:"100%", padding:"10px 12px", borderRadius:9, border:"1px solid #D4C9B0", fontSize:13, fontFamily:"Inter,sans-serif", background:C.blanc, boxSizing:"border-box", outline:"none", marginBottom:10, color:C.primary },
  label:  { fontSize:11, fontWeight:600, color:C.grisChaud, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4, display:"block" },
  btnP:   { width:"100%", padding:"11px", borderRadius:10, border:"none", cursor:"pointer", background:C.primary, color:"#fff", fontWeight:700, fontSize:13, fontFamily:"Inter,sans-serif" },
  btnS:   { width:"100%", padding:"11px", borderRadius:10, border:"1px solid #D4C9B0", cursor:"pointer", background:"transparent", color:C.grisChaud, fontWeight:600, fontSize:13, fontFamily:"Inter,sans-serif", marginTop:8 },
  btnD:   { width:"100%", padding:"11px", borderRadius:10, border:"none", cursor:"pointer", background:C.rougeClair, color:C.secondary, fontWeight:700, fontSize:13, fontFamily:"Inter,sans-serif", marginTop:8 },
};

// ── Composants de base ─────────────────────────────────────────────
const TrompeLogo = ({size=30,color="#C8102E"}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M8 40 Q12 28 20 24 Q32 18 44 20 Q52 22 56 28 L52 32 Q48 26 40 24 Q30 22 22 28 Q14 34 12 44 Z" fill={color} opacity="0.9"/>
    <circle cx="10" cy="42" r="5" fill={color} opacity="0.7"/>
    <path d="M54 26 Q58 24 60 20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const Spinner = () => (
  <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
    <div style={{width:28,height:28,border:"3px solid #D4C9B0",borderTopColor:C.secondary,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const BtnPlus = ({onClick}) => (
  <button onClick={onClick} style={{position:"fixed",bottom:28,right:20,width:52,height:52,borderRadius:"50%",border:"none",cursor:"pointer",background:C.secondary,color:"#fff",fontSize:28,boxShadow:"0 4px 16px rgba(200,16,46,0.35)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
);

const Modal = ({title,onClose,children}) => (
  <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth:480,margin:"0 auto",background:C.parchemin,borderRadius:"18px 18px 0 0",padding:"20px 18px 36px",maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:17,color:C.primary}}>{title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:24,color:C.grisChaud}}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Confirm = ({msg,onConfirm,onClose}) => (
  <Modal title="Confirmer" onClose={onClose}>
    <div style={{fontSize:14,color:C.primary,marginBottom:16}}>{msg}</div>
    <button style={S.btnD} onClick={onConfirm}>Supprimer</button>
    <button style={S.btnS} onClick={onClose}>Annuler</button>
  </Modal>
);

const Toast = ({msg}) => (
  <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:C.primary,color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:600,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>{msg}</div>
);

const Breadcrumb = ({items,onBack}) => (
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
    <button onClick={onBack} style={{background:C.bleuClair,border:"none",cursor:"pointer",padding:"6px 12px",borderRadius:8,fontSize:12,color:C.primary,fontWeight:600}}>← Retour</button>
    {items.map((it,i)=><span key={i} style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:14}}>{it}</span>)}
  </div>
);

const AA = ({onEdit,onDelete}) => (
  <div style={{display:"flex",gap:4,flexShrink:0}}>
    <button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:C.bleuClair,border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:6,fontSize:13}}>✏️</button>
    <button onClick={e=>{e.stopPropagation();onDelete();}} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:6,fontSize:13}}>🗑</button>
  </div>
);

const Avatar = ({nom,prenom,size=32}) => {
  const initials = prenom&&nom ? `${prenom[0]}${nom[0]}` : "?";
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:size*0.35,flexShrink:0}}>
      {initials}
    </div>
  );
};

// ── Upload fichier ─────────────────────────────────────────────────
function FileUpload({onUploaded,accept,label}) {
  const [uploading,setUploading] = useState(false);
  const [progress,setProgress] = useState(0);
  const inputRef = useRef();

  const upload = async(e) => {
    const file = e.target.files[0];
    if(!file) return;
    setUploading(true); setProgress(10);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    setProgress(40);
    const{error} = await supabase.storage.from("media").upload(path, file, {upsert:false});
    setProgress(80);
    if(error){alert("Erreur upload : "+error.message);setUploading(false);return;}
    const{data} = supabase.storage.from("media").getPublicUrl(path);
    setProgress(100);
    setTimeout(()=>{setUploading(false);setProgress(0);},500);
    const taille = file.size>1024*1024 ? `${(file.size/1024/1024).toFixed(1)} Mo` : `${Math.round(file.size/1024)} Ko`;
    onUploaded({url:data.publicUrl, nom:file.name.replace(`.${ext}`,""), taille, ext});
  };

  return (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:600,color:C.grisChaud,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{label||"Fichier"}</div>
      <div onClick={()=>!uploading&&inputRef.current.click()} style={{border:"2px dashed #D4C9B0",borderRadius:10,padding:"16px",textAlign:"center",cursor:uploading?"default":"pointer",background:uploading?"#F5F0E8":C.blanc}}>
        {uploading ? (
          <div>
            <div style={{fontSize:13,color:C.primary,marginBottom:8}}>Upload en cours…</div>
            <div style={{height:4,background:"#D4C9B0",borderRadius:2}}><div style={{height:"100%",width:`${progress}%`,background:C.secondary,borderRadius:2,transition:"width 0.3s"}}/></div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:13,color:C.primary,fontWeight:600}}>Appuyer pour choisir un fichier</div>
            <div style={{fontSize:11,color:C.grisChaud,marginTop:3}}>MP3, PDF, WAV, M4A, image…</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept||"*"} style={{display:"none"}} onChange={upload}/>
    </div>
  );
}

// ── Lecteur audio ──────────────────────────────────────────────────
function AudioPlayer({url,bColor}) {
  const audioRef = useRef();
  const [playing,setPlaying] = useState(false);
  const [progress,setProgress] = useState(0);
  const [duration,setDuration] = useState(0);
  const [current,setCurrent] = useState(0);

  const toggle = () => {
    if(!audioRef.current) return;
    if(playing){audioRef.current.pause();setPlaying(false);}
    else{audioRef.current.play();setPlaying(true);}
  };
  const fmt = (s) => {if(!s||isNaN(s))return"0:00";const m=Math.floor(s/60),sec=Math.floor(s%60);return`${m}:${sec.toString().padStart(2,"0")}`;};
  const seek = (e) => {
    if(!audioRef.current||!duration) return;
    const rect=e.currentTarget.getBoundingClientRect();
    const ratio=(e.clientX-rect.left)/rect.width;
    audioRef.current.currentTime=ratio*duration;
  };

  return (
    <div style={{marginTop:8,padding:"10px 12px",background:"#F0EEF8",borderRadius:10}}>
      <audio ref={audioRef} src={url}
        onTimeUpdate={()=>{setCurrent(audioRef.current.currentTime);setProgress(audioRef.current.currentTime/audioRef.current.duration*100);}}
        onLoadedMetadata={()=>setDuration(audioRef.current.duration)}
        onEnded={()=>setPlaying(false)}
      />
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={toggle} style={{width:36,height:36,borderRadius:"50%",border:"none",cursor:"pointer",background:bColor||C.secondary,color:"#fff",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {playing?"⏸":"▶"}
        </button>
        <div style={{flex:1}}>
          <div onClick={seek} style={{height:4,background:"#D4C9B0",borderRadius:2,cursor:"pointer",marginBottom:4}}>
            <div style={{height:"100%",width:`${progress}%`,background:bColor||C.secondary,borderRadius:2}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.grisChaud}}>
            <span>{fmt(current)}</span><span>{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cards médias ───────────────────────────────────────────────────
const AudioCard = ({nom,taille,favori,url,playing,onPlay,onFavori,onEdit,onDelete,isAdmin,bColor,bIcon}) => (
  <div style={S.card}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <button onClick={onPlay} style={{width:40,height:40,borderRadius:"50%",border:"none",cursor:"pointer",background:bColor||C.secondary,color:"#fff",fontSize:16,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,boxShadow:`0 2px 8px ${(bColor||C.secondary)}50`}}>
        {playing?"⏸":(bIcon||"▶")}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nom}</div>
        <div style={{fontSize:11,color:C.grisChaud,marginTop:2}}>{taille}</div>
      </div>
      {isAdmin&&(
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          {onFavori!==undefined&&<button onClick={e=>{e.stopPropagation();onFavori();}} style={{background:favori?"#FDF3E3":"#F5F5F5",border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:6,fontSize:14}}>{favori?"⭐":"☆"}</button>}
          <button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:C.bleuClair,border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:6,fontSize:13}}>✏️</button>
          <button onClick={e=>{e.stopPropagation();onDelete();}} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:6,fontSize:13}}>🗑</button>
        </div>
      )}
    </div>
    {playing&&url&&<AudioPlayer url={url} bColor={bColor}/>}
  </div>
);

const PdfCard = ({nom,taille,url,onEdit,onDelete,isAdmin}) => (
  <div style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
    <div style={{width:40,height:40,borderRadius:10,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontSize:18}}>📄</span></div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nom}</div>
      <div style={{fontSize:11,color:C.grisChaud,marginTop:2}}>{taille}</div>
    </div>
    {url&&<a href={url} target="_blank" rel="noopener noreferrer" style={{padding:"5px 10px",borderRadius:8,background:C.bleuClair,color:C.primary,fontSize:11,fontWeight:700,textDecoration:"none",flexShrink:0}}>Ouvrir</a>}
    {isAdmin&&<AA onEdit={onEdit} onDelete={onDelete}/>}
  </div>
);

const FileCard = ({nom,taille,url,typeLabel,onEdit,onDelete,isAdmin}) => (
  <div style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
    <div style={{width:40,height:40,borderRadius:10,background:"#E8E0D0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:C.grisChaud,fontSize:18}}>📎</span></div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nom}</div>
      <div style={{fontSize:11,color:C.grisChaud,marginTop:2}}>{typeLabel} · {taille}</div>
    </div>
    {url&&<a href={url} target="_blank" rel="noopener noreferrer" style={{padding:"5px 10px",borderRadius:8,background:"#E8E0D0",color:C.grisChaud,fontSize:11,fontWeight:700,textDecoration:"none",flexShrink:0}}>Ouvrir</a>}
    {isAdmin&&<AA onEdit={onEdit} onDelete={onDelete}/>}
  </div>
);

// ── ACCUEIL ────────────────────────────────────────────────────────
function AccueilTab({favoris,allEvents,apparence,currentUser,showToast}) {
  const ap = apparence||{};
  const todayStr = new Date().toLocaleDateString("en-CA");
  const upcoming = allEvents.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date));
  const nextRep = upcoming.find(e=>e.type==="repetition");
  const next3 = upcoming.filter(e=>e.type!=="repetition").slice(0,3);
  const dernierConcours = allEvents.filter(e=>e.type==="concours"&&e.date<todayStr).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const evLabels = {concert:"Concert",concours:"Concours",stage:"Stage",repetition:"Répétition"};
  const evColors = {concert:"#EDE7F6",concours:C.rougeClair,stage:C.bleuClair,repetition:C.bleuClair};

  return (
    <div>
      {nextRep&&(
        <div style={{background:ap.headerColor||C.primary,borderRadius:16,padding:"20px 18px",marginBottom:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,opacity:0.07}}><TrompeLogo size={120} color="#fff"/></div>
          <div style={{fontSize:11,color:"#A8B8D8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Prochaine répétition</div>
          <div style={{fontFamily:"'Playfair Display',serif",color:"#fff",fontSize:20,fontWeight:700,marginBottom:4,textTransform:"capitalize"}}>{fd(nextRep.date)}</div>
          <div style={{color:"#C8D8F0",fontSize:13}}>🕐 {nextRep.heure}</div>
          <div style={{color:"#C8D8F0",fontSize:13,marginTop:3}}>📍 {nextRep.lieu}</div>
        </div>
      )}

      {dernierConcours&&(
        <div style={{...S.card,marginBottom:16}}>
          <div style={{fontSize:11,color:C.grisChaud,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Dernier concours</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:16,marginBottom:2}}>{dernierConcours.titre||"Concours"}</div>
          <div style={{fontSize:12,color:C.grisChaud,marginBottom:12}}>{fds(dernierConcours.date)} · {dernierConcours.lieu}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {dernierConcours.place_globale&&<div style={{display:"flex",alignItems:"center",gap:12,background:C.rougeClair,borderRadius:10,padding:"10px 14px"}}><div><div style={{fontSize:10,color:C.grisChaud,textTransform:"uppercase"}}>Classement général</div><div style={{fontWeight:700,color:C.secondary,fontSize:16}}>{dernierConcours.place_globale} prix</div></div></div>}
            {dernierConcours.place_radoux&&<div style={{display:"flex",alignItems:"center",gap:12,background:C.bleuClair,borderRadius:10,padding:"10px 14px"}}><div><div style={{fontSize:10,color:C.grisChaud,textTransform:"uppercase"}}>Radoux</div><div style={{fontWeight:700,color:C.primary,fontSize:16}}>{dernierConcours.place_radoux} prix</div></div></div>}
            {dernierConcours.place_basse&&<div style={{display:"flex",alignItems:"center",gap:12,background:"#EDE7F6",borderRadius:10,padding:"10px 14px"}}><div><div style={{fontSize:10,color:C.grisChaud,textTransform:"uppercase"}}>Basse</div><div style={{fontWeight:700,color:"#4527A0",fontSize:16}}>{dernierConcours.place_basse} prix</div></div></div>}
          </div>
          {dernierConcours.note_admin&&<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #E8E0D0",fontSize:13,color:C.primary,lineHeight:1.7,fontStyle:"italic"}}>{dernierConcours.note_admin}</div>}
        </div>
      )}

      {favoris.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={S.secTitle}>Favoris</div>
          {favoris.map(f=>(
            <div key={f.id} style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
              <button style={{width:40,height:40,borderRadius:"50%",border:"none",cursor:"pointer",background:ap.bulleColor||C.secondary,color:"#fff",fontSize:16,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{ap.bulleIcon||"▶"}</button>
              <div style={{flex:1}}><div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:13}}>{f.nom}</div><div style={{fontSize:11,color:C.grisChaud}}>Favoris</div></div>
            </div>
          ))}
        </div>
      )}

      {next3.length>0&&(
        <div>
          <div style={S.secTitle}>Prochains événements</div>
          {next3.map(ev=>(
            <div key={ev.id} style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:evColors[ev.type]||C.bleuClair,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:C.primary}}>{evLabels[ev.type]?.slice(0,3)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:C.primary,fontSize:13}}>{ev.titre||evLabels[ev.type]}</div>
                <div style={{fontSize:11,color:C.grisChaud,marginTop:2,textTransform:"capitalize"}}>{fd(ev.date)} · {ev.heure}</div>
              </div>
              <span style={{...S.badge,background:evColors[ev.type]||C.bleuClair,color:C.primary,fontSize:9}}>{evLabels[ev.type]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Présence boutons (composant stable hors AgendaTab) ─────────────
function PresenceBtns({ev,presences,setPresences,currentUser,showToast}) {
  const p = presences.find(x=>x.evenement_id===ev.id&&x.membre_id===currentUser?.id);
  const [open,setOpen] = useState(false);
  const evPresences = presences.filter(x=>x.evenement_id===ev.id);
  const oui = evPresences.filter(x=>x.statut==="oui");
  const peutetre = evPresences.filter(x=>x.statut==="peut-etre");
  const non = evPresences.filter(x=>x.statut==="non");
  const counts = {oui:oui.length,peutetre:peutetre.length,non:non.length};

  const setPresence = async(statut) => {
    if(!currentUser) return;
    const existing = presences.find(x=>x.evenement_id===ev.id&&x.membre_id===currentUser.id);
    if(existing){
      await supabase.from("presences").update({statut}).eq("id",existing.id);
      setPresences(prev=>prev.map(x=>x.id===existing.id?{...x,statut}:x));
    } else {
      const{data}=await supabase.from("presences").insert([{evenement_id:ev.id,membre_id:currentUser.id,membre_nom:`${currentUser.prenom} ${currentUser.nom}`,statut}]).select().single();
      if(data) setPresences(prev=>[...prev,data]);
    }
    showToast("Présence enregistrée ✓");
  };

  const btn = (statut,label,color,bg) => (
    <button onClick={()=>setPresence(statut)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${p?.statut===statut?color:"#D4C9B0"}`,background:p?.statut===statut?bg:"transparent",color:p?.statut===statut?color:C.grisChaud,fontSize:11,fontWeight:p?.statut===statut?700:400,cursor:"pointer"}}>
      {label}
    </button>
  );

  const MiniListe = ({items,label,color,bg}) => items.length===0?null:(
    <div style={{marginBottom:8}}>
      <div style={{fontSize:10,fontWeight:700,color,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label} ({items.length})</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {items.map((x,i)=><span key={i} style={{background:bg,color,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:500}}>{x.membre_nom}</span>)}
      </div>
    </div>
  );

  return (
    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #E8E0D0"}}>
      <div style={{fontSize:10,color:C.grisChaud,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Ma présence</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {btn("oui","Présent",C.vert,C.vertClair)}
        {btn("non","Absent",C.secondary,C.rougeClair)}
        {btn("peut-etre","Peut-être",C.bleuMoyen,C.bleuClair)}
      </div>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:10,color:C.grisChaud}}>{counts.oui} présent(s) · {counts.peutetre} peut-être · {counts.non} absent(s)</span>
        <span style={{fontSize:10,color:C.grisChaud,transform:open?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span>
      </button>
      {open&&(
        <div style={{marginTop:10,padding:"10px 12px",background:"#F5F0E8",borderRadius:10}}>
          <MiniListe items={non} label="Absents" color={C.secondary} bg={C.rougeClair}/>
          <MiniListe items={peutetre} label="Peut-être" color={C.bleuMoyen} bg={C.bleuClair}/>
          <MiniListe items={oui} label="Présents" color={C.vert} bg={C.vertClair}/>
          {evPresences.length===0&&<div style={{fontSize:12,color:C.grisChaud}}>Aucune réponse pour l'instant.</div>}
        </div>
      )}
    </div>
  );
}

// ── AGENDA ─────────────────────────────────────────────────────────
function AgendaTab({isAdmin,showToast,allEvents,setAllEvents,currentUser,apparence}) {
  const [subTab,setSubTab] = useState("avenir");
  const [modal,setModal] = useState(null);
  const [confirm,setConfirm] = useState(null);
  const [presences,setPresences] = useState([]);
  const ap = apparence||{};
  const todayStr = new Date().toLocaleDateString("en-CA");
  const upcoming = allEvents.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date));
  const past = allEvents.filter(e=>e.date<todayStr).sort((a,b)=>b.date.localeCompare(a.date));

  useEffect(()=>{
    supabase.from("presences").select("*").then(({data})=>setPresences(data||[]));
  },[]);

  const save = async(f)=>{
    const payload={type:f.type,titre:f.titre||"",date:f.date,heure:f.heure,lieu:f.lieu,note:f.note||"",favori:f.favori||false,note_admin:f.note_admin||"",place_globale:f.place_globale||"",place_radoux:f.place_radoux||"",place_basse:f.place_basse||""};
    if(f.id){await supabase.from("evenements").update(payload).eq("id",f.id);setAllEvents(prev=>prev.map(e=>e.id===f.id?{...e,...payload}:e));}
    else{const{data}=await supabase.from("evenements").insert([payload]).select().single();if(data)setAllEvents(prev=>[...prev,data]);}
    showToast(f.id?"Modifié ✓":"Ajouté ✓");setModal(null);
  };

  const SUBTABS=[{id:"avenir",l:"A venir"},{id:"repetitions",l:"Répétitions"},{id:"concerts",l:"Concerts"},{id:"concours",l:"Concours"},{id:"stages",l:"Stages"},{id:"palmares",l:"Palmares"}];
  const LABELS={concert:"Concert",repetition:"Répétition",concours:"Concours",stage:"Stage"};
  const getList=()=>{
    if(subTab==="avenir") return upcoming;
    if(subTab==="repetitions") return [...upcoming,...past].filter(e=>e.type==="repetition");
    if(subTab==="concerts") return [...upcoming,...past].filter(e=>e.type==="concert");
    if(subTab==="concours") return upcoming.filter(e=>e.type==="concours");
    if(subTab==="stages") return [...upcoming,...past].filter(e=>e.type==="stage");
    if(subTab==="palmares") return past.filter(e=>e.type==="concours");
    return [];
  };
  const list = getList();

  const EF=({init})=>{
    const [f,setF]=useState(init||{type:"repetition",titre:"",date:"",heure:"",lieu:"",note:"",place_globale:"",place_radoux:"",place_basse:""});
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    return (
      <Modal title={f.id?"Modifier":"Nouvel événement"} onClose={()=>setModal(null)}>
        <label style={S.label}>Type</label>
        <select style={S.select} value={f.type} onChange={e=>s("type",e.target.value)}><option value="repetition">Répétition</option><option value="concert">Concert</option><option value="concours">Concours</option><option value="stage">Stage</option></select>
        <label style={S.label}>Titre</label><input style={S.input} value={f.titre||""} onChange={e=>s("titre",e.target.value)} placeholder="Optionnel"/>
        <label style={S.label}>Date *</label><input type="date" style={S.input} value={f.date} onChange={e=>s("date",e.target.value)}/>
        <label style={S.label}>Heure</label><input style={S.input} value={f.heure||""} onChange={e=>s("heure",e.target.value)} placeholder="18h30"/>
        <label style={S.label}>Lieu *</label><input style={S.input} value={f.lieu||""} onChange={e=>s("lieu",e.target.value)}/>
        <label style={S.label}>Note</label><input style={S.input} value={f.note||""} onChange={e=>s("note",e.target.value)} placeholder="Optionnel"/>
        {f.type==="concours"&&<><label style={S.label}>Place générale</label><input style={S.input} value={f.place_globale||""} onChange={e=>s("place_globale",e.target.value)} placeholder="1er"/><label style={S.label}>Place Radoux</label><input style={S.input} value={f.place_radoux||""} onChange={e=>s("place_radoux",e.target.value)} placeholder="2ème"/><label style={S.label}>Place Basse</label><input style={S.input} value={f.place_basse||""} onChange={e=>s("place_basse",e.target.value)} placeholder="1er"/></>}
        <button style={S.btnP} onClick={()=>f.date&&f.lieu&&save(f)}>{f.id?"Enregistrer":"Ajouter"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  return (
    <>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12,marginBottom:8,scrollbarWidth:"none"}}>
        {SUBTABS.map(st=><button key={st.id} onClick={()=>setSubTab(st.id)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",whiteSpace:"nowrap",fontSize:12,fontFamily:"Inter,sans-serif",fontWeight:subTab===st.id?700:400,background:subTab===st.id?C.primary:"#E8E0D0",color:subTab===st.id?"#fff":C.grisChaud,transition:"all 0.18s",flexShrink:0}}>{st.l}</button>)}
      </div>

      {list.length===0&&<div style={{color:C.grisChaud,fontSize:13,paddingTop:20}}>Aucun événement.</div>}

      {subTab==="palmares" ? (
        list.map((ev,i)=>(
          <div key={ev.id} style={{...S.card,borderLeft:`4px solid ${i===0?C.secondary:"#D4C9B0"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:14}}>{ev.titre||"Concours"}</div>
                <div style={{fontSize:11,color:C.grisChaud}}>{fds(ev.date)} · {ev.lieu}</div>
              </div>
              {i===0&&<span style={{...S.badge,background:C.rougeClair,color:C.secondary}}>Dernier</span>}
              {isAdmin&&<AA onEdit={()=>setModal(ev)} onDelete={()=>setConfirm(ev)}/>}
            </div>
            {ev.place_globale&&<div style={{background:C.rougeClair,borderRadius:8,padding:"7px 12px",marginBottom:6}}><div style={{fontSize:10,color:C.grisChaud}}>Classement général</div><div style={{fontWeight:700,color:C.secondary}}>{ev.place_globale} prix</div></div>}
            {ev.place_radoux&&<div style={{background:C.bleuClair,borderRadius:8,padding:"7px 12px",marginBottom:6}}><div style={{fontSize:10,color:C.grisChaud}}>Radoux</div><div style={{fontWeight:700,color:C.primary}}>{ev.place_radoux} prix</div></div>}
            {ev.place_basse&&<div style={{background:"#EDE7F6",borderRadius:8,padding:"7px 12px",marginBottom:6}}><div style={{fontSize:10,color:C.grisChaud}}>Basse</div><div style={{fontWeight:700,color:"#4527A0"}}>{ev.place_basse} prix</div></div>}
            {ev.note_admin&&<div style={{fontSize:12,color:C.primary,fontStyle:"italic",marginTop:8}}>{ev.note_admin}</div>}
          </div>
        ))
      ) : (
        list.map(ev=>(
          <div key={ev.id} style={S.card}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div style={{flex:1}}>
                <span style={{...S.badge,background:SUB[ev.type]?.light||C.bleuClair,color:SUB[ev.type]?.text||C.primary,marginBottom:6}}>{LABELS[ev.type]}</span>
                {ev.titre&&<div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:14}}>{ev.titre}</div>}
                <div style={{fontWeight:ev.titre?400:700,color:C.primary,fontSize:ev.titre?12:14,textTransform:"capitalize",marginTop:ev.titre?2:4}}>{fd(ev.date)}</div>
                <div style={{fontSize:12,color:C.grisChaud,marginTop:3}}>🕐 {ev.heure} · 📍 {ev.lieu}</div>
                {ev.note&&<div style={{fontSize:12,color:C.secondary,fontWeight:600,marginTop:5}}>{ev.note}</div>}
              </div>
              {isAdmin&&<AA onEdit={()=>setModal(ev)} onDelete={()=>setConfirm(ev)}/>}
            </div>
            {currentUser&&<PresenceBtns ev={ev} presences={presences} setPresences={setPresences} currentUser={currentUser} showToast={showToast}/>}
          </div>
        ))
      )}

      {isAdmin&&<BtnPlus onClick={()=>setModal("new")}/>}
      {modal&&<EF init={modal==="new"?null:modal}/>}
      {confirm&&<Confirm msg="Supprimer cet événement ?" onConfirm={async()=>{await supabase.from("evenements").delete().eq("id",confirm.id);setAllEvents(prev=>prev.filter(e=>e.id!==confirm.id));showToast("Supprimé ✓");setConfirm(null);}} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── Formulaires médias (composants stables hors MediasTab) ─────────
function DF({init,dossiers,showToast,onClose,onSaved}) {
  const [f,setF] = useState(init||{nom:"",categorie:"biblio"});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const save=async()=>{
    if(!f.nom) return;
    if(f.id){
      const{error}=await supabase.from("dossiers").update({nom:f.nom,categorie:f.categorie}).eq("id",f.id);
      if(error){alert("Erreur: "+error.message);return;}
    } else {
      const{error}=await supabase.from("dossiers").insert([{nom:f.nom,categorie:f.categorie,emoji:"📁",color:C.primary,ordre:dossiers.length+1}]);
      if(error){alert("Erreur: "+error.message);return;}
    }
    showToast(f.id?"Modifié ✓":"Dossier créé ✓");
    await onSaved();
    onClose();
  };
  return (
    <Modal title={f.id?"Modifier dossier":"Nouveau dossier"} onClose={onClose}>
      <label style={S.label}>Nom *</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
      <label style={S.label}>Type</label>
      <select style={S.select} value={f.categorie} onChange={e=>s("categorie",e.target.value)}>
        <option value="biblio">Médiathèque</option>
        <option value="repetition">Répétitions</option>
      </select>
      <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Créer"}</button>
      <button style={S.btnS} onClick={onClose}>Annuler</button>
    </Modal>
  );
}

function SDF({init,dossierId,showToast,onClose,onSaved}) {
  const [f,setF] = useState(init||{nom:"",date:new Date().toISOString().split("T")[0]});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const save=async()=>{
    if(!f.nom) return;
    if(f.id){
      const{error}=await supabase.from("sous_dossiers").update({nom:f.nom,date:f.date}).eq("id",f.id);
      if(error){alert("Erreur: "+error.message);return;}
    } else {
      const{error}=await supabase.from("sous_dossiers").insert([{dossier_id:dossierId,nom:f.nom,date:f.date||null}]);
      if(error){alert("Erreur: "+error.message);return;}
    }
    showToast(f.id?"Modifié ✓":"Sous-dossier créé ✓");
    await onSaved();
    onClose();
  };
  return (
    <Modal title={f.id?"Modifier":"Nouveau sous-dossier"} onClose={onClose}>
      <label style={S.label}>Nom *</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
      <label style={S.label}>Date (optionnel)</label><input type="date" style={S.input} value={f.date||""} onChange={e=>s("date",e.target.value)}/>
      <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Créer"}</button>
      <button style={S.btnS} onClick={onClose}>Annuler</button>
    </Modal>
  );
}

function FF({init,actifId,sousActifId,showToast,onClose,onSaved}) {
  const [f,setF] = useState(init||{morceau_id:actifId,sous_dossier_id:sousActifId||null,nom:"",type:"audio",url:"",taille:""});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const save=async()=>{
    if(!f.nom||!f.url) return;
    const payload={morceau_id:f.morceau_id,sous_dossier_id:f.sous_dossier_id||null,nom:f.nom,type:f.type,url:f.url,taille:f.taille||"",favori:f.favori||false};
    if(f.id){
      const{error}=await supabase.from("fichiers").update(payload).eq("id",f.id);
      if(error){alert("Erreur: "+error.message);return;}
    } else {
      const{error}=await supabase.from("fichiers").insert([payload]);
      if(error){alert("Erreur: "+error.message);return;}
    }
    showToast("Fichier ajouté ✓");
    await onSaved();
    onClose();
  };
  return (
    <Modal title={f.id?"Modifier fichier":"Nouveau fichier"} onClose={onClose}>
      <label style={S.label}>Type</label>
      <select style={S.select} value={f.type} onChange={e=>s("type",e.target.value)}>
        <option value="audio">Audio (MP3, M4A…)</option>
        <option value="pdf">PDF / Partition</option>
        <option value="midi">MIDI</option>
        <option value="autre">Autre</option>
      </select>
      {!f.id&&(
        <FileUpload
          label="Choisir un fichier"
          accept={f.type==="audio"?"audio/*":f.type==="pdf"?"application/pdf":"*"}
          onUploaded={({url,nom,taille})=>{s("url",url);if(!f.nom)s("nom",nom);s("taille",taille);}}
        />
      )}
      {f.url&&<div style={{fontSize:11,color:C.vert,marginBottom:8,background:C.vertClair,padding:"6px 10px",borderRadius:6}}>Fichier prêt</div>}
      <label style={S.label}>Nom *</label>
      <input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)} placeholder="Nom affiché"/>
      <button style={{...S.btnP,opacity:(!f.nom||!f.url)?0.5:1}} onClick={save}>{f.id?"Enregistrer":"Ajouter"}</button>
      <button style={S.btnS} onClick={onClose}>Annuler</button>
    </Modal>
  );
}

// ── MEDIAS ─────────────────────────────────────────────────────────
function MediasTab({isAdmin,showToast,favoris,setFavoris,apparence}) {
  const ap = apparence||{};
  const [dossiers,setDossiers] = useState([]);
  const [sousDossiers,setSousDossiers] = useState([]);
  const [fichiers,setFichiers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [actif,setActif] = useState(null); // dossier principal
  const [sousActif,setSousActif] = useState(null); // sous-dossier
  const [playing,setPlaying] = useState(null);
  const [modal,setModal] = useState(null);
  const [confirm,setConfirm] = useState(null);

  const load = useCallback(async()=>{
    setLoading(true);
    const [{data:d},{data:sd},{data:f}] = await Promise.all([
      supabase.from("dossiers").select("*").order("ordre"),
      supabase.from("sous_dossiers").select("*").order("created_at",{ascending:false}),
      supabase.from("fichiers").select("*"),
    ]);
    setDossiers(d||[]);
    setSousDossiers(sd||[]);
    const mapped=(f||[]).map(x=>({...x,dossier_id:x.morceau_id}));
    setFichiers(mapped);
    setFavoris(mapped.filter(x=>x.favori));
    setLoading(false);
  },[setFavoris]);

  useEffect(()=>{load();},[load]);

  const toggleFav = async(f)=>{
    const nv=!f.favori;
    await supabase.from("fichiers").update({favori:nv}).eq("id",f.id);
    setFichiers(fs=>fs.map(x=>x.id===f.id?{...x,favori:nv}:x));
    if(nv) setFavoris(prev=>[...prev,{...f,favori:true}]);
    else setFavoris(prev=>prev.filter(x=>x.id!==f.id));
    showToast(nv?"Ajouté aux favoris":"Retiré des favoris");
  };

  const renderFichier = (f) => {
    if(f.type==="audio") return (
      <AudioCard key={f.id} nom={f.nom} taille={f.taille} favori={f.favori} url={f.url}
        playing={playing===f.id} onPlay={()=>setPlaying(playing===f.id?null:f.id)}
        onFavori={()=>toggleFav(f)}
        onEdit={()=>setModal({t:"fichier",data:{...f}})}
        onDelete={()=>setConfirm({msg:`Supprimer "${f.nom}" ?`,fn:async()=>{await supabase.from("fichiers").delete().eq("id",f.id);showToast("Supprimé ✓");setConfirm(null);await load();}})}
        isAdmin={isAdmin} bColor={ap.bulleColor} bIcon={ap.bulleIcon}
      />
    );
    if(f.type==="pdf") return (
      <PdfCard key={f.id} nom={f.nom} taille={f.taille} url={f.url}
        onEdit={()=>setModal({t:"fichier",data:{...f}})}
        onDelete={()=>setConfirm({msg:`Supprimer "${f.nom}" ?`,fn:async()=>{await supabase.from("fichiers").delete().eq("id",f.id);showToast("Supprimé ✓");setConfirm(null);await load();}})}
        isAdmin={isAdmin}
      />
    );
    return (
      <FileCard key={f.id} nom={f.nom} taille={f.taille} url={f.url}
        typeLabel={f.type==="midi"?"MIDI":"Fichier"}
        onEdit={()=>setModal({t:"fichier",data:{...f}})}
        onDelete={()=>setConfirm({msg:`Supprimer "${f.nom}" ?`,fn:async()=>{await supabase.from("fichiers").delete().eq("id",f.id);showToast("Supprimé ✓");setConfirm(null);await load();}})}
        isAdmin={isAdmin}
      />
    );
  };

  if(loading) return <Spinner/>;

  // Niveau 3 : contenu d'un sous-dossier
  if(sousActif) {
    const contenu = fichiers.filter(f=>f.sous_dossier_id===sousActif.id);
    return (
      <>
        <Breadcrumb items={[actif?.nom, `› ${sousActif.nom}`]} onBack={()=>{setSousActif(null);setModal(null);setPlaying(null);}}/>
        {contenu.length===0&&<div style={{color:C.grisChaud,fontSize:13}}>Aucun fichier — bouton + pour ajouter.</div>}
        {contenu.map(f=>renderFichier(f))}
        {isAdmin&&<BtnPlus onClick={()=>setModal({t:"fichier"})}/>}
        {modal?.t==="fichier"&&<FF init={modal.data||null} actifId={actif?.id||null} sousActifId={sousActif?.id||null} showToast={showToast} onClose={()=>setModal(null)} onSaved={load}/>}
        {confirm&&<Confirm msg={confirm.msg} onConfirm={confirm.fn} onClose={()=>setConfirm(null)}/>}
      </>
    );
  }

  // Niveau 2 : contenu d'un dossier (fichiers directs + sous-dossiers)
  if(actif) {
    const sdList = sousDossiers.filter(sd=>sd.dossier_id===actif.id);
    const fichiersDirects = fichiers.filter(f=>f.morceau_id===actif.id&&!f.sous_dossier_id);
    return (
      <>
        <Breadcrumb items={[actif.nom]} onBack={()=>{setActif(null);setModal(null);setPlaying(null);}}/>

        {/* Sous-dossiers */}
        {sdList.length>0&&(
          <div style={{marginBottom:16}}>
            {sdList.map(sd=>(
              <div key={sd.id} onClick={()=>setSousActif(sd)} style={{...S.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:C.bleuClair,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📁</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:13}}>{sd.nom}</div>
                  <div style={{fontSize:11,color:C.grisChaud,marginTop:2}}>{fichiers.filter(f=>f.sous_dossier_id===sd.id).length} fichier(s)</div>
                </div>
                {isAdmin&&<div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:4}}>
                  <button onClick={()=>setModal({t:"sd",data:sd})} style={{background:C.bleuClair,border:"none",cursor:"pointer",padding:"4px 7px",borderRadius:6,fontSize:13}}>✏️</button>
                  <button onClick={()=>setConfirm({msg:`Supprimer "${sd.nom}" ?`,fn:async()=>{await supabase.from("sous_dossiers").delete().eq("id",sd.id);showToast("Supprimé ✓");setConfirm(null);await load();}})} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"4px 7px",borderRadius:6,fontSize:13}}>🗑</button>
                </div>}
              </div>
            ))}
          </div>
        )}

        {/* Fichiers directs */}
        {fichiersDirects.length===0&&sdList.length===0&&<div style={{color:C.grisChaud,fontSize:13}}>Dossier vide — bouton + pour ajouter.</div>}
        {fichiersDirects.map(f=>renderFichier(f))}

        {isAdmin&&<BtnPlus onClick={()=>setModal({t:"choix"})}/>}
        {modal?.t==="choix"&&(
          <Modal title="Ajouter..." onClose={()=>setModal(null)}>
            {[["sd","Sous-dossier"],["fichier","Fichier"]].map(([id,t])=>(
              <div key={id} onClick={()=>setModal({t:id})} style={{...S.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{fontWeight:700,color:C.primary,fontSize:13}}>{t}</div>
              </div>
            ))}
            <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
          </Modal>
        )}
        {modal?.t==="sd"&&<SDF init={modal.data||null} dossierId={actif.id} showToast={showToast} onClose={()=>setModal(null)} onSaved={load}/>}
        {modal?.t==="fichier"&&<FF init={modal.data||null} actifId={actif?.id||null} sousActifId={null} showToast={showToast} onClose={()=>setModal(null)} onSaved={load}/>}
        {confirm&&<Confirm msg={confirm.msg} onConfirm={confirm.fn} onClose={()=>setConfirm(null)}/>}
      </>
    );
  }

  // Niveau 1 : liste des dossiers
  return (
    <>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {dossiers.map(d=>(
          <div key={d.id} onClick={()=>setActif(d)} style={{...S.card,cursor:"pointer",textAlign:"center",padding:"18px 12px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:14,marginBottom:4}}>{d.nom}</div>
            <div style={{fontSize:11,color:C.grisChaud}}>
              {fichiers.filter(f=>f.morceau_id===d.id).length + sousDossiers.filter(sd=>sd.dossier_id===d.id).reduce((acc,sd)=>acc+fichiers.filter(f=>f.sous_dossier_id===sd.id).length,0)} fichier(s)
            </div>
            {isAdmin&&<div style={{marginTop:10,display:"flex",justifyContent:"center",gap:6}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setModal({t:"dossier",data:d})} style={{background:C.bleuClair,border:"none",cursor:"pointer",padding:"3px 7px",borderRadius:6,fontSize:12}}>✏️</button>
              <button onClick={()=>setConfirm({msg:`Supprimer "${d.nom}" ?`,fn:async()=>{await supabase.from("dossiers").delete().eq("id",d.id);showToast("Supprimé ✓");setConfirm(null);await load();}})} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"3px 7px",borderRadius:6,fontSize:12}}>🗑</button>
            </div>}
          </div>
        ))}
      </div>

      {isAdmin&&<BtnPlus onClick={()=>setModal({t:"dossier"})}/>}
      {modal?.t==="dossier"&&<DF init={modal.data||null} dossiers={dossiers} showToast={showToast} onClose={()=>setModal(null)} onSaved={load}/>}
      {confirm&&<Confirm msg={confirm.msg} onConfirm={confirm.fn} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── MESSAGES ───────────────────────────────────────────────────────
function MessagesTab({isAdmin,showToast,currentUser}) {
  const [subTab,setSubTab] = useState("fil");
  const [messages,setMessages] = useState([]);
  const [sondages,setSondages] = useState([]);
  const [reponses,setReponses] = useState([]);
  const [loading,setLoading] = useState(true);
  const [texteDiscussion,setTexteDiscussion] = useState("");
  const [texteAnnonce,setTexteAnnonce] = useState("");
  const [modal,setModal] = useState(null);
  const [confirm,setConfirm] = useState(null);

  useEffect(()=>{
    Promise.all([
      supabase.from("messages").select("*").order("created_at",{ascending:false}),
      supabase.from("sondages").select("*").order("created_at",{ascending:false}),
      supabase.from("sondage_reponses").select("*"),
    ]).then(([{data:m},{data:s},{data:r}])=>{
      setMessages(m||[]);
      setSondages(s||[]);
      setReponses(r||[]);
      setLoading(false);
    });
  },[]);

  const envoyerMessage = async(type="message") => {
    const texte = type==="annonce" ? texteAnnonce : texteDiscussion;
    if(!texte.trim()||!currentUser) return;
    const payload={contenu:texte,auteur_id:currentUser.id,auteur_nom:`${currentUser.prenom} ${currentUser.nom}`,type};
    const{data}=await supabase.from("messages").insert([payload]).select().single();
    if(data) setMessages(prev=>[data,...prev]);
    if(type==="annonce") setTexteAnnonce(""); else setTexteDiscussion("");
    showToast("Message envoyé ✓");
  };

  const supprimerMessage = async(id) => {
    await supabase.from("messages").delete().eq("id",id);
    setMessages(prev=>prev.filter(m=>m.id!==id));
    showToast("Supprimé ✓");
    setConfirm(null);
  };

  const repondre = async(sondageId, option) => {
    if(!currentUser) return;
    const existing = reponses.find(r=>r.sondage_id===sondageId&&r.membre_id===currentUser.id);
    if(existing) {
      await supabase.from("sondage_reponses").update({reponse:option}).eq("id",existing.id);
      setReponses(prev=>prev.map(r=>r.id===existing.id?{...r,reponse:option}:r));
    } else {
      const{data}=await supabase.from("sondage_reponses").insert([{sondage_id:sondageId,membre_id:currentUser.id,membre_nom:`${currentUser.prenom} ${currentUser.nom}`,reponse:option}]).select().single();
      if(data) setReponses(prev=>[...prev,data]);
    }
    showToast("Réponse enregistrée ✓");
  };

  const NouveauSondage = () => {
    const [question,setQuestion] = useState("");
    const [options,setOptions] = useState(["Oui","Non","Peut-être"]);
    const save = async() => {
      if(!question) return;
      const{data}=await supabase.from("sondages").insert([{question,options}]).select().single();
      if(data) setSondages(prev=>[data,...prev]);
      setModal(null);
      showToast("Sondage créé ✓");
    };
    return (
      <Modal title="Nouveau sondage" onClose={()=>setModal(null)}>
        <label style={S.label}>Question *</label>
        <input style={S.input} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ex: Qui vient samedi ?"/>
        <label style={S.label}>Options</label>
        {options.map((o,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <input style={{...S.input,marginBottom:0,flex:1}} value={o} onChange={e=>{const n=[...options];n[i]=e.target.value;setOptions(n);}}/>
            <button onClick={()=>setOptions(options.filter((_,j)=>j!==i))} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"0 10px",borderRadius:8,color:C.secondary}}>×</button>
          </div>
        ))}
        <button onClick={()=>setOptions([...options,""])} style={{...S.btnS,marginBottom:12}}>+ Ajouter une option</button>
        <button style={S.btnP} onClick={save}>Créer le sondage</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  if(loading) return <Spinner/>;

  return (
    <>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["fil","Discussion"],["sondages","Sondages"],["annonces","Annonces"]].map(([id,l])=>(
          <button key={id} onClick={()=>setSubTab(id)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:subTab===id?700:400,background:subTab===id?C.primary:"#E8E0D0",color:subTab===id?"#fff":C.grisChaud}}>
            {l}
          </button>
        ))}
      </div>

      {subTab==="fil"&&(
        <>
          {/* Zone de saisie */}
          {currentUser&&(
            <div style={{...S.card,marginBottom:16}}>
              <textarea
                value={texteDiscussion}
                onChange={e=>setTexteDiscussion(e.target.value)}
                placeholder="Écrire un message…"
                style={{...S.input,minHeight:70,resize:"vertical",marginBottom:8}}
              />
              <button onClick={()=>envoyerMessage("message")} disabled={!texteDiscussion.trim()} style={{...S.btnP,opacity:texteDiscussion.trim()?1:0.5}}>
                Envoyer
              </button>
            </div>
          )}

          {messages.filter(m=>m.type==="message").length===0&&<div style={{color:C.grisChaud,fontSize:13}}>Aucun message pour l'instant.</div>}
          {messages.filter(m=>m.type==="message").map(m=>(
            <div key={m.id} style={{...S.card,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0}}>
                  {m.auteur_nom?.split(" ").map(n=>n[0]).join("").slice(0,2)||"?"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:C.primary,fontSize:13}}>{m.auteur_nom}</div>
                  <div style={{fontSize:10,color:C.grisChaud}}>{fdt(m.created_at)}</div>
                </div>
                {(isAdmin||m.auteur_id===currentUser?.id)&&(
                  <button onClick={()=>setConfirm({msg:"Supprimer ce message ?",fn:()=>supprimerMessage(m.id)})} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"4px 7px",borderRadius:6,fontSize:12}}>🗑</button>
                )}
              </div>
              <div style={{fontSize:13,color:C.primary,lineHeight:1.6,whiteSpace:"pre-line"}}>{m.contenu}</div>
            </div>
          ))}
        </>
      )}

      {subTab==="sondages"&&(
        <>
          {sondages.length===0&&<div style={{color:C.grisChaud,fontSize:13}}>Aucun sondage.</div>}
          {sondages.map(s=>{
            const repSondage = reponses.filter(r=>r.sondage_id===s.id);
            const maReponse = repSondage.find(r=>r.membre_id===currentUser?.id);
            return (
              <div key={s.id} style={S.card}>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:14,marginBottom:12}}>{s.question}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {(s.options||[]).map((opt,i)=>{
                    const nb = repSondage.filter(r=>r.reponse===opt).length;
                    const total = repSondage.length||1;
                    const pct = Math.round((nb/total)*100);
                    const selected = maReponse?.reponse===opt;
                    return (
                      <div key={i}>
                        <button onClick={()=>currentUser&&repondre(s.id,opt)} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`2px solid ${selected?C.primary:"#D4C9B0"}`,background:selected?C.bleuClair:C.blanc,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,fontWeight:selected?700:400,color:C.primary}}>
                          <span>{opt}</span>
                          <span style={{fontSize:11,color:C.grisChaud}}>{nb} · {pct}%</span>
                        </button>
                        <div style={{height:3,background:"#E8E0D0",borderRadius:2,marginTop:3}}>
                          <div style={{height:"100%",width:`${pct}%`,background:C.primary,borderRadius:2,transition:"width 0.4s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{fontSize:10,color:C.grisChaud,marginTop:10}}>{repSondage.length} réponse(s)</div>
                {isAdmin&&<button onClick={()=>setConfirm({msg:"Supprimer ce sondage ?",fn:async()=>{await supabase.from("sondages").delete().eq("id",s.id);setSondages(prev=>prev.filter(x=>x.id!==s.id));showToast("Supprimé ✓");setConfirm(null);}})} style={{...S.btnD,marginTop:8,padding:"6px"}}>Supprimer</button>}
              </div>
            );
          })}
          {isAdmin&&<BtnPlus onClick={()=>setModal("sondage")}/>}
          {modal==="sondage"&&<NouveauSondage/>}
        </>
      )}

      {subTab==="annonces"&&(
        <>
          {isAdmin&&(
            <div style={{...S.card,marginBottom:16}}>
              <div style={{fontSize:12,color:C.grisChaud,marginBottom:8}}>Publier une annonce officielle</div>
              <textarea value={texteAnnonce} onChange={e=>setTexteAnnonce(e.target.value)} placeholder="Texte de l'annonce…" style={{...S.input,minHeight:70,resize:"vertical",marginBottom:8}}/>
              <button onClick={()=>envoyerMessage("annonce")} disabled={!texteAnnonce.trim()} style={{...S.btnP,opacity:texteAnnonce.trim()?1:0.5}}>Publier l'annonce</button>
            </div>
          )}
          {messages.filter(m=>m.type==="annonce").length===0&&<div style={{color:C.grisChaud,fontSize:13}}>Aucune annonce.</div>}
          {messages.filter(m=>m.type==="annonce").map(m=>(
            <div key={m.id} style={{...S.card,borderLeft:`4px solid ${C.secondary}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <span style={{...S.badge,background:C.rougeClair,color:C.secondary,marginBottom:4}}>Annonce</span>
                  <div style={{fontSize:10,color:C.grisChaud}}>{m.auteur_nom} · {fdt(m.created_at)}</div>
                </div>
                {isAdmin&&<button onClick={()=>setConfirm({msg:"Supprimer ?",fn:()=>supprimerMessage(m.id)})} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"4px 7px",borderRadius:6,fontSize:12}}>🗑</button>}
              </div>
              <div style={{fontSize:13,color:C.primary,lineHeight:1.6,whiteSpace:"pre-line"}}>{m.contenu}</div>
            </div>
          ))}
        </>
      )}

      {confirm&&<Confirm msg={confirm.msg} onConfirm={confirm.fn} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── MEMBRES ────────────────────────────────────────────────────────
function MembresTab({isAdmin,showToast,currentUser,setCurrentUser}) {
  const [membres,setMembres] = useState([]);
  const [loading,setLoading] = useState(true);
  const [modal,setModal] = useState(null);
  const [confirm,setConfirm] = useState(null);
  const [search,setSearch] = useState("");

  useEffect(()=>{
    supabase.from("membres").select("*").order("nom").then(({data})=>{setMembres(data||[]);setLoading(false);});
  },[]);

  const filtered = membres.filter(m=>`${m.prenom} ${m.nom} ${m.role}`.toLowerCase().includes(search.toLowerCase()));

  const Form = ({init}) => {
    const [f,setF] = useState(init||{prenom:"",nom:"",email:"",role:"",adresse:"",is_admin:false});
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const save = async() => {
      if(!f.prenom||!f.nom) return;
      const payload={prenom:f.prenom,nom:f.nom,email:f.email||"",role:f.role||"",adresse:f.adresse||"",is_admin:f.is_admin||false};
      if(f.id){
        await supabase.from("membres").update(payload).eq("id",f.id);
        setMembres(m=>m.map(x=>x.id===f.id?{...x,...payload}:x));
        if(currentUser?.id===f.id) setCurrentUser(u=>({...u,...payload}));
      } else {
        const{data,error}=await supabase.from("membres").insert([payload]).select("*").single();
        if(error){alert("Erreur: "+error.message);return;}
        if(data) setMembres(m=>[...m,data].sort((a,b)=>a.nom.localeCompare(b.nom)));
      }
      showToast(f.id?"Modifié ✓":"Ajouté ✓");setModal(null);
    };
    return (
      <Modal title={f.id?"Modifier membre":"Nouveau membre"} onClose={()=>setModal(null)}>
        <label style={S.label}>Prénom *</label><input style={S.input} value={f.prenom} onChange={e=>s("prenom",e.target.value)}/>
        <label style={S.label}>Nom *</label><input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
        <label style={S.label}>Email</label><input style={S.input} value={f.email||""} onChange={e=>s("email",e.target.value)}/>
        <label style={S.label}>Rôle / Instrument</label><input style={S.input} value={f.role||""} onChange={e=>s("role",e.target.value)} placeholder="1ère trompe, cor…"/>
        <label style={S.label}>Adresse</label><input style={S.input} value={f.adresse||""} onChange={e=>s("adresse",e.target.value)}/>
        {isAdmin&&<label style={{...S.label,display:"flex",alignItems:"center",gap:8,textTransform:"none",fontSize:13,marginBottom:14,cursor:"pointer"}}><input type="checkbox" checked={f.is_admin||false} onChange={e=>s("is_admin",e.target.checked)} style={{width:16,height:16}}/>Administrateur</label>}
        <button style={S.btnP} onClick={save}>{f.id?"Enregistrer":"Ajouter"}</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  const MonProfil = () => {
    const [f,setF] = useState({...currentUser});
    const s=(k,v)=>setF(x=>({...x,[k]:v}));
    const save = async() => {
      const payload={prenom:f.prenom,nom:f.nom,role:f.role||"",adresse:f.adresse||""};
      await supabase.from("membres").update(payload).eq("id",f.id);
      setCurrentUser(u=>({...u,...payload}));
      setMembres(m=>m.map(x=>x.id===f.id?{...x,...payload}:x));
      showToast("Profil mis à jour ✓");setModal(null);
    };
    return (
      <Modal title="Mon profil" onClose={()=>setModal(null)}>
        <div style={{width:56,height:56,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:20,margin:"0 auto 18px"}}>
          {f.prenom?.[0]}{f.nom?.[0]}
        </div>
        <label style={S.label}>Prénom</label><input style={S.input} value={f.prenom||""} onChange={e=>s("prenom",e.target.value)}/>
        <label style={S.label}>Nom</label><input style={S.input} value={f.nom||""} onChange={e=>s("nom",e.target.value)}/>
        <label style={S.label}>Email</label><input style={{...S.input,opacity:0.6}} value={f.email||""} disabled/>
        <label style={S.label}>Rôle / Instrument</label><input style={S.input} value={f.role||""} onChange={e=>s("role",e.target.value)}/>
        <label style={S.label}>Adresse</label><input style={S.input} value={f.adresse||""} onChange={e=>s("adresse",e.target.value)}/>
        <button style={S.btnP} onClick={save}>Enregistrer</button>
        <button style={S.btnS} onClick={()=>setModal(null)}>Annuler</button>
      </Modal>
    );
  };

  if(loading) return <Spinner/>;

  return (
    <>
      {/* Barre recherche */}
      <input
        value={search}
        onChange={e=>setSearch(e.target.value)}
        placeholder="Rechercher un membre…"
        style={{...S.input,marginBottom:16}}
      />

      {/* Mon profil */}
      {currentUser&&(
        <div onClick={()=>setModal("profil")} style={{...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:16,borderColor:C.primary}}>
          <Avatar nom={currentUser.nom} prenom={currentUser.prenom} size={40}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:C.primary,fontSize:13}}>{currentUser.prenom} {currentUser.nom} <span style={{fontSize:10,color:C.secondary,fontWeight:400}}>(moi)</span></div>
            <div style={{fontSize:11,color:C.grisChaud}}>{currentUser.role}</div>
          </div>
          <span style={{fontSize:12,color:C.grisChaud}}>Modifier</span>
        </div>
      )}

      <div style={S.secTitle}>Membres ({filtered.length})</div>

      {filtered.map(m=>(
        <div key={m.id} style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
          <Avatar nom={m.nom} prenom={m.prenom} size={40}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,color:C.primary,fontSize:13}}>{m.prenom} {m.nom}{m.is_admin&&<span style={{...S.badge,background:C.rougeClair,color:C.secondary,marginLeft:6,fontSize:8}}>Admin</span>}</div>
            <div style={{fontSize:11,color:C.grisChaud,marginTop:2}}>{m.role}</div>
            {m.adresse&&<a href={`https://maps.google.com/?q=${encodeURIComponent(m.adresse)}`} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.secondary,textDecoration:"none",display:"block",marginTop:2}}>📍 {m.adresse}</a>}
            {m.email&&<div style={{fontSize:10,color:C.grisChaud,marginTop:1}}>{m.email}</div>}
          </div>
          {isAdmin&&m.id!==currentUser?.id&&<AA onEdit={()=>setModal({t:"edit",data:m})} onDelete={()=>setConfirm({msg:`Supprimer ${m.prenom} ${m.nom} ?`,fn:async()=>{await supabase.from("membres").delete().eq("id",m.id);setMembres(prev=>prev.filter(x=>x.id!==m.id));showToast("Supprimé ✓");setConfirm(null);}})}/>}
        </div>
      ))}

      {isAdmin&&<BtnPlus onClick={()=>setModal({t:"new"})}/>}
      {modal==="profil"&&<MonProfil/>}
      {modal?.t==="edit"&&<Form init={modal.data}/>}
      {modal?.t==="new"&&<Form init={null}/>}
      {confirm&&<Confirm msg={confirm.msg} onConfirm={confirm.fn} onClose={()=>setConfirm(null)}/>}
    </>
  );
}

// ── MON COMPTE ─────────────────────────────────────────────────────
function MonCompte({onClose,currentUser,setCurrentUser,showToast}) {
  const [page,setPage] = useState("profil");
  const [f,setF] = useState({
    prenom:currentUser?.prenom||"",
    nom:currentUser?.nom||"",
    email:currentUser?.email||"",
    role:currentUser?.role||"",
    adresse:currentUser?.adresse||"",
  });
  const [mdp,setMdp] = useState({nouveau:"",confirm:""});
  const [loading,setLoading] = useState(false);
  const [errMdp,setErrMdp] = useState("");

  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const sm=(k,v)=>setMdp(x=>({...x,[k]:v}));

  const saveProfil = async() => {
    if(!f.prenom||!f.nom) return;
    setLoading(true);
    const payload={prenom:f.prenom,nom:f.nom,role:f.role||"",adresse:f.adresse||""};
    const{error}=await supabase.from("membres").update(payload).eq("id",currentUser.id);
    if(error){alert("Erreur: "+error.message);setLoading(false);return;}
    setCurrentUser(u=>({...u,...payload}));
    showToast("Profil mis à jour ✓");
    setLoading(false);
  };

  const saveMdp = async() => {
    setErrMdp("");
    if(!mdp.nouveau) {setErrMdp("Saisis un nouveau mot de passe");return;}
    if(mdp.nouveau.length<6) {setErrMdp("Minimum 6 caractères");return;}
    if(mdp.nouveau!==mdp.confirm) {setErrMdp("Les mots de passe ne correspondent pas");return;}
    setLoading(true);
    const{error}=await supabase.auth.updateUser({password:mdp.nouveau});
    if(error){setErrMdp("Erreur : "+error.message);setLoading(false);return;}
    showToast("Mot de passe modifié ✓");
    setMdp({nouveau:"",confirm:""});
    setLoading(false);
  };

  const initials = `${currentUser?.prenom?.[0]||""}${currentUser?.nom?.[0]||""}`;

  return (
    <Modal title="Mon compte" onClose={onClose}>
      {/* Avatar + nom */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:24,margin:"0 auto 10px"}}>
          {initials}
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:16}}>{currentUser?.prenom} {currentUser?.nom}</div>
        <div style={{fontSize:12,color:C.grisChaud}}>{currentUser?.role}</div>
        {currentUser?.is_admin&&<span style={{...S.badge,background:C.rougeClair,color:C.secondary,marginTop:4}}>Admin</span>}
      </div>

      {/* Onglets */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["profil","Mon profil"],["mdp","Mot de passe"]].map(([id,l])=>(
          <button key={id} onClick={()=>setPage(id)} style={{flex:1,padding:"8px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:page===id?700:400,background:page===id?C.primary:"#E8E0D0",color:page===id?"#fff":C.grisChaud,fontSize:12}}>
            {l}
          </button>
        ))}
      </div>

      {page==="profil"&&(
        <>
          <label style={S.label}>Prénom</label>
          <input style={S.input} value={f.prenom} onChange={e=>s("prenom",e.target.value)}/>
          <label style={S.label}>Nom</label>
          <input style={S.input} value={f.nom} onChange={e=>s("nom",e.target.value)}/>
          <label style={S.label}>Email</label>
          <input style={{...S.input,opacity:0.5}} value={f.email} disabled/>
          <label style={S.label}>Rôle / Instrument</label>
          <input style={S.input} value={f.role} onChange={e=>s("role",e.target.value)} placeholder="1ère trompe…"/>
          <label style={S.label}>Adresse</label>
          <input style={S.input} value={f.adresse} onChange={e=>s("adresse",e.target.value)}/>
          <button style={{...S.btnP,opacity:loading?0.6:1}} onClick={saveProfil} disabled={loading}>
            {loading?"Enregistrement…":"Enregistrer"}
          </button>
        </>
      )}

      {page==="mdp"&&(
        <>
          <div style={{background:C.bleuClair,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:C.primary}}>
            Pour changer ton mot de passe, saisis le nouveau deux fois et confirme.
          </div>
          <label style={S.label}>Nouveau mot de passe</label>
          <input type="password" style={S.input} value={mdp.nouveau} onChange={e=>sm("nouveau",e.target.value)} placeholder="Minimum 6 caractères"/>
          <label style={S.label}>Confirmer le mot de passe</label>
          <input type="password" style={S.input} value={mdp.confirm} onChange={e=>sm("confirm",e.target.value)} placeholder="Répète le mot de passe"/>
          {errMdp&&<div style={{background:C.rougeClair,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.secondary,marginBottom:10}}>{errMdp}</div>}
          <button style={{...S.btnP,opacity:loading?0.6:1}} onClick={saveMdp} disabled={loading}>
            {loading?"Enregistrement…":"Changer le mot de passe"}
          </button>
        </>
      )}

      <button onClick={async()=>{await supabase.auth.signOut();onClose();}} style={{...S.btnD,marginTop:12}}>
        Déconnexion
      </button>
    </Modal>
  );
}

// ── MODAL ADMIN ────────────────────────────────────────────────────
function ModalAdmin({onClose,apparence,setApparence,showToast}) {
  const [page,setPage] = useState(null);
  const [local,setLocal] = useState({...apparence});
  const s=(k,v)=>setLocal(a=>({...a,[k]:v}));

  const save = async() => {
    setApparence(local);
    const{error} = await supabase.from("apparence").upsert({
      id:1,
      bulle_color:local.bulleColor, bulle_icon:local.bulleIcon,
      header_color:local.headerColor, accent_color:local.accentColor,
      nom_groupe:local.nomGroupe||"", sous_titre:local.sousTitre||"", logo_url:local.logoUrl||"",
    },{onConflict:"id"});
    if(error) { alert("Erreur sauvegarde: "+error.message); return; }
    showToast("Enregistré ✓"); setPage(null);
  };

  const COLS_HEADER=[{v:"#1A1F6E",l:"Bleu marine"},{v:"#C8102E",l:"Rouge"},{v:"#1B2A1A",l:"Vert forêt"},{v:"#212121",l:"Noir"},{v:"#4A148C",l:"Violet"}];
  const COLS_ACCENT=[{v:"#C8102E",l:"Rouge"},{v:"#C8860A",l:"Or"},{v:"#3949AB",l:"Bleu"},{v:"#7B1FA2",l:"Violet"},{v:"#E65100",l:"Orange"}];
  const COLS_BULLE=[{v:"#C8102E",l:"Rouge"},{v:"#1A1F6E",l:"Bleu"},{v:"#3949AB",l:"Bleu clair"},{v:"#7B1FA2",l:"Violet"},{v:"#1B5E20",l:"Vert"},{v:"#212121",l:"Noir"}];
  const ICONS_BULLE=["▶","🎶","🎵","🎺","♪","🔊",""];

  const ColorRow = ({options,k}) => (
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18}}>
      {options.map(o=>(
        <div key={o.v} onClick={()=>s(k,o.v)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:o.v,border:local[k]===o.v?"3px solid #333":"2px solid #D4C9B0"}}/>
          <span style={{fontSize:9,color:C.grisChaud}}>{o.l}</span>
        </div>
      ))}
    </div>
  );

  const MENU=[
    {id:"identite", e:"🏷️", l:"Identité du groupe", d:"Nom, sous-titre, logo"},
    {id:"couleurs", e:"🎨", l:"Couleurs",            d:"Header, accent, boutons"},
    {id:"audio",    e:"🔴", l:"Lecteur audio",       d:"Couleur et icône du bouton play"},
  ];

  if(!page) return (
    <Modal title="Paramètres admin" onClose={onClose}>
      {MENU.map(item=>(
        <div key={item.id} onClick={()=>setPage(item.id)} style={{...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}}>
          <span style={{fontSize:22}}>{item.e}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,color:C.primary,fontSize:13}}>{item.l}</div>
            <div style={{fontSize:11,color:C.grisChaud}}>{item.d}</div>
          </div>
          <span style={{color:C.grisChaud,fontSize:18}}>›</span>
        </div>
      ))}
      <button style={S.btnS} onClick={onClose}>Fermer</button>
    </Modal>
  );

  if(page==="identite") return (
    <Modal title="Identité du groupe" onClose={()=>setPage(null)}>
      {/* Aperçu */}
      <div style={{background:local.headerColor||C.primary,borderRadius:12,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
        {local.logoUrl
          ? <img src={local.logoUrl} alt="logo" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>
          : <TrompeLogo size={36} color={local.accentColor||C.secondary}/>
        }
        <div>
          <div style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14}}>{local.nomGroupe||"Nom du groupe"}</div>
          <div style={{color:"#A8B8D8",fontSize:10}}>{local.sousTitre||"Sous-titre"}</div>
        </div>
      </div>

      <label style={S.label}>Nom du groupe</label>
      <input style={S.input} value={local.nomGroupe||""} onChange={e=>s("nomGroupe",e.target.value)} placeholder="Ex: Les Echos d'Occitanie"/>

      <label style={S.label}>Sous-titre</label>
      <input style={S.input} value={local.sousTitre||""} onChange={e=>s("sousTitre",e.target.value)} placeholder="Ex: Trompe de Chasse"/>

      <label style={S.label}>Logo (optionnel)</label>
      {local.logoUrl ? (
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <img src={local.logoUrl} alt="logo" style={{width:56,height:56,borderRadius:10,objectFit:"cover",border:"2px solid #D4C9B0"}}/>
          <div>
            <div style={{fontSize:11,color:C.vert,marginBottom:6,fontWeight:600}}>Logo prêt</div>
            <button onClick={()=>s("logoUrl","")} style={{background:C.rougeClair,border:"none",cursor:"pointer",padding:"6px 12px",borderRadius:8,color:C.secondary,fontSize:12,fontWeight:600}}>Supprimer</button>
          </div>
        </div>
      ) : (
        <FileUpload
          label="Choisir une image (JPG, PNG…)"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onUploaded={({url})=>s("logoUrl",url)}
        />
      )}

      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  if(page==="couleurs") return (
    <Modal title="Couleurs" onClose={()=>setPage(null)}>
      <div style={{height:48,borderRadius:10,background:local.headerColor,marginBottom:16,display:"flex",alignItems:"center",paddingLeft:14}}>
        <span style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:13}}>Aperçu header</span>
      </div>
      <label style={S.label}>Couleur du header</label>
      <ColorRow options={COLS_HEADER} k="headerColor"/>
      <label style={S.label}>Couleur accent</label>
      <ColorRow options={COLS_ACCENT} k="accentColor"/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  if(page==="audio") return (
    <Modal title="Lecteur audio" onClose={()=>setPage(null)}>
      <div style={{display:"flex",alignItems:"center",gap:12,background:"#F0F0F0",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:local.bulleColor,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:700}}>{local.bulleIcon||"▶"}</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:C.primary,fontSize:13}}>La Royale — Aperçu</div>
          <div style={{fontSize:11,color:C.grisChaud}}>Fanfare</div>
        </div>
      </div>
      <label style={S.label}>Icône</label>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
        {ICONS_BULLE.map((o,i)=>(
          <button key={i} onClick={()=>s("bulleIcon",o)} style={{width:52,height:52,borderRadius:10,border:local.bulleIcon===o?`2px solid ${C.secondary}`:"1px solid #D4C9B0",background:local.bulleIcon===o?C.rougeClair:C.blanc,cursor:"pointer",fontSize:o?22:12,color:o?"inherit":C.grisChaud,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {o||"∅"}
          </button>
        ))}
      </div>
      <label style={S.label}>Couleur</label>
      <ColorRow options={COLS_BULLE} k="bulleColor"/>
      <button style={S.btnP} onClick={save}>Enregistrer</button>
      <button style={S.btnS} onClick={()=>setPage(null)}>Retour</button>
    </Modal>
  );

  return null;
}

// ── AUTH ───────────────────────────────────────────────────────────
function AuthScreen({onClose}) {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const login = async() => {
    if(!email||!password) return;
    setLoading(true);setError("");
    const{error:err}=await supabase.auth.signInWithPassword({email,password});
    if(err){setError("Email ou mot de passe incorrect.");setLoading(false);}
    else onClose?.();
  };
  return (
    <div style={{padding:"20px 0"}}>
      <label style={S.label}>Email</label>
      <input type="email" placeholder="ton@email.fr" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} style={S.input}/>
      <label style={S.label}>Mot de passe</label>
      <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} style={S.input}/>
      {error&&<div style={{background:C.rougeClair,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.secondary,marginBottom:10}}>{error}</div>}
      <button onClick={login} disabled={loading} style={S.btnP}>{loading?"Connexion…":"Se connecter"}</button>
      {onClose&&<button onClick={onClose} style={S.btnS}>Annuler</button>}
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────
const IcHome    = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const IcCal     = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcMedia   = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IcMsg     = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcMembers = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const TABS=[
  {id:"accueil",  l:"Accueil",  ic:<IcHome/>},
  {id:"agenda",   l:"Agenda",   ic:<IcCal/>},
  {id:"medias",   l:"Medias",   ic:<IcMedia/>},
  {id:"messages", l:"Messages", ic:<IcMsg/>},
  {id:"membres",  l:"Membres",  ic:<IcMembers/>},
];

export default function App() {
  const [session,setSession] = useState(undefined);
  const [tab,setTab] = useState("accueil");
  const [isAdmin,setIsAdmin] = useState(false);
  const [currentUser,setCurrentUser] = useState(null);
  const [toast,setToast] = useState(null);
  const [loginModal,setLoginModal] = useState(false);
  const [adminModal,setAdminModal] = useState(false);
  const [compteModal,setCompteModal] = useState(false);
  const [favoris,setFavoris] = useState([]);
  const [allEvents,setAllEvents] = useState([]);
  const [apparence,setApparenceState] = useState({
    bulleColor:"#C8102E", bulleIcon:"▶", headerColor:"#1A1F6E", accentColor:"#C8102E",
    nomGroupe:"Les Echos d'Occitanie", sousTitre:"Trompe de Chasse", logoUrl:"",
  });

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      setSession(data.session);
      if(data.session) loadUser(data.session.user.email);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{
      setSession(s);
      if(s) loadUser(s.user.email);
      else{setIsAdmin(false);setCurrentUser(null);}
    });
    return()=>subscription.unsubscribe();
  },[]);

  const loadUser = async(email) => {
    const{data}=await supabase.from("membres").select("*").eq("email",email).single();
    if(data){setIsAdmin(data.is_admin||false);setCurrentUser(data);}
  };

  useEffect(()=>{
    supabase.from("evenements").select("*").order("date").then(({data})=>setAllEvents(data||[]));
    supabase.from("apparence").select("*").eq("id",1).single().then(({data})=>{
      if(data) setApparenceState({
        bulleColor:data.bulle_color||"#C8102E", bulleIcon:data.bulle_icon||"▶",
        headerColor:data.header_color||"#1A1F6E", accentColor:data.accent_color||"#C8102E",
        nomGroupe:data.nom_groupe||"Les Echos d'Occitanie",
        sousTitre:data.sous_titre||"Trompe de Chasse",
        logoUrl:data.logo_url||"",
      });
    });
  },[]);

  const showToast = (msg) => {setToast(msg);setTimeout(()=>setToast(null),2200);};

  if(session===undefined) return <div style={{minHeight:"100vh",background:C.parchemin}}/>;

  const hColor = apparence.headerColor||C.primary;
  const aColor = apparence.accentColor||C.secondary;

  return (
    <div style={{minHeight:"100vh",background:C.parchemin,fontFamily:"Inter,sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap'); *{box-sizing:border-box} ::-webkit-scrollbar{display:none}`}</style>

      {/* Header */}
      <div style={{background:hColor,padding:"14px 16px 0",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 16px rgba(26,31,110,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {apparence.logoUrl
              ? <img src={apparence.logoUrl} alt="logo" style={{width:32,height:32,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
              : <TrompeLogo size={32} color={aColor}/>
            }
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",color:"#fff",fontSize:15,fontWeight:700,lineHeight:1.2}}>{apparence.nomGroupe}</div>
              <div style={{color:"#A8B8D8",fontSize:10,letterSpacing:"0.07em",textTransform:"uppercase"}}>{apparence.sousTitre}{isAdmin?" · Admin":currentUser?" · Membre":""}</div>
            </div>
          </div>
          <div>
            {session ? (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {isAdmin&&(
                  <button onClick={()=>setAdminModal(true)} style={{background:C.secondary+"33",border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:20,color:aColor,fontSize:10,fontWeight:700}}>Admin</button>
                )}
                <button onClick={()=>setCompteModal(true)} style={{width:32,height:32,borderRadius:"50%",background:"#ffffff22",border:"2px solid #ffffff44",cursor:"pointer",color:"#fff",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {currentUser ? `${currentUser.prenom?.[0]||""}${currentUser.nom?.[0]||""}` : "?"}
                </button>
              </div>
            ) : (
              <button onClick={()=>setLoginModal(true)} style={{background:aColor,border:"none",cursor:"pointer",padding:"7px 14px",borderRadius:10,color:"#fff",fontSize:11,fontWeight:700}}>
                Connexion
              </button>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div style={{display:"flex"}}>
          {TABS.map(t=>{
            const active=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 2px 10px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:active?aColor:"#6B8AAA",position:"relative",transition:"color 0.18s"}}>
                {t.ic}
                <span style={{fontSize:7,fontWeight:active?700:400,letterSpacing:"0.03em",textTransform:"uppercase"}}>{t.l}</span>
                {active&&<div style={{position:"absolute",bottom:0,left:"10%",right:"10%",height:2,background:aColor,borderRadius:"2px 2px 0 0"}}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu */}
      <div style={{padding:"18px 14px 80px"}}>
        {tab==="accueil"  &&<AccueilTab favoris={favoris} allEvents={allEvents} apparence={apparence} currentUser={currentUser} showToast={showToast}/>}
        {tab==="agenda"   &&<AgendaTab isAdmin={isAdmin} showToast={showToast} allEvents={allEvents} setAllEvents={setAllEvents} currentUser={currentUser} apparence={apparence}/>}
        {tab==="medias"   &&<MediasTab isAdmin={isAdmin} showToast={showToast} favoris={favoris} setFavoris={setFavoris} apparence={apparence}/>}
        {tab==="messages" &&<MessagesTab isAdmin={isAdmin} showToast={showToast} currentUser={currentUser}/>}
        {tab==="membres"  &&<MembresTab isAdmin={isAdmin} showToast={showToast} currentUser={currentUser} setCurrentUser={setCurrentUser}/>}
      </div>

      {/* Modal mon compte */}
      {compteModal&&currentUser&&(
        <MonCompte
          onClose={()=>setCompteModal(false)}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          showToast={showToast}
        />
      )}

      {/* Modal connexion */}
      {loginModal&&(
        <Modal title="Connexion" onClose={()=>setLoginModal(false)}>
          <AuthScreen onClose={()=>setLoginModal(false)}/>
        </Modal>
      )}

      {/* Modal admin */}
      {adminModal&&(
        <ModalAdmin
          onClose={()=>setAdminModal(false)}
          apparence={apparence}
          setApparence={(ap)=>setApparenceState(ap)}
          showToast={showToast}
        />
      )}

      {toast&&<Toast msg={toast}/>}
    </div>
  );
}