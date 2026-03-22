"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:"#0f1f3d",
  navyL:"#1a3260",
  navyM:"#243d6e",
  gold:"#c9a84c",
  goldL:"#e8c96a",
  goldPale:"#fdf8ee",
  teal:"#0e7a6e",
  tealL:"#14a899",
  tealPale:"#e4f5f3",
  red:"#bf2a2a",
  redPale:"#fdf0f0",
  orange:"#d4721a",
  orangePale:"#fef4e8",
  green:"#1e8c4a",
  greenPale:"#eaf6ef",
  purple:"#6b3fa0",
  purplePale:"#f4eeff",
  gray50:"#f7f8fc",
  gray100:"#eef0f6",
  gray200:"#dde1ed",
  gray400:"#8f96ac",
  gray600:"#555e78",
  gray800:"#1b2135",
  white:"#ffffff",
};
const font = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const fontD = "'Playfair Display', Georgia, serif";

// ─── RÔLES ────────────────────────────────────────────────────────────────────
const ROLES = {
  manager:   { label:"Manager / Associé", color:C.purple, modules:"all",    canEdit:true,  canAdmin:true  },
  cm:        { label:"Chef de mission",   color:C.teal,   modules:"most",   canEdit:true,  canAdmin:false },
  collab:    { label:"Collaborateur",     color:C.navy,   modules:"limited",canEdit:false, canAdmin:false },
};

const USERS_INIT = [
  { id:1, nom:"Aurélie Morin",    role:"manager", email:"a.morin@nkac.sn",    avatar:"AM", actif:true  },
  { id:2, nom:"Thomas Garnier",   role:"cm",      email:"t.garnier@nkac.sn",  avatar:"TG", actif:true  },
  { id:3, nom:"Camille Petit",    role:"collab",  email:"c.petit@nkac.sn",    avatar:"CP", actif:true  },
  { id:4, nom:"Hugo Renard",      role:"collab",  email:"h.renard@nkac.sn",   avatar:"HR", actif:true  },
  { id:5, nom:"Marième Diallo",   role:"cm",      email:"m.diallo@nkac.sn",   avatar:"MD", actif:true  },
];

// ─── DONNÉES MÉTIER ───────────────────────────────────────────────────────────
const DOSSIERS_INIT = [
  {id:1,nom:"360 OFFICE TEAM",domaine:"Restauration",typeMission:"Présentation - ACJF",senior:"Mari",cm:"Moussa Ndaw",collaborateur:"Ndella",support:"",jourIntervention:"",observations:""},
  {id:2,nom:"AMI",domaine:"Formation",typeMission:"Présentation - ACJF",senior:"Ouley",cm:"Rokhaya Faye",collaborateur:"Joseph",support:"",jourIntervention:"",observations:""},
  {id:3,nom:"ATP BTP",domaine:"BTP",typeMission:"Présentation - ACJF",senior:"Ouley",cm:"Noellie CISS",collaborateur:"B. Natacha",support:"",jourIntervention:"",observations:""},
  {id:4,nom:"AVICO SARL",domaine:"Aviculture",typeMission:"Présentation - ACJF",senior:"Ouley",cm:"Hadja Hawa",collaborateur:"Rokhaya Faye",support:"HAWA",jourIntervention:"",observations:""},
  {id:5,nom:"BE FOR AFRICA",domaine:"Conseil",typeMission:"Présentation - ACJF",senior:"",cm:"Clautilde Coly",collaborateur:"Hadja Hawa",support:"",jourIntervention:"",observations:""},
  {id:6,nom:"CHARGEL SASU",domaine:"Services",typeMission:"Présentation - ACJF",senior:"",cm:"Hadja Hawa",collaborateur:"Clautilde Coly",support:"",jourIntervention:"",observations:""},
  {id:7,nom:"ADN SOLUTION",domaine:"Informatique",typeMission:"Présentation - ACJF",senior:"",cm:"Ouleymatou MAREGA",collaborateur:"Clautilde Coly",support:"",jourIntervention:"",observations:""},
  {id:8,nom:"AMIFA SA",domaine:"Microfinance",typeMission:"Assistance fiscale",senior:"",cm:"Hadja Hawa",collaborateur:"",support:"",jourIntervention:"",observations:""},
  {id:9,nom:"AGIL",domaine:"Services Informatiques",typeMission:"Présentation - ACJF",senior:"",cm:"Ouleymatou MAREGA",collaborateur:"Alfred Ndong",support:"",jourIntervention:"",observations:""},
  {id:10,nom:"DAKAR FAMILY MARKET",domaine:"Distribution",typeMission:"Présentation - ACJF",senior:"",cm:"Faye",collaborateur:"",support:"",jourIntervention:"",observations:""},
];

const HEBDO_INIT = [
  {id:1,action:"DCA EOSEN",responsable:"Marième",backup:"",echeance:"2026-03-20",statut:"En-cours",revision:"",observations:"Immo-Personnel-tréso fait"},
  {id:2,action:"DCA COSENA",responsable:"Mouhamed",backup:"",echeance:"2026-03-20",statut:"",revision:"",observations:"Rubriques renseignées"},
  {id:3,action:"DCA IMB",responsable:"Hawa",backup:"",echeance:"2026-03-20",statut:"",revision:"",observations:""},
  {id:4,action:"Paie AMIFA",responsable:"Hawa",backup:"Emile",echeance:"2026-03-20",statut:"",revision:"",observations:""},
  {id:5,action:"Révision DFM-HEMISPHERE",responsable:"Oule",backup:"",echeance:"2026-03-20",statut:"",revision:"",observations:""},
];

const ARRETES_INIT = [
  {id:1,dossier:"360 OFFICE TEAM",cm:"Moussa Ndaw",collaborateur:"Ndella",deadline:"",dcaFaire:"",correctionDca:"",revueDca:"",dateRevue:"",celVa:"",declarIS:"",irvm:"",etatsFinanciers:"",validationClient:"",benefEffectifs:"",declarRect:"",noteSynthese:"",pvAgo:"",visaEF:"",depotSenEtafi:"",validationSenEtafi:"",dateDepot:"",bouclage:"",envoisDecharges:"",observations:"N/A"},
  {id:2,dossier:"AMI",cm:"Rokhaya Faye",collaborateur:"",deadline:"2026-03-31",dcaFaire:"",correctionDca:"Noellie",revueDca:"",dateRevue:"",celVa:"",declarIS:"",irvm:"",etatsFinanciers:"",validationClient:"",benefEffectifs:"",declarRect:"",noteSynthese:"",pvAgo:"",visaEF:"",depotSenEtafi:"",validationSenEtafi:"",dateDepot:"",bouclage:"",envoisDecharges:"",observations:""},
  {id:3,dossier:"ATP BTP",cm:"Clautil",collaborateur:"",deadline:"2026-02-28",dcaFaire:"FAIT",correctionDca:"Noellie",revueDca:"FAIT",dateRevue:"2026-03-11",celVa:"",declarIS:"",irvm:"",etatsFinanciers:"",validationClient:"",benefEffectifs:"",declarRect:"",noteSynthese:"",pvAgo:"",visaEF:"",depotSenEtafi:"",validationSenEtafi:"",dateDepot:"",bouclage:"",envoisDecharges:"",observations:""},
  {id:4,dossier:"AVICO SARL",cm:"Hadja Hawa",collaborateur:"Rokhaya Faye",deadline:"2026-03-31",dcaFaire:"",correctionDca:"Malick",revueDca:"",dateRevue:"",celVa:"",declarIS:"",irvm:"",etatsFinanciers:"",validationClient:"",benefEffectifs:"",declarRect:"",noteSynthese:"",pvAgo:"",visaEF:"",depotSenEtafi:"",validationSenEtafi:"",dateDepot:"",bouclage:"",envoisDecharges:"",observations:""},
  {id:5,dossier:"BE FOR AFRICA",cm:"Clautilde Coly",collaborateur:"",deadline:"2026-04-30",dcaFaire:"",correctionDca:"Malick",revueDca:"",dateRevue:"",celVa:"",declarIS:"",irvm:"",etatsFinanciers:"",validationClient:"",benefEffectifs:"",declarRect:"",noteSynthese:"",pvAgo:"",visaEF:"",depotSenEtafi:"",validationSenEtafi:"",dateDepot:"",bouclage:"",envoisDecharges:"",observations:""},
];

const CATEG_INIT = [
  {id:1,client:"AGIL",secteur:"Services Informatiques",nature:"Normal",typologie:"Simple",documents:"Reporting trimestriel",particularites:"N/A",pointsAttention:"N/A",solvabilite:"Mauvais payeur",modeFacturation:"Trimestriel",modeReglement:"Chèque",montantTTC:354000,besoinConseil:""},
  {id:2,client:"AMI",secteur:"Formation",nature:"Normal",typologie:"Simple",documents:"Reporting trimestriel",particularites:"N/A",pointsAttention:"N/A",solvabilite:"Bon payeur",modeFacturation:"Mensuel",modeReglement:"Virement",montantTTC:413000,besoinConseil:""},
  {id:3,client:"ATP BTP",secteur:"BTP",nature:"Compliqué",typologie:"Simple",documents:"Reporting trimestriel",particularites:"N/A",pointsAttention:"N/A",solvabilite:"Bon payeur",modeFacturation:"Trimestriel",modeReglement:"Chèque",montantTTC:578200,besoinConseil:""},
  {id:4,client:"360 OFFICE TEAM",secteur:"Restauration",nature:"Compliqué",typologie:"Simple",documents:"Reporting trimestriel",particularites:"N/A",pointsAttention:"Attention particulière",solvabilite:"Mauvais payeur",modeFacturation:"Trimestriel",modeReglement:"Chèque",montantTTC:590000,besoinConseil:""},
  {id:5,client:"AVICO SARL",secteur:"Aviculture",nature:"Normal",typologie:"Simple",documents:"Reporting trimestriel",particularites:"N/A",pointsAttention:"N/A",solvabilite:"Bon payeur",modeFacturation:"Mensuel",modeReglement:"Virement",montantTTC:495000,besoinConseil:""},
];

const DECL_INIT = [
  {id:1,client:"ATP BTP",cm:"B. Natacha",centre:"CME2",tva:"",vrs:"",brs:"",timbre:"",cssIpres:"",bnc:"",ras:"",tsvpm:"2026-02-16",is1erAcompte:"",celVa:"",celVl:"",irvm:"",dateRetrait:""},
  {id:2,client:"AVICO SARL",cm:"Aicha Y",centre:"CME1",tva:"",vrs:"",brs:"",timbre:"",cssIpres:"",bnc:"",ras:"",tsvpm:"",is1erAcompte:"",celVa:"",celVl:"",irvm:"",dateRetrait:""},
  {id:3,client:"BE FOR AFRICA",cm:"Clautilde",centre:"Dakar-Liberté",tva:"",vrs:"",brs:"",timbre:"",cssIpres:"",bnc:"",ras:"",tsvpm:"",is1erAcompte:"2026-02-18",celVa:"",celVl:"",irvm:"",dateRetrait:""},
  {id:4,client:"DAKAR FAMILY MARKET",cm:"Faye",centre:"Ngor Almadies",tva:"2026-02-18",vrs:"2026-02-18",brs:"2026-02-18",timbre:"2026-02-18",cssIpres:"",bnc:"",ras:"",tsvpm:"",is1erAcompte:"",celVa:"",celVl:"",irvm:"",dateRetrait:""},
];

const TACHES_INIT = [
  {id:1,dossierId:3,typeMission:"Présentation - ACJF",superviseur:"Ouley",cm:"Noellie CISS",collaborateur:"B. Natacha",receptionPieces:"Oui",receptionReleves:"Oui",saisieJournaux:"Fait",lettrageComptes:"En cours",erb:"Non fait",traitementSuspens:"",commentaire:"Relevé février à recevoir",validationSaisie:"",revueDossier:"",reporting:"",observations:""},
  {id:2,dossierId:2,typeMission:"Présentation - ACJF",superviseur:"Ouley",cm:"Rokhaya Faye",collaborateur:"Joseph",receptionPieces:"",receptionReleves:"",saisieJournaux:"",lettrageComptes:"",erb:"",traitementSuspens:"",commentaire:"",validationSaisie:"",revueDossier:"",reporting:"",observations:""},
];

const ETAT1024_INIT = [
  {id:1,dossier:"360 OFFICE TEAM",typeMission:"Présentation - ACJF",senior:"Mouss",collaborateur:"Ndella",deadline:"2025-12-10",statutCreation:"Fait",benefEffectif:"",dads:"",loyerT1:"Fait",loyerT2:"Fait",loyerT3:"Fait",loyerT4:"",loyerAnnuel:"",tiersT1:"Fait",tiersT2:"Fait",tiersT3:"Fait",tiersT4:"",tiersAnnuel:"",celVl:"Fait",tsvp:"",statutDepot:"",observations:""},
  {id:2,dossier:"AMI",typeMission:"Présentation - ACJF",senior:"Ouley",collaborateur:"Rokha",deadline:"2025-12-10",statutCreation:"Fait",benefEffectif:"",dads:"Fait",loyerT1:"Fait",loyerT2:"Fait",loyerT3:"Fait",loyerT4:"Fait",loyerAnnuel:"Fait",tiersT1:"Fait",tiersT2:"Fait",tiersT3:"Fait",tiersT4:"Fait",tiersAnnuel:"Fait",celVl:"Fait",tsvp:"",statutDepot:"",observations:""},
  {id:3,dossier:"ATP BTP",typeMission:"Présentation - ACJF",senior:"Ouley",collaborateur:"B. Natacha",deadline:"2025-12-10",statutCreation:"En-cours",benefEffectif:"",dads:"",loyerT1:"Fait",loyerT2:"Fait",loyerT3:"",loyerT4:"",loyerAnnuel:"",tiersT1:"Fait",tiersT2:"",tiersT3:"",tiersT4:"",tiersAnnuel:"",celVl:"",tsvp:"",statutDepot:"",observations:""},
];

const INVENTAIRE_INIT = [
  {id:1,dossier:"360 OFFICE TEAM",cm:"Marième",collaborateur:"Mous",typeInventaire:"CAISSE / IMMOS",dates:"N/A",zone:"",heure:"",coordinateur:"",collaborateurNkac:"",observations:"STOCK"},
  {id:2,dossier:"AMI",cm:"Ouleyma",collaborateur:"B. Na",typeInventaire:"CAISSE / IMMOS",dates:"À faire par le client",zone:"Sacré Cœur",heure:"",coordinateur:"",collaborateurNkac:"",observations:""},
  {id:3,dossier:"ATP BTP",cm:"Ouleyma",collaborateur:"B. Na",typeInventaire:"CAISSE / IMMOS",dates:"À faire par le client",zone:"",heure:"",coordinateur:"",collaborateurNkac:"Envoyé au client le 30/12/2025",observations:"N/A"},
];

const REUNIONS_INIT = [
  {id:1,date:"2026-03-15",sujetOrga:"Organisation équipe Q1 2026",suiviDossiers:"Point sur dossiers en retard ATP BTP, AVICO",pointsTechniques:"CEL VA exercice 2025",difficultes:"Retard DCA AMI et AVICO",plansAction:"Renforcer back-up sur dossiers seniors absents",divers:"Recrutement stagiaire prévu avril",participants:"Aurélie, Thomas, Camille, Hugo",statut:"Tenu"},
];

const PLATEFORMES_INIT = [
  {id:1,client:"360 OFFICE TEAM",cm:"Mari",collaborateur:"Mous",plateforme:"E-Tax",ninea:"11064582 2C2",centreFiscal:"Grand Dakar",identifiant:"11064582",motDePasse:"Office@2024",observations:""},
  {id:2,client:"ATP BTP",cm:"Clau",collaborateur:"Ndel",plateforme:"SEN ETAFI",ninea:"",centreFiscal:"",identifiant:"noellie.ciss@nkac-audit.com",motDePasse:"ETAF@nkac2026",observations:""},
  {id:3,client:"AVICO SARL",cm:"Had",collaborateur:"Rokh",plateforme:"SEN ETAFI",ninea:"",centreFiscal:"",identifiant:"bamba.diop@nkac-audit.com",motDePasse:"ETAF@nkac2026",observations:""},
  {id:4,client:"ADN SOLUTION",cm:"Bamba",collaborateur:"",plateforme:"IPRES-CSS (Ndamli)",ninea:"",centreFiscal:"",identifiant:"adnsolutions",motDePasse:"Adnsolutions2022!",observations:""},
];

const BUDGET_INIT = [
  {id:1,client:"AGIL",montantConvenu:354000,periodicite:"Trimestriel",modeReglement:"Chèque",statut:"Payé",observations:""},
  {id:2,client:"AMI",montantConvenu:413000,periodicite:"Mensuel",modeReglement:"Virement",statut:"Payé",observations:""},
  {id:3,client:"ATP BTP",montantConvenu:578200,periodicite:"Trimestriel",modeReglement:"Chèque",statut:"En attente",observations:""},
  {id:4,client:"360 OFFICE TEAM",montantConvenu:590000,periodicite:"Trimestriel",modeReglement:"Chèque",statut:"Impayé",observations:"Relance effectuée"},
  {id:5,client:"AVICO SARL",montantConvenu:495000,periodicite:"Mensuel",modeReglement:"Virement",statut:"Payé",observations:""},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0,10);
const fmt = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const isOver = d => d && d < today;
const isSoon = d => d && d >= today && d <= new Date(Date.now()+7*864e5).toISOString().slice(0,10);
const fmtNum = n => n ? n.toLocaleString("fr-FR") : "0";
const SC = {"Fait":C.green,"FAIT":C.green,"Oui":C.green,"Effectuée":C.green,"Tenu":C.green,"Payé":C.green,
  "En cours":C.teal,"En-cours":C.teal,"En attente":C.orange,
  "Non fait":C.red,"Impayé":C.red,"N/A":C.gray400};
const sc = v => SC[v] || C.gray400;

// Export CSV helper
const exportCSV = (filename, cols, rows) => {
  const header = cols.map(c=>c.label).join(";");
  const body = rows.map(r => cols.map(c => `"${(r[c.key]||"").toString().replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF"+header+"\n"+body], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename+".csv"; a.click();
  URL.revokeObjectURL(url);
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Pill = ({label,color,small=false}) => (
  <span style={{background:(color||C.gray400)+"1a",color:color||C.gray400,border:`1px solid ${(color||C.gray400)}44`,
    borderRadius:20,padding:small?"1px 8px":"3px 11px",fontSize:small?10:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>
);

const Card = ({children,style={}}) => (
  <div style={{background:C.white,borderRadius:14,padding:"18px 20px",
    boxShadow:"0 2px 16px rgba(15,31,61,0.07)",border:`1px solid ${C.gray200}`,...style}}>{children}</div>
);

const Btn = ({children,variant="primary",size="md",style={},...p}) => {
  const v={primary:{bg:C.navy,color:C.white},gold:{bg:C.gold,color:C.navy},
    ghost:{bg:"transparent",color:C.navy,border:`1px solid ${C.gray200}`},
    danger:{bg:C.red,color:C.white},teal:{bg:C.teal,color:C.white},
    green:{bg:C.green,color:C.white},orange:{bg:C.orange,color:C.white}};
  const s={md:{padding:"7px 15px",fontSize:13},sm:{padding:"4px 10px",fontSize:11},lg:{padding:"10px 22px",fontSize:14}};
  const vs=v[variant]||v.primary;
  return <button {...p} style={{background:vs.bg,color:vs.color,border:vs.border||"none",
    ...s[size],borderRadius:8,fontWeight:700,cursor:"pointer",fontFamily:font,
    display:"inline-flex",alignItems:"center",gap:6,...style}}>{children}</button>;
};

const Inp = ({label,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:10,fontWeight:700,color:C.gray600,textTransform:"uppercase",letterSpacing:0.6}}>{label}</label>}
    <input {...p} style={{border:`1px solid ${C.gray200}`,borderRadius:7,padding:"6px 10px",fontSize:12,
      outline:"none",fontFamily:font,background:C.white,...p.style}}/>
  </div>
);

const Sel = ({label,children,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:10,fontWeight:700,color:C.gray600,textTransform:"uppercase",letterSpacing:0.6}}>{label}</label>}
    <select {...p} style={{border:`1px solid ${C.gray200}`,borderRadius:7,padding:"6px 10px",fontSize:12,
      outline:"none",fontFamily:font,background:C.white,...p.style}}>{children}</select>
  </div>
);

const TA = ({label,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:3}}>
    {label&&<label style={{fontSize:10,fontWeight:700,color:C.gray600,textTransform:"uppercase",letterSpacing:0.6}}>{label}</label>}
    <textarea {...p} style={{border:`1px solid ${C.gray200}`,borderRadius:7,padding:"6px 10px",fontSize:12,
      outline:"none",fontFamily:font,resize:"vertical",...p.style}}/>
  </div>
);

const Modal = ({title,onClose,children,wide=false}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(5,15,35,0.55)",zIndex:1000,
    display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:C.white,borderRadius:16,width:"100%",maxWidth:wide?820:520,
      maxHeight:"92vh",overflowY:"auto",boxShadow:"0 32px 100px rgba(0,0,0,0.3)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"16px 22px",borderBottom:`1px solid ${C.gray100}`,
        position:"sticky",top:0,background:C.white,zIndex:1}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.navy,fontFamily:font}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray400}}>×</button>
      </div>
      <div style={{padding:22}}>{children}</div>
    </div>
  </div>
);

const H = ({icon,title,sub,code,actions}) => (
  <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:C.navy,fontFamily:fontD}}>{icon} {title}</h2>
        {code&&<span style={{fontSize:10,color:C.gray400,background:C.gray100,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{code}</span>}
      </div>
      {sub&&<p style={{margin:"2px 0 0",color:C.gray400,fontSize:12}}>{sub}</p>}
    </div>
    {actions&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{actions}</div>}
  </div>
);

const KPI = ({icon,label,value,sub,color=C.navy}) => (
  <Card style={{flex:1,minWidth:130}}>
    <div style={{fontSize:18,marginBottom:3}}>{icon}</div>
    <div style={{fontSize:24,fontWeight:900,color,fontFamily:fontD,lineHeight:1}}>{value}</div>
    <div style={{fontSize:11,fontWeight:700,color:C.gray600,marginTop:3}}>{label}</div>
    {sub&&<div style={{fontSize:10,color:C.gray400,marginTop:1}}>{sub}</div>}
  </Card>
);

const G2 = ({children}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>{children}</div>;
const G3 = ({children}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>{children}</div>;
const Col = ({children,gap=14}) => <div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>;
const Row = ({children,gap=10}) => <div style={{display:"flex",gap,flexWrap:"wrap",alignItems:"center"}}>{children}</div>;

const SaveRow = ({onCancel,onSave}) => (
  <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:`1px solid ${C.gray100}`}}>
    <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
    <Btn onClick={onSave}>💾 Enregistrer</Btn>
  </div>
);

// Table générique avec export CSV
const Tbl = ({ cols, rows, onEdit, onDelete, compact = false, exportName }) => (
  <div>
    {exportName&&(
      <div style={{padding:"8px 12px",borderBottom:`1px solid ${C.gray100}`,display:"flex",justifyContent:"flex-end"}}>
        <Btn size="sm" variant="ghost" onClick={()=>exportCSV(exportName,cols,rows)}>⬇️ Export CSV</Btn>
      </div>
    )}
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:compact?11:12,fontFamily:font}}>
        <thead>
          <tr style={{background:C.navy}}>
            {cols.map(c=><th key={c.key} style={{padding:compact?"5px 8px":"7px 11px",color:C.goldL,
              fontWeight:700,textAlign:"left",whiteSpace:"nowrap",fontSize:10,letterSpacing:0.4,
              borderRight:`1px solid ${C.navyM}`}}>{c.label}</th>)}
            {onEdit&&<th style={{padding:"7px 10px",color:C.goldL,fontSize:10,width:50}}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={row.id||i} style={{background:i%2===0?C.white:C.gray50,borderBottom:`1px solid ${C.gray100}`}}>
              {cols.map(c=>(
                <td key={c.key} style={{padding:compact?"4px 8px":"6px 11px",color:C.gray800,
                  whiteSpace:c.wrap?"normal":"nowrap",maxWidth:c.maxW||200,
                  overflow:"hidden",textOverflow:"ellipsis",borderRight:`1px solid ${C.gray100}`}}>
                  {c.render?c.render(row[c.key],row):(row[c.key]||"—")}
                </td>
              ))}
              {(onEdit || onDelete) && (
  <td style={{ padding: "4px 8px", display: "flex", gap: 6 }}>
    {onEdit && (
      <Btn size="sm" variant="ghost" onClick={() => onEdit(row)}>
        ✏️
      </Btn>
    )}
    {onDelete && (
      <Btn size="sm" variant="danger" onClick={() => onDelete(row)}>
        🗑️
      </Btn>
    )}
  </td>
)}
            </tr>
          ))}
          {rows.length===0&&<tr><td colSpan={cols.length + ((onEdit || onDelete) ? 1 : 0)}
            style={{textAlign:"center",padding:36,color:C.gray400,fontSize:13}}>Aucune donnée</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── PISTE D'AUDIT ─────────────────────────────────────────────────────────────
const AuditLog = ({logs}) => (
  <Col gap={0}>
    {logs.slice(0,50).map((l,i)=>(
      <div key={i} style={{display:"flex",gap:12,padding:"8px 0",
        borderBottom:`1px solid ${C.gray100}`,alignItems:"flex-start"}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:C.navy+"22",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
          {l.user?.[0]||"?"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:C.gray800}}>
            <strong>{l.user}</strong> — {l.action}
          </div>
          <div style={{fontSize:10,color:C.gray400,marginTop:2}}>{l.module} · {l.time}</div>
        </div>
      </div>
    ))}
    {logs.length===0&&<div style={{textAlign:"center",padding:40,color:C.gray400,fontSize:13}}>Aucune activité enregistrée</div>}
  </Col>
);

// ─── ALERTES ─────────────────────────────────────────────────────────────────
const AlertBanner = ({arretes,hebdo}) => {
  const overdue = arretes.filter(a=>isOver(a.deadline));
  const soonArr = arretes.filter(a=>isSoon(a.deadline));
  const overdueH = hebdo.filter(h=>isOver(h.echeance)&&h.statut!=="Fait");
  if(!overdue.length&&!soonArr.length&&!overdueH.length) return null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {overdue.length>0&&(
        <div style={{background:C.redPale,border:`1px solid ${C.red}44`,borderRadius:10,
          padding:"10px 16px",fontSize:12,color:C.red,display:"flex",alignItems:"center",gap:8}}>
          🚨 <strong>{overdue.length} arrêté(s) avec deadline dépassée :</strong> {overdue.map(a=>a.dossier).join(", ")}
        </div>
      )}
      {soonArr.length>0&&(
        <div style={{background:C.orangePale,border:`1px solid ${C.orange}44`,borderRadius:10,
          padding:"10px 16px",fontSize:12,color:C.orange,display:"flex",alignItems:"center",gap:8}}>
          ⚠️ <strong>{soonArr.length} arrêté(s) deadline dans 7 jours :</strong> {soonArr.map(a=>a.dossier).join(", ")}
        </div>
      )}
      {overdueH.length>0&&(
        <div style={{background:C.orangePale,border:`1px solid ${C.orange}44`,borderRadius:10,
          padding:"10px 16px",fontSize:12,color:C.orange,display:"flex",alignItems:"center",gap:8}}>
          📅 <strong>{overdueH.length} action(s) hebdo en retard :</strong> {overdueH.map(h=>h.action).join(", ")}
        </div>
      )}
    </div>
  );
};

// ─── MODULE : RECHERCHE GLOBALE ───────────────────────────────────────────────
function RechercheGlobale({dossiers,categ,arretes,decl,hebdo}) {
  const [q,setQ] = useState("");
  const results = useMemo(()=>{
    if(!q||q.length<2) return [];
    const s = q.toLowerCase();
    const res = [];
    dossiers.forEach(d=>{
      if(d.nom.toLowerCase().includes(s)||d.cm.toLowerCase().includes(s))
        res.push({type:"Dossier",label:d.nom,sub:d.cm+" · "+d.domaine,icon:"📁"});
    });
    categ.forEach(c=>{
      if(c.client.toLowerCase().includes(s)||c.secteur.toLowerCase().includes(s))
        res.push({type:"Catégorisation",label:c.client,sub:c.secteur+" · "+c.solvabilite,icon:"🏷️"});
    });
    arretes.forEach(a=>{
      if(a.dossier.toLowerCase().includes(s)||a.cm.toLowerCase().includes(s))
        res.push({type:"Arrêté",label:a.dossier,sub:"CM: "+a.cm+" · Deadline: "+fmt(a.deadline),icon:"📆"});
    });
    decl.forEach(d=>{
      if(d.client.toLowerCase().includes(s))
        res.push({type:"Déclaration",label:d.client,sub:d.cm+" · "+d.centre,icon:"📋"});
    });
    hebdo.forEach(h=>{
      if(h.action.toLowerCase().includes(s)||h.responsable.toLowerCase().includes(s))
        res.push({type:"Action hebdo",label:h.action,sub:h.responsable+" · "+fmt(h.echeance),icon:"📅"});
    });
    return res;
  },[q,dossiers,categ,arretes,decl,hebdo]);

  return (
    <Col gap={14}>
      <H icon="🔍" title="Recherche globale" sub="Cherchez dans tous les modules simultanément"/>
      <div style={{position:"relative"}}>
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Tapez un nom de dossier, client, collaborateur..."
          style={{width:"100%",border:`2px solid ${C.navy}`,borderRadius:10,padding:"12px 16px",
            fontSize:15,outline:"none",fontFamily:font,boxSizing:"border-box"}}
          autoFocus/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:12,
          background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.gray400}}>×</button>}
      </div>
      {q.length>=2&&(
        <div style={{fontSize:12,color:C.gray400}}>{results.length} résultat(s) pour "{q}"</div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {results.map((r,i)=>(
          <Card key={i} style={{padding:"12px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>{r.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{r.label}</div>
                <div style={{fontSize:11,color:C.gray400,marginTop:2}}>{r.sub}</div>
              </div>
              <Pill label={r.type} color={C.navy} small/>
            </div>
          </Card>
        ))}
        {q.length>=2&&results.length===0&&(
          <div style={{textAlign:"center",padding:40,color:C.gray400,fontSize:13}}>
            Aucun résultat trouvé pour "{q}"
          </div>
        )}
      </div>
    </Col>
  );
}

// ─── MODULE : GESTION UTILISATEURS ───────────────────────────────────────────
function GestionUtilisateurs({users,setUsers,currentUser,addLog}) {
  const [modal,setModal] = useState(false);
  const [form,setForm] = useState(null);
  const canAdmin = ROLES[currentUser.role]?.canAdmin;

  const save = () => {
    if(!form.nom||!form.email) return;
    if(form.id) setUsers(p=>p.map(u=>u.id===form.id?form:u));
    else {
      const avatar=form.nom.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
      setUsers(p=>[...p,{...form,avatar,id:Date.now(),actif:true}]);
    }
    addLog(currentUser.nom,"Gestion utilisateurs",form.id?"Modification utilisateur: "+form.nom:"Ajout utilisateur: "+form.nom);
    setModal(false);
  };

  return (
    <Col gap={14}>
      <H icon="👤" title="Gestion des utilisateurs & rôles" sub="Accès et permissions par collaborateur"
        actions={canAdmin&&[<Btn key="add" onClick={()=>{setForm({nom:"",email:"",role:"collab"});setModal(true);}}>+ Ajouter</Btn>]}/>
      {!canAdmin&&(
        <div style={{background:C.orangePale,border:`1px solid ${C.orange}44`,borderRadius:10,
          padding:"10px 16px",fontSize:12,color:C.orange}}>
          🔒 Seul le Manager peut gérer les utilisateurs et les rôles.
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {users.map(u=>{
          const r=ROLES[u.role];
          return (
            <Card key={u.id} style={{position:"relative",opacity:u.actif?1:0.6}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:r.color,
                  color:C.white,display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:700,fontSize:16,flexShrink:0}}>{u.avatar}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:14,color:C.navy}}>{u.nom}</div>
                  <div style={{fontSize:11,color:C.gray400}}>{u.email}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <Pill label={r.label} color={r.color}/>
                <Pill label={u.actif?"Actif":"Inactif"} color={u.actif?C.green:C.gray400} small/>
              </div>
              <div style={{marginTop:10,fontSize:10,color:C.gray400,background:C.gray50,
                borderRadius:6,padding:"6px 8px"}}>
                {u.role==="manager"?"✅ Accès complet — tous les modules":
                 u.role==="cm"?"📋 Ses dossiers + plannings + tâches":
                 "📄 Dossiers affectés uniquement"}
              </div>
              {canAdmin&&(
                <button onClick={()=>{setForm({...u});setModal(true);}}
                  style={{position:"absolute",top:12,right:12,background:"none",
                    border:"none",cursor:"pointer",color:C.gray400,fontSize:14}}>✏️</button>
              )}
            </Card>
          );
        })}
      </div>
      {modal&&(
        <Modal title={form?.id?"Modifier l'utilisateur":"Nouvel utilisateur"} onClose={()=>setModal(false)}>
          <Col gap={11}>
            <G2>
              <Inp label="Nom complet *" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))}/>
              <Inp label="Email *" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </G2>
            <Sel label="Rôle" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </Sel>
            {form.id&&(
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" id="actif" checked={form.actif||false}
                  onChange={e=>setForm(f=>({...f,actif:e.target.checked}))}/>
                <label htmlFor="actif" style={{fontSize:13,color:C.gray800}}>Compte actif</label>
              </div>
            )}
            <SaveRow onCancel={()=>setModal(false)} onSave={save}/>
          </Col>
        </Modal>
      )}
    </Col>
  );
}

// ─── MODULE : GUIDE DÉPLOIEMENT ───────────────────────────────────────────────
function GuideDeploiement() {
  const [step,setStep] = useState(0);
  const steps = [
    {
      icon:"🏗️", title:"Étape 1 — Créer un compte Supabase (2 min)",
      color:C.teal,
      content:[
        "1. Aller sur supabase.com et cliquer sur 'Start your project'",
        "2. Se connecter avec GitHub (ou créer un compte email)",
        "3. Cliquer sur 'New project'",
        "4. Nommer le projet : nkac-cabinet",
        "5. Choisir la région : Europe West (ou West Africa si disponible)",
        "6. Générer un mot de passe fort et le noter",
        "7. Cliquer sur 'Create new project' — attendre 2 minutes",
        "✅ Supabase est prêt ! Notez l'URL du projet et la clé API (Settings → API)"
      ]
    },
    {
      icon:"🔑", title:"Étape 2 — Configurer l'authentification (3 min)",
      color:C.purple,
      content:[
        "Dans Supabase, aller dans Authentication → Settings",
        "1. Activer 'Email auth' (déjà activé par défaut)",
        "2. Désactiver 'Email confirmations' (plus simple au démarrage)",
        "3. Aller dans Authentication → Users",
        "4. Cliquer 'Invite user' pour chaque collaborateur",
        "5. Saisir l'email du collaborateur → il reçoit un lien d'invitation",
        "✅ Chaque collaborateur peut maintenant se connecter avec son email"
      ]
    },
    {
      icon:"📦", title:"Étape 3 — Créer un compte GitHub (2 min)",
      color:C.navy,
      content:[
        "1. Aller sur github.com et créer un compte gratuit",
        "2. Cliquer sur le '+' en haut à droite → 'New repository'",
        "3. Nommer le repository : nkac-app",
        "4. Choisir 'Public' (ou Private si vous avez un abonnement)",
        "5. Cliquer 'Create repository'",
        "6. Dans le repository, cliquer 'Add file' → 'Upload files'",
        "7. Glisser-déposer le fichier .jsx de l'application ici",
        "✅ Le code est maintenant sur GitHub"
      ]
    },
    {
      icon:"🚀", title:"Étape 4 — Déployer sur Vercel (5 min)",
      color:C.green,
      content:[
        "1. Aller sur vercel.com → 'Sign up' avec GitHub",
        "2. Cliquer 'Add New Project'",
        "3. Sélectionner votre repository 'nkac-app'",
        "4. Dans 'Environment Variables', ajouter :",
        "   VITE_SUPABASE_URL = [votre URL Supabase]",
        "   VITE_SUPABASE_ANON_KEY = [votre clé API Supabase]",
        "5. Cliquer 'Deploy' — attendre 2-3 minutes",
        "6. Vercel génère une URL : https://nkac-app.vercel.app",
        "✅ L'application est en ligne ! Partagez l'URL à tous les collaborateurs"
      ]
    },
    {
      icon:"🌍", title:"Étape 5 — Partager l'accès (1 min)",
      color:C.gold,
      content:[
        "1. Copier l'URL Vercel : https://nkac-app.vercel.app",
        "2. Envoyer l'URL par email ou WhatsApp à chaque collaborateur",
        "3. Chaque collaborateur clique sur le lien d'invitation Supabase reçu",
        "4. Il crée son mot de passe",
        "5. Il accède à l'application via l'URL Vercel",
        "💡 Astuce : L'application fonctionne sur PC, tablette et smartphone",
        "💡 Astuce : Ajouter un raccourci sur l'écran d'accueil du téléphone",
        "✅ Tout le cabinet accède à la même application en temps réel !"
      ]
    },
    {
      icon:"💾", title:"Étape 6 — Sauvegarde & maintenance (automatique)",
      color:C.orange,
      content:[
        "Supabase (gratuit) inclut :",
        "✅ Backups automatiques quotidiens",
        "✅ 500 MB de stockage (largement suffisant)",
        "✅ 50 000 requêtes/mois gratuites",
        "✅ Accès depuis n'importe quel pays",
        "",
        "Vercel (gratuit) inclut :",
        "✅ Déploiement automatique à chaque modification",
        "✅ HTTPS (connexion sécurisée)",
        "✅ CDN mondial (chargement rapide depuis Dakar)",
        "✅ 100 GB de bande passante/mois",
        "",
        "💡 Coût total : 0 FCFA — tout est gratuit pour un cabinet de cette taille"
      ]
    },
  ];

  const current = steps[step];
  return (
    <Col gap={16}>
      <H icon="🚀" title="Guide de déploiement" sub="Mettre l'application en ligne pour tous les collaborateurs — sans développeur, sans code"/>

      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyM})`,borderRadius:14,padding:"20px 24px",color:C.white}}>
        <div style={{fontSize:10,color:C.goldL,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>
          Aucune connaissance technique requise · Coût : 0 FCFA
        </div>
        <div style={{fontSize:16,fontWeight:700,fontFamily:fontD}}>
          En 6 étapes simples, votre application sera accessible à tous vos collaborateurs depuis n'importe quel appareil.
        </div>
      </div>

      {/* Stepper */}
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {steps.map((s,i)=>(
          <button key={i} onClick={()=>setStep(i)}
            style={{flex:1,minWidth:80,padding:"8px 4px",borderRadius:8,border:"none",cursor:"pointer",
              fontFamily:font,fontSize:11,fontWeight:700,textAlign:"center",
              background:step===i?s.color:C.gray100,
              color:step===i?C.white:C.gray600,transition:"all 0.15s"}}>
            {s.icon} {i+1}
          </button>
        ))}
      </div>

      {/* Étape courante */}
      <Card style={{border:`2px solid ${current.color}44`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:current.color,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
            {current.icon}
          </div>
          <h3 style={{margin:0,fontSize:16,fontWeight:800,color:current.color,fontFamily:fontD}}>
            {current.title}
          </h3>
        </div>
        <Col gap={6}>
          {current.content.map((line,i)=>(
            <div key={i} style={{
              padding:"8px 12px",borderRadius:8,
              background:line.startsWith("✅")?C.greenPale:
                         line.startsWith("💡")?C.goldPale:
                         line.startsWith("   ")?C.purplePale:C.gray50,
              fontSize:13,color:C.gray800,fontFamily:"monospace",
              borderLeft:line.startsWith("✅")?`3px solid ${C.green}`:
                         line.startsWith("💡")?`3px solid ${C.gold}`:"none"
            }}>{line}</div>
          ))}
        </Col>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:18}}>
          <Btn variant="ghost" onClick={()=>setStep(s=>Math.max(0,s-1))} style={{opacity:step===0?0.3:1}}>← Précédent</Btn>
          <span style={{fontSize:12,color:C.gray400,alignSelf:"center"}}>{step+1} / {steps.length}</span>
          <Btn variant="teal" onClick={()=>setStep(s=>Math.min(steps.length-1,s+1))} style={{opacity:step===steps.length-1?0.3:1}}>Suivant →</Btn>
        </div>
      </Card>

      {/* Liens utiles */}
      <Card>
        <div style={{fontWeight:800,fontSize:13,color:C.navy,marginBottom:12}}>🔗 Liens directs</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {[
            {label:"Supabase",url:"https://supabase.com",desc:"Base de données & Auth",color:C.teal},
            {label:"Vercel",url:"https://vercel.com",desc:"Hébergement gratuit",color:C.navy},
            {label:"GitHub",url:"https://github.com",desc:"Stockage du code",color:C.gray800},
            {label:"Support Supabase",url:"https://supabase.com/docs",desc:"Documentation",color:C.purple},
          ].map(l=>(
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
              style={{display:"block",padding:"12px 14px",borderRadius:10,
                border:`1px solid ${l.color}33`,background:l.color+"0a",textDecoration:"none"}}>
              <div style={{fontWeight:700,fontSize:13,color:l.color}}>{l.label} ↗</div>
              <div style={{fontSize:11,color:C.gray400,marginTop:2}}>{l.desc}</div>
            </a>
          ))}
        </div>
      </Card>
    </Col>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({dossiers,hebdo,arretes,budget,etat1024,currentUser,logs}) {
  const totalHono = budget.reduce((s,b)=>s+b.montantConvenu,0);
  const payeHono = budget.filter(b=>b.statut==="Payé").reduce((s,b)=>s+b.montantConvenu,0);
  const retards = hebdo.filter(p=>isOver(p.echeance)&&p.statut!=="Fait").length;
  const dLOver = arretes.filter(a=>isOver(a.deadline)).length;

  return (
    <Col gap={20}>
      <div style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyM} 100%)`,
        borderRadius:16,padding:"24px 28px",color:C.white}}>
        <div style={{fontSize:10,color:C.goldL,letterSpacing:2.5,textTransform:"uppercase",marginBottom:4}}>
          Cabinet NKAC · Système de Management de la Qualité
        </div>
        <h1 style={{margin:"0 0 4px",fontSize:22,fontWeight:900,fontFamily:fontD}}>
          Bonjour, {currentUser.nom.split(" ")[0]} 👋
        </h1>
        <div style={{display:"flex",gap:12,alignItems:"center",marginTop:8}}>
          <Pill label={ROLES[currentUser.role].label} color={ROLES[currentUser.role].color}/>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.55)"}}>
            {new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </span>
        </div>
      </div>

      <AlertBanner arretes={arretes} hebdo={hebdo}/>

      <Row gap={14}>
        <KPI icon="📁" label="Dossiers" value={dossiers.length} color={C.navy}/>
        <KPI icon="⚡" label="Actions hebdo" value={hebdo.length} sub={retards>0?`⚠ ${retards} en retard`:""} color={retards>0?C.red:C.teal}/>
        <KPI icon="📆" label="Arrêtés" value={arretes.length} sub={dLOver>0?`⚠ ${dLOver} dépassées`:""} color={dLOver>0?C.red:C.green}/>
        <KPI icon="💶" label="Budget" value={(totalHono/1000).toFixed(0)+"k FCFA"} sub={`${Math.round(payeHono/totalHono*100)}% encaissé`} color={C.gold}/>
      </Row>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.navy,marginBottom:12}}>⚡ Actions hebdo urgentes</div>
          {hebdo.filter(h=>isOver(h.echeance)||isSoon(h.echeance)).slice(0,5).map(h=>(
            <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"6px 0",borderBottom:`1px solid ${C.gray100}`}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.gray800}}>{h.action}</div>
                <div style={{fontSize:10,color:C.gray400}}>{h.responsable} · {fmt(h.echeance)}</div>
              </div>
              <Pill label={h.statut||"À faire"} color={sc(h.statut)} small/>
            </div>
          ))}
          {hebdo.filter(h=>isOver(h.echeance)||isSoon(h.echeance)).length===0&&(
            <div style={{fontSize:12,color:C.green,textAlign:"center",padding:12}}>✅ Aucune urgence</div>
          )}
        </Card>
        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.navy,marginBottom:12}}>📆 Arrêtés — prochaines deadlines</div>
          {[...arretes].filter(a=>a.deadline).sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5).map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"6px 0",borderBottom:`1px solid ${C.gray100}`}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.gray800}}>{a.dossier}</div>
                <div style={{fontSize:10,color:C.gray400}}>{a.cm}</div>
              </div>
              <span style={{fontSize:11,fontWeight:700,
                color:isOver(a.deadline)?C.red:isSoon(a.deadline)?C.orange:C.green}}>
                {fmt(a.deadline)}
              </span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.navy,marginBottom:12}}>📊 État 1024 — avancement</div>
          {["Fait","En-cours","Non fait"].map(s=>{
            const count = etat1024.filter(e=>e.statutCreation===s).length;
            const pct = etat1024.length ? Math.round(count/etat1024.length*100) : 0;
            return (
              <div key={s} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:C.gray600}}>{s}</span>
                  <span style={{fontWeight:700,color:sc(s)}}>{count} ({pct}%)</span>
                </div>
                <div style={{height:6,background:C.gray100,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:sc(s),borderRadius:3,transition:"width 0.4s"}}/>
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.navy,marginBottom:12}}>📝 Activité récente</div>
          {logs.slice(0,5).map((l,i)=>(
            <div key={i} style={{padding:"6px 0",borderBottom:`1px solid ${C.gray100}`}}>
              <div style={{fontSize:12,color:C.gray800}}><strong>{l.user}</strong> — {l.action}</div>
              <div style={{fontSize:10,color:C.gray400,marginTop:1}}>{l.module} · {l.time}</div>
            </div>
          ))}
          {logs.length===0&&<div style={{fontSize:12,color:C.gray400,textAlign:"center",padding:12}}>Aucune activité</div>}
        </Card>
      </div>
    </Col>
  );
}

// ─── MODULE GÉNÉRIQUE SIMPLE (pour les modules tables) ────────────────────────
function ModuleTable({icon,title,code,sub,cols,rows,setRows,formInit,renderForm,exportName,currentUser,addLog}) {
  const [modal,setModal] = useState(false);
  const [form,setForm] = useState(null);
  const [search,setSearch] = useState("");
  const canEdit = ROLES[currentUser.role]?.canEdit;

  const filtered = search ? rows.filter(r=>
    Object.values(r).some(v=>v&&v.toString().toLowerCase().includes(search.toLowerCase()))
  ) : rows;

 const save = async () => {
  if (title === "Affectation & Répartition des Dossiers") {
    try {
      if (form.id) {
        const { error } = await supabase
          .from("dossiers")
          .update({
            nom: form.nom,
            domaine: form.domaine,
            type_mission: form.typeMission,
            senior: form.senior,
            cm: form.cm,
            collaborateur: form.collaborateur,
            support: form.support,
            jour_intervention: form.jourIntervention,
            observations: form.observations,
          })
          .eq("id", form.id);

        if (error) {
          console.error("Erreur update Supabase dossiers :", error.message);
          return;
        }

        setRows((p) =>
          p.map((x) =>
            x.id === form.id
              ? {
                  ...form,
                  typeMission: form.typeMission,
                  jourIntervention: form.jourIntervention,
                }
              : x
          )
        );
      } else {
        const { data, error } = await supabase
          .from("dossiers")
          .insert([
            {
              nom: form.nom,
              domaine: form.domaine,
              type_mission: form.typeMission,
              senior: form.senior,
              cm: form.cm,
              collaborateur: form.collaborateur,
              support: form.support,
              jour_intervention: form.jourIntervention,
              observations: form.observations,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Erreur insert Supabase dossiers :", error.message);
          return;
        }

        setRows((p) => [
          ...p,
          {
            ...data,
            typeMission: data.type_mission,
            jourIntervention: data.jour_intervention,
          },
        ]);
      }

      addLog(currentUser.nom, title, form.id ? "Modification" : "Ajout");
      setModal(false);
      return;
    } catch (e) {
      console.error("Erreur générale dossiers :", e);
      return;
    }
  }

  if (exportName === "plan_hebdo") {
    try {
      if (form.id) {
        const { error } = await supabase
          .from("plan_hebdo")
          .update({
            action: form.action,
            responsable: form.responsable,
            backup: form.backup,
            echeance: form.echeance,
            statut: form.statut,
            observations: form.observations,
          })
          .eq("id", form.id);

        if (error) {
          console.error("Erreur update plan_hebdo :", error.message);
          return;
        }

        setRows((p) => p.map((x) => (x.id === form.id ? form : x)));
      } else {
        const { data, error } = await supabase
          .from("plan_hebdo")
          .insert([
            {
              action: form.action,
              responsable: form.responsable,
              backup: form.backup,
              echeance: form.echeance,
              statut: form.statut,
              observations: form.observations,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Erreur insert plan_hebdo :", error.message);
          return;
        }

        setRows((p) => [...p, data]);
      }

      addLog(currentUser.nom, title, form.id ? "Modification" : "Ajout");
      setModal(false);
      return;
    } catch (e) {
      console.error("Erreur générale plan_hebdo :", e);
      return;
    }
  }

  if (form.id) setRows((p) => p.map((x) => (x.id === form.id ? form : x)));
  else setRows((p) => [...p, { ...form, id: Date.now() }]);
  addLog(currentUser.nom, title, form.id ? "Modification" : "Ajout");
  setModal(false);
};
const remove = async (row) => {
  if (!confirm("Voulez-vous vraiment supprimer ce dossier ?")) return;

  if (title === "Affectation & Répartition des Dossiers") {
    try {
      const { error } = await supabase
        .from("dossiers")
        .delete()
        .eq("id", row.id);

      if (error) {
        console.error("Erreur delete Supabase :", error.message);
        return;
      }

      setRows((p) => p.filter((x) => x.id !== row.id));
      addLog(currentUser.nom, title, "Suppression");
      return;
    } catch (e) {
      console.error("Erreur générale suppression dossiers :", e);
      return;
    }
  }

  if (exportName === "plan_hebdo") {
    try {
      const { error } = await supabase
        .from("plan_hebdo")
        .delete()
        .eq("id", row.id);

      if (error) {
        console.error("Erreur delete plan_hebdo :", error.message);
        return;
      }

      setRows((p) => p.filter((x) => x.id !== row.id));
      addLog(currentUser.nom, title, "Suppression");
      return;
    } catch (e) {
      console.error("Erreur générale suppression plan_hebdo :", e);
      return;
    }
  }

  setRows((p) => p.filter((x) => x.id !== row.id));
  addLog(currentUser.nom, title, "Suppression");
};
  return (
    <Col gap={14}>
      <H icon={icon} title={title} code={code} sub={sub}
        actions={[
          <Inp key="s" placeholder="🔍 Filtrer..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:180}}/>,
          canEdit&&<Btn key="add" onClick={()=>{setForm({...formInit});setModal(true);}}>+ Ajouter</Btn>
        ].filter(Boolean)}/>
      <Card style={{padding:0,overflow:"hidden"}}>
        <Tbl
  cols={cols}
  rows={filtered}
  onEdit={canEdit ? (r) => { setForm({ ...r }); setModal(true); } : null}
  onDelete={canEdit ? remove : null}
  compact
  exportName={exportName}
/>
      </Card>
      {modal&&(
        <Modal title={form?.id?"Modifier":"Nouveau"} onClose={()=>setModal(false)} wide>
          {renderForm(form,setForm)}
          <SaveRow onCancel={()=>setModal(false)} onSave={save}/>
        </Modal>
      )}
    </Col>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  {id:"dashboard",   icon:"📊", label:"Tableau de bord",     roles:["manager","cm","collab"]},
  {id:"search",      icon:"🔍", label:"Recherche globale",    roles:["manager","cm","collab"]},
  {id:"affectation", icon:"📁", label:"Affectation dossiers", roles:["manager","cm"]},
  {id:"hebdo",       icon:"📅", label:"Plan d'action hebdo",  roles:["manager","cm","collab"]},
  {id:"taches",      icon:"✅", label:"Suivi tâches",         roles:["manager","cm","collab"]},
  {id:"categorisation",icon:"🏷️",label:"Catégorisation",     roles:["manager","cm"]},
  {id:"arretes",     icon:"📆", label:"Arrêtés des comptes",  roles:["manager","cm"]},
  {id:"declarations",icon:"📋", label:"Suivi déclarations",   roles:["manager","cm","collab"]},
  {id:"etat1024",    icon:"📄", label:"État 1024",            roles:["manager","cm"]},
  {id:"inventaire",  icon:"📦", label:"Planning inventaire",  roles:["manager","cm"]},
  {id:"reunions",    icon:"🤝", label:"Réunion mensuelle",    roles:["manager","cm"]},
  {id:"plateformes", icon:"🔐", label:"Accès plateformes",    roles:["manager"]},
  {id:"budget",      icon:"💶", label:"Budget honoraires",    roles:["manager","cm"]},
  {id:"users",       icon:"👤", label:"Utilisateurs & rôles", roles:["manager"]},
  {id:"audit",       icon:"📝", label:"Piste d'audit",        roles:["manager"]},
  {id:"deploiement", icon:"🚀", label:"Guide déploiement",    roles:["manager"]},
];

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function CabinetApp() {
  // Session utilisateur
  const [currentUser,setCurrentUser] = useState(USERS_INIT[0]);
  const [loginModal,setLoginModal] = useState(false);

  // États des modules
  const [page,setPage] = useState("dashboard");
  const [dossiers, setDossiers] = useState([]);
  useEffect(() => {
  async function loadDossiers() {
    const { data, error } = await supabase
      .from("dossiers")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur Supabase dossiers :", error.message);
    } else {
      setDossiers(data || []);
    }
  }

  async function loadHebdo() {
    const { data, error } = await supabase
      .from("plan_hebdo")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur Supabase plan_hebdo :", error.message);
    } else {
      setHebdo(data || []);
    }
  }

  loadDossiers();
  loadHebdo();
}, []);
  const [taches,setTaches] = useState(TACHES_INIT);
  const [hebdo,setHebdo] = useState([]);
  const [categ,setCateg] = useState(CATEG_INIT);
  const [arretes,setArretes] = useState(ARRETES_INIT);
  const [declarations,setDeclarations] = useState(DECL_INIT);
  const [etat1024,setEtat1024] = useState(ETAT1024_INIT);
  const [inventaire,setInventaire] = useState(INVENTAIRE_INIT);
  const [reunions,setReunions] = useState(REUNIONS_INIT);
  const [plateformes,setPlateformes] = useState(PLATEFORMES_INIT);
  const [budget,setBudget] = useState(BUDGET_INIT);
  const [users,setUsers] = useState(USERS_INIT);
  const [logs,setLogs] = useState([]);
  const [sideOpen,setSideOpen] = useState(true);

  const addLog = useCallback((user,module,action) => {
    setLogs(p=>[{user,module,action,time:new Date().toLocaleTimeString("fr-FR")+" "+new Date().toLocaleDateString("fr-FR")},...p].slice(0,200));
  },[]);

  // Alertes totales
  const alerts = arretes.filter(a=>isOver(a.deadline)).length +
                 hebdo.filter(h=>isOver(h.echeance)&&h.statut!=="Fait").length;

  // Nav filtrée par rôle
  const navVisible = NAV.filter(n=>n.roles.includes(currentUser.role));

  const vals = ["","Fait","FAIT","En cours","En-cours","Non fait","N/A","Oui","Effectué"];

  return (
    <div style={{display:"flex",height:"100vh",background:C.gray50,fontFamily:font,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.gray200};border-radius:3px;}
        button:hover{opacity:0.85;transition:opacity 0.15s;}
        input:focus,select:focus,textarea:focus{border-color:${C.navy}!important;box-shadow:0 0 0 2px ${C.navy}22;}
      `}</style>

      {/* Sidebar */}
      <aside style={{width:sideOpen?230:54,flexShrink:0,background:C.navy,
        display:"flex",flexDirection:"column",transition:"width 0.2s",overflow:"hidden"}}>

        {/* Logo + user */}
        <div style={{padding:"16px 12px",borderBottom:`1px solid ${C.navyM}`,flexShrink:0}}>
          {sideOpen?(
            <div>
              <div style={{fontFamily:fontD,fontSize:17,color:C.white,fontWeight:700}}>NKAC</div>
              <div style={{fontSize:9,color:C.goldL,letterSpacing:2.5,textTransform:"uppercase",marginTop:1}}>Cabinet EC · SMQ</div>
              <button onClick={()=>setLoginModal(true)}
                style={{marginTop:8,display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.08)",
                  border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",width:"100%"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:ROLES[currentUser.role].color,
                  color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>
                  {currentUser.avatar}
                </div>
                <div style={{textAlign:"left",overflow:"hidden"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.nom.split(" ")[0]}</div>
                  <div style={{fontSize:9,color:C.goldL}}>{ROLES[currentUser.role].label}</div>
                </div>
              </button>
            </div>
          ):(
            <button onClick={()=>setLoginModal(true)} style={{background:"none",border:"none",cursor:"pointer",width:"100%"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:ROLES[currentUser.role].color,
                color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,margin:"0 auto"}}>
                {currentUser.avatar}
              </div>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{flex:1,overflowY:"auto",padding:"8px 5px"}}>
          {navVisible.map(item=>{
            const active=page===item.id;
            const isAlert=(item.id==="hebdo"||item.id==="arretes")&&alerts>0;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)}
                title={!sideOpen?item.label:""}
                style={{width:"100%",display:"flex",alignItems:"center",gap:9,
                  padding:"8px 9px",borderRadius:7,border:"none",cursor:"pointer",
                  fontFamily:font,fontSize:12,fontWeight:active?700:500,
                  background:active?"rgba(255,255,255,0.14)":"transparent",
                  color:active?C.white:C.gray400,marginBottom:2,textAlign:"left",
                  whiteSpace:"nowrap",transition:"all 0.12s",position:"relative"}}>
                <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
                {sideOpen&&<span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{item.label}</span>}
                {isAlert&&sideOpen&&<span style={{background:C.red,color:C.white,fontSize:9,
                  fontWeight:700,borderRadius:10,padding:"1px 5px",marginLeft:"auto"}}>{alerts}</span>}
              </button>
            );
          })}
        </nav>

        <button onClick={()=>setSideOpen(p=>!p)}
          style={{padding:"10px",background:"transparent",border:"none",
            borderTop:`1px solid ${C.navyM}`,cursor:"pointer",
            color:C.gray400,fontSize:12,textAlign:"center",fontFamily:font,flexShrink:0}}>
          {sideOpen?"◀":"▶"}
        </button>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflowY:"auto",padding:22}}>
        {page==="dashboard"&&<Dashboard dossiers={dossiers} hebdo={hebdo} arretes={arretes} budget={budget} etat1024={etat1024} currentUser={currentUser} logs={logs}/>}
        {page==="search"&&<RechercheGlobale dossiers={dossiers} categ={categ} arretes={arretes} decl={declarations} hebdo={hebdo}/>}

        {page==="affectation"&&<ModuleTable icon="📁" title="Affectation & Répartition des Dossiers" code="R2_ENR_01_00"
          cols={[{key:"id",label:"N°"},{key:"nom",label:"DOSSIER"},{key:"domaine",label:"DOMAINE"},{key:"typeMission",label:"TYPE MISSION"},{key:"senior",label:"SENIOR"},{key:"cm",label:"CM/CONFIRMÉ"},{key:"collaborateur",label:"COLLABORATEUR"},{key:"support",label:"SUPPORT"},{key:"observations",label:"OBS",wrap:true}]}
          rows={dossiers} setRows={setDossiers}
          formInit={{nom:"",domaine:"",typeMission:"Présentation - ACJF",senior:"",cm:"",collaborateur:"",support:"",jourIntervention:"",observations:""}}
          exportName="affectation_dossiers"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G2><Inp label="Dossier *" value={form.nom||""} onChange={e=>setForm(f=>({...f,nom:e.target.value}))}/><Inp label="Domaine" value={form.domaine||""} onChange={e=>setForm(f=>({...f,domaine:e.target.value}))}/></G2>
              <Sel label="Type de mission" value={form.typeMission||""} onChange={e=>setForm(f=>({...f,typeMission:e.target.value}))}>
                {["Présentation - ACJF","Présentation des comptes - Révision","Assistance fiscale et sociale","Audit légal","Conseil"].map(v=><option key={v}>{v}</option>)}
              </Sel>
              <G3><Inp label="Senior/AC" value={form.senior||""} onChange={e=>setForm(f=>({...f,senior:e.target.value}))}/><Inp label="CM/Confirmé" value={form.cm||""} onChange={e=>setForm(f=>({...f,cm:e.target.value}))}/><Inp label="Collaborateur" value={form.collaborateur||""} onChange={e=>setForm(f=>({...f,collaborateur:e.target.value}))}/></G3>
              <G2><Inp label="Support" value={form.support||""} onChange={e=>setForm(f=>({...f,support:e.target.value}))}/><Inp label="Jour intervention" value={form.jourIntervention||""} onChange={e=>setForm(f=>({...f,jourIntervention:e.target.value}))}/></G2>
              <TA label="Observations" value={form.observations||""} onChange={e=>setForm(f=>({...f,observations:e.target.value}))} rows={2}/>
            </Col>
          )}/>}

        {page==="hebdo"&&<ModuleTable icon="📅" title="Plan d'Action Hebdomadaire" code="R2_ENR_03_00"
          cols={[{key:"action",label:"ACTIONS",wrap:true},{key:"responsable",label:"RESPONSABLE"},{key:"backup",label:"BACK UP"},{key:"echeance",label:"ÉCHÉANCE",render:v=><span style={{color:isOver(v)?C.red:isSoon(v)?C.orange:C.gray800,fontWeight:isOver(v)?700:400}}>{fmt(v)}</span>},{key:"statut",label:"STATUT",render:v=><Pill label={v||"À faire"} color={sc(v)} small/>},{key:"observations",label:"OBSERVATIONS",wrap:true}]}
          rows={hebdo} setRows={setHebdo}
          formInit={{action:"",responsable:"",backup:"",echeance:today,statut:"",revision:"",observations:""}}
          exportName="plan_hebdo"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <TA label="Action *" value={form.action||""} onChange={e=>setForm(f=>({...f,action:e.target.value}))} rows={2}/>
              <G3><Inp label="Responsable" value={form.responsable||""} onChange={e=>setForm(f=>({...f,responsable:e.target.value}))}/><Inp label="Back up" value={form.backup||""} onChange={e=>setForm(f=>({...f,backup:e.target.value}))}/><Inp label="Échéance" type="date" value={form.echeance||""} onChange={e=>setForm(f=>({...f,echeance:e.target.value}))}/></G3>
              <G2><Sel label="Statut" value={form.statut||""} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>{["","En-cours","Fait","Non fait","En attente"].map(v=><option key={v}>{v}</option>)}</Sel><Inp label="Révision" value={form.revision||""} onChange={e=>setForm(f=>({...f,revision:e.target.value}))}/></G2>
              <TA label="Observations" value={form.observations||""} onChange={e=>setForm(f=>({...f,observations:e.target.value}))} rows={2}/>
            </Col>
          )}/>}

        {page==="taches"&&<ModuleTable icon="✅" title="Suivi Tâches par Dossier" code="R2_ENR_02_00"
          cols={[{key:"dossierId",label:"DOSSIER",render:v=>dossiers.find(d=>d.id===v)?.nom||"—"},{key:"cm",label:"CM"},{key:"collaborateur",label:"COLLABORATEUR"},{key:"receptionPieces",label:"PIÈCES",render:v=><Pill label={v||"—"} color={sc(v)} small/>},{key:"saisieJournaux",label:"SAISIE",render:v=><Pill label={v||"—"} color={sc(v)} small/>},{key:"lettrageComptes",label:"LETTRAGE",render:v=><Pill label={v||"—"} color={sc(v)} small/>},{key:"erb",label:"ERB",render:v=><Pill label={v||"—"} color={sc(v)} small/>},{key:"validationSaisie",label:"VALIDATION",render:v=><Pill label={v||"—"} color={sc(v)} small/>},{key:"commentaire",label:"COMMENTAIRE",wrap:true}]}
          rows={taches} setRows={setTaches}
          formInit={{dossierId:dossiers[0]?.id,typeMission:"",superviseur:"",cm:"",collaborateur:"",receptionPieces:"",receptionReleves:"",saisieJournaux:"",lettrageComptes:"",erb:"",traitementSuspens:"",commentaire:"",validationSaisie:"",revueDossier:"",reporting:"",observations:""}}
          exportName="suivi_taches"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G2><Sel label="Dossier" value={form.dossierId||""} onChange={e=>setForm(f=>({...f,dossierId:Number(e.target.value)}))}>
                {dossiers.map(d=><option key={d.id} value={d.id}>{d.nom}</option>)}
              </Sel><Inp label="CM/Confirmé" value={form.cm||""} onChange={e=>setForm(f=>({...f,cm:e.target.value}))}/></G2>
              <Inp label="Collaborateur" value={form.collaborateur||""} onChange={e=>setForm(f=>({...f,collaborateur:e.target.value}))}/>
              <div style={{background:C.gray50,borderRadius:10,padding:12}}>
                <div style={{fontSize:10,fontWeight:700,color:C.navy,marginBottom:8,textTransform:"uppercase"}}>Statuts des tâches</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {["receptionPieces","receptionReleves","saisieJournaux","lettrageComptes","erb","traitementSuspens","validationSaisie","revueDossier","reporting"].map(k=>(
                    <Sel key={k} label={k} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel>
                  ))}
                </div>
              </div>
              <TA label="Commentaire" value={form.commentaire||""} onChange={e=>setForm(f=>({...f,commentaire:e.target.value}))} rows={2}/>
            </Col>
          )}/>}

        {page==="categorisation"&&<ModuleTable icon="🏷️" title="Catégorisation Clients"
          cols={[{key:"client",label:"CLIENT"},{key:"secteur",label:"SECTEUR"},{key:"nature",label:"NATURE"},{key:"solvabilite",label:"SOLVABILITÉ",render:v=><Pill label={v} color={v==="Bon payeur"?C.green:C.red} small/>},{key:"modeFacturation",label:"MODE FACT."},{key:"modeReglement",label:"RÈGLEMENT"},{key:"montantTTC",label:"MONTANT TTC",render:v=><strong>{v?.toLocaleString("fr-FR")||"—"}</strong>},{key:"pointsAttention",label:"POINTS D'ATTENTION",render:v=><span style={{color:v&&v!=="N/A"?C.orange:C.gray400}}>{v||"—"}</span>}]}
          rows={categ} setRows={setCateg}
          formInit={{client:"",secteur:"",nature:"Normal",typologie:"Simple",documents:"",particularites:"N/A",pointsAttention:"N/A",solvabilite:"Bon payeur",modeFacturation:"Mensuel",modeReglement:"Virement",montantTTC:0,besoinConseil:""}}
          exportName="categorisation_clients"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G2><Inp label="Client *" value={form.client||""} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/><Inp label="Secteur d'activité" value={form.secteur||""} onChange={e=>setForm(f=>({...f,secteur:e.target.value}))}/></G2>
              <G3><Sel label="Nature" value={form.nature||""} onChange={e=>setForm(f=>({...f,nature:e.target.value}))}>{["Normal","Compliqué","VIP"].map(v=><option key={v}>{v}</option>)}</Sel><Sel label="Solvabilité" value={form.solvabilite||""} onChange={e=>setForm(f=>({...f,solvabilite:e.target.value}))}>{["Bon payeur","Mauvais payeur","À surveiller"].map(v=><option key={v}>{v}</option>)}</Sel><Sel label="Mode facturation" value={form.modeFacturation||""} onChange={e=>setForm(f=>({...f,modeFacturation:e.target.value}))}>{["Mensuel","Trimestriel","Annuel"].map(v=><option key={v}>{v}</option>)}</Sel></G3>
              <G2><Inp label="Mode règlement" value={form.modeReglement||""} onChange={e=>setForm(f=>({...f,modeReglement:e.target.value}))}/><Inp label="Montant TTC (FCFA)" type="number" value={form.montantTTC||0} onChange={e=>setForm(f=>({...f,montantTTC:Number(e.target.value)}))}/></G2>
              <Inp label="Points d'attention" value={form.pointsAttention||""} onChange={e=>setForm(f=>({...f,pointsAttention:e.target.value}))}/>
            </Col>
          )}/>}

        {page==="arretes"&&<ModuleTable icon="📆" title="Planning Arrêtés des Comptes Annuels" code="R2_ENR_04_00"
          cols={[{key:"dossier",label:"DOSSIER"},{key:"cm",label:"CM"},{key:"deadline",label:"DEADLINE",render:v=><span style={{color:isOver(v)?C.red:isSoon(v)?C.orange:C.green,fontWeight:700}}>{fmt(v)}</span>},{key:"dcaFaire",label:"DCA",render:v=><Pill label={v||"À faire"} color={sc(v)} small/>},{key:"correctionDca",label:"CORRECTION"},{key:"revueDca",label:"REVUE",render:v=><Pill label={v||"À faire"} color={sc(v)} small/>},{key:"dateRevue",label:"DATE REVUE",render:v=>fmt(v)},{key:"depotSenEtafi",label:"SEN ETAFI",render:v=><Pill label={v||"À faire"} color={sc(v)} small/>},{key:"bouclage",label:"BOUCLAGE",render:v=><Pill label={v||"À faire"} color={sc(v)} small/>},{key:"observations",label:"OBS",wrap:true}]}
          rows={arretes} setRows={setArretes}
          formInit={{dossier:"",cm:"",collaborateur:"",deadline:"",dcaFaire:"",correctionDca:"",revueDca:"",dateRevue:"",celVa:"",declarIS:"",irvm:"",etatsFinanciers:"",validationClient:"",benefEffectifs:"",declarRect:"",noteSynthese:"",pvAgo:"",visaEF:"",depotSenEtafi:"",validationSenEtafi:"",dateDepot:"",bouclage:"",envoisDecharges:"",observations:""}}
          exportName="arretes_comptes"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G3><Inp label="Dossier *" value={form.dossier||""} onChange={e=>setForm(f=>({...f,dossier:e.target.value}))}/><Inp label="CM/Confirmé" value={form.cm||""} onChange={e=>setForm(f=>({...f,cm:e.target.value}))}/><Inp label="Deadline" type="date" value={form.deadline||""} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/></G3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                {["dcaFaire","revueDca","celVa","declarIS","irvm","etatsFinanciers","validationClient","pvAgo","visaEF","depotSenEtafi","bouclage","envoisDecharges"].map(k=>(
                  <Sel key={k} label={k} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel>
                ))}
              </div>
              <G2><Inp label="Correction DCA" value={form.correctionDca||""} onChange={e=>setForm(f=>({...f,correctionDca:e.target.value}))}/><Inp label="Date de revue" type="date" value={form.dateRevue||""} onChange={e=>setForm(f=>({...f,dateRevue:e.target.value}))}/></G2>
              <TA label="Observations" value={form.observations||""} onChange={e=>setForm(f=>({...f,observations:e.target.value}))} rows={2}/>
            </Col>
          )}/>}

        {page==="declarations"&&<ModuleTable icon="📋" title="Suivi Déclarations Fiscales" code="R2_ENR_08_00"
          sub="TVA · VRS · BRS · CSS/IPRES · IS · CEL VA/VL · TSVPM"
          cols={[{key:"client",label:"CONTRIBUABLE"},{key:"cm",label:"COLLABORATEUR"},{key:"centre",label:"CENTRE FISCAL"},...["tva","vrs","brs","timbre","cssIpres","bnc","ras","tsvpm","is1erAcompte","celVa","celVl","irvm"].map(k=>({key:k,label:k.toUpperCase(),render:v=>v?<span style={{color:C.green,fontWeight:700,fontSize:10}}>✓</span>:<span style={{color:C.gray300,fontSize:10}}>—</span>})),{key:"dateRetrait",label:"RETRAIT",render:v=>fmt(v)}]}
          rows={declarations} setRows={setDeclarations}
          formInit={{client:"",cm:"",centre:"",tva:"",vrs:"",brs:"",timbre:"",cssIpres:"",bnc:"",ras:"",tsvpm:"",is1erAcompte:"",celVa:"",celVl:"",irvm:"",dateRetrait:""}}
          exportName="suivi_declarations"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G3><Inp label="Contribuable *" value={form.client||""} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/><Inp label="Collaborateur" value={form.cm||""} onChange={e=>setForm(f=>({...f,cm:e.target.value}))}/><Inp label="Centre fiscal" value={form.centre||""} onChange={e=>setForm(f=>({...f,centre:e.target.value}))}/></G3>
              <div style={{background:C.gray50,borderRadius:10,padding:12}}>
                <div style={{fontSize:10,fontWeight:700,color:C.navy,marginBottom:8,textTransform:"uppercase"}}>Dates de déclarations</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                  {["tva","vrs","brs","timbre","cssIpres","bnc","ras","tsvpm","is1erAcompte","celVa","celVl","irvm"].map(k=>(
                    <Inp key={k} label={k.toUpperCase()} type="date" value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                  ))}
                </div>
              </div>
              <Inp label="Date de retrait" type="date" value={form.dateRetrait||""} onChange={e=>setForm(f=>({...f,dateRetrait:e.target.value}))}/>
            </Col>
          )}/>}

        {page==="etat1024"&&<ModuleTable icon="📄" title="Suivi État 1024" code="R2_ENR_07_00"
          sub="Sommes versées à titre de loyer & Sommes versées aux tiers"
          cols={[{key:"dossier",label:"DOSSIER"},{key:"senior",label:"SENIOR"},{key:"collaborateur",label:"COLLABORATEUR"},{key:"deadline",label:"DEADLINE",render:v=><span style={{color:isOver(v)?C.red:C.gray800,fontWeight:isOver(v)?700:400}}>{fmt(v)}</span>},{key:"statutCreation",label:"STATUT",render:v=><Pill label={v||"À faire"} color={sc(v)} small/>},...["loyerT1","loyerT2","loyerT3","loyerAnnuel","tiersT1","tiersT2","tiersT3","tiersAnnuel","celVl"].map(k=>({key:k,label:k.replace("loyer","L-").replace("tiers","T-").replace("cel","CEL"),render:v=><Pill label={v||"—"} color={sc(v)} small/>})),{key:"observations",label:"OBS",wrap:true}]}
          rows={etat1024} setRows={setEtat1024}
          formInit={{dossier:"",typeMission:"",senior:"",collaborateur:"",deadline:"",statutCreation:"",benefEffectif:"",dads:"",loyerT1:"",loyerT2:"",loyerT3:"",loyerT4:"",loyerAnnuel:"",tiersT1:"",tiersT2:"",tiersT3:"",tiersT4:"",tiersAnnuel:"",celVl:"",tsvp:"",statutDepot:"",observations:""}}
          exportName="etat_1024"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G3><Inp label="Dossier *" value={form.dossier||""} onChange={e=>setForm(f=>({...f,dossier:e.target.value}))}/><Inp label="Senior/AC" value={form.senior||""} onChange={e=>setForm(f=>({...f,senior:e.target.value}))}/><Inp label="Collaborateur" value={form.collaborateur||""} onChange={e=>setForm(f=>({...f,collaborateur:e.target.value}))}/></G3>
              <G2><Inp label="Deadline" type="date" value={form.deadline||""} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/><Sel label="Statut création" value={form.statutCreation||""} onChange={e=>setForm(f=>({...f,statutCreation:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel></G2>
              <div style={{background:C.gray50,borderRadius:10,padding:12}}>
                <div style={{fontSize:10,fontWeight:700,color:C.navy,marginBottom:8}}>Loyers & Tiers par trimestre</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:8}}>
                  {["loyerT1","loyerT2","loyerT3","loyerT4","loyerAnnuel","tiersT1","tiersT2","tiersT3","tiersT4","tiersAnnuel"].map(k=>(
                    <Sel key={k} label={k} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel>
                  ))}
                </div>
              </div>
              <G3><Sel label="CEL VL" value={form.celVl||""} onChange={e=>setForm(f=>({...f,celVl:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel><Sel label="TSVP" value={form.tsvp||""} onChange={e=>setForm(f=>({...f,tsvp:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel><Sel label="Statut dépôt" value={form.statutDepot||""} onChange={e=>setForm(f=>({...f,statutDepot:e.target.value}))}>{vals.map(v=><option key={v}>{v}</option>)}</Sel></G3>
            </Col>
          )}/>}

        {page==="inventaire"&&<ModuleTable icon="📦" title="Planning Inventaire" code="R2_ENR_09_00"
          cols={[{key:"dossier",label:"DOSSIER"},{key:"cm",label:"CM"},{key:"collaborateur",label:"COLLABORATEUR"},{key:"typeInventaire",label:"TYPE",render:v=><Pill label={v||"—"} color={v==="N/A"?C.gray400:C.teal} small/>},{key:"dates",label:"DATES"},{key:"zone",label:"ZONE"},{key:"heure",label:"HEURE"},{key:"collaborateurNkac",label:"COLLAB NKAC",wrap:true},{key:"observations",label:"OBS",wrap:true}]}
          rows={inventaire} setRows={setInventaire}
          formInit={{dossier:"",cm:"",collaborateur:"",typeInventaire:"",dates:"",zone:"",heure:"",coordinateur:"",collaborateurNkac:"",observations:""}}
          exportName="planning_inventaire"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G2><Inp label="Dossier *" value={form.dossier||""} onChange={e=>setForm(f=>({...f,dossier:e.target.value}))}/><Sel label="Type d'inventaire" value={form.typeInventaire||""} onChange={e=>setForm(f=>({...f,typeInventaire:e.target.value}))}>{["","CAISSE / IMMOS","STOCK","CAISSE / STOCK","CAISSE / IMMOS / STOCK","N/A"].map(v=><option key={v}>{v}</option>)}</Sel></G2>
              <G2><Inp label="CM-Confirmé" value={form.cm||""} onChange={e=>setForm(f=>({...f,cm:e.target.value}))}/><Inp label="Collaborateur" value={form.collaborateur||""} onChange={e=>setForm(f=>({...f,collaborateur:e.target.value}))}/></G2>
              <G3><Inp label="Dates" value={form.dates||""} onChange={e=>setForm(f=>({...f,dates:e.target.value}))}/><Inp label="Zone / Lieu" value={form.zone||""} onChange={e=>setForm(f=>({...f,zone:e.target.value}))}/><Inp label="Heure" value={form.heure||""} onChange={e=>setForm(f=>({...f,heure:e.target.value}))}/></G3>
              <TA label="Observations" value={form.observations||""} onChange={e=>setForm(f=>({...f,observations:e.target.value}))} rows={2}/>
            </Col>
          )}/>}

        {page==="reunions"&&<ModuleTable icon="🤝" title="Réunion Mensuelle EC"
          cols={[{key:"date",label:"DATE",render:v=>fmt(v)},{key:"sujetOrga",label:"SUJET ORGA",wrap:true},{key:"suiviDossiers",label:"SUIVI DOSSIERS",wrap:true},{key:"difficultes",label:"DIFFICULTÉS",wrap:true},{key:"plansAction",label:"PLANS ACTION",wrap:true},{key:"participants",label:"PARTICIPANTS"},{key:"statut",label:"STATUT",render:v=><Pill label={v} color={sc(v)} small/>}]}
          rows={reunions} setRows={setReunions}
          formInit={{date:today,sujetOrga:"",suiviDossiers:"",pointsTechniques:"",difficultes:"",plansAction:"",divers:"",participants:"",statut:"À venir"}}
          exportName="reunions_mensuelles"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <G2><Inp label="Date *" type="date" value={form.date||""} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/><Sel label="Statut" value={form.statut||""} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>{["À venir","Tenu","Annulé","Reporté"].map(v=><option key={v}>{v}</option>)}</Sel></G2>
              <Inp label="I. Sujet organisationnel" value={form.sujetOrga||""} onChange={e=>setForm(f=>({...f,sujetOrga:e.target.value}))}/>
              {[["suiviDossiers","📁 Suivi dossiers / Catégorisation"],["pointsTechniques","🔧 Points techniques"],["difficultes","⚠️ Difficultés"],["plansAction","🎯 Plans d'actions"],["divers","💬 Divers"]].map(([k,l])=>(
                <TA key={k} label={l} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={2}/>
              ))}
              <Inp label="Participants" value={form.participants||""} onChange={e=>setForm(f=>({...f,participants:e.target.value}))}/>
            </Col>
          )}/>}

        {page==="plateformes"&&(() => {
          const [visibles,setVisibles] = useState({});
          const toggleVis = id => setVisibles(p=>({...p,[id]:!p[id]}));
          return (
            <Col gap={14}>
              <H icon="🔐" title="Annuaire des Accès Plateformes" code="R2_ENR_05_00"
                sub="Mots de passe masqués — visible Manager uniquement"
                actions={[<Btn key="add" onClick={()=>{}}>+ Ajouter</Btn>]}/>
              <div style={{background:C.orangePale,border:`1px solid ${C.orange}33`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.orange}}>
                🔒 Module réservé au Manager. Les mots de passe sont masqués par défaut.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
                {plateformes.map(p=>{
                  const PF_C={"E-Tax":C.teal,"SEN ETAFI":C.navy,"E-Services DGI":C.purple,"IPRES-CSS (Ndamli)":C.orange};
                  const c=PF_C[p.plateforme]||C.navy;
                  return (
                    <Card key={p.id} style={{position:"relative"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <div style={{fontWeight:800,fontSize:14,color:C.navy}}>{p.client}</div>
                          <div style={{fontSize:11,color:C.gray400}}>{p.cm} · {p.collaborateur}</div>
                        </div>
                        <Pill label={p.plateforme} color={c}/>
                      </div>
                      {p.ninea&&<div style={{fontSize:11,color:C.gray600,marginBottom:3}}><strong>NINEA :</strong> {p.ninea}</div>}
                      <div style={{background:C.gray50,borderRadius:8,padding:"8px 10px",marginTop:8}}>
                        <div style={{fontSize:11,marginBottom:4}}><strong>ID :</strong> <span style={{fontFamily:"monospace",color:c}}>{p.identifiant}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:11}}><strong>MDP :</strong> <span style={{fontFamily:"monospace"}}>{visibles[p.id]?p.motDePasse:"••••••••"}</span></div>
                          <button onClick={()=>toggleVis(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14}}>
                            {visibles[p.id]?"🙈":"👁"}
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Col>
          );
        })()}

        {page==="budget"&&<ModuleTable icon="💶" title="Budget Honoraires Conclus"
          cols={[{key:"client",label:"CLIENT"},{key:"montantConvenu",label:"MONTANT (FCFA)",render:v=><strong>{v?.toLocaleString("fr-FR")||"—"}</strong>},{key:"periodicite",label:"PÉRIODICITÉ"},{key:"modeReglement",label:"RÈGLEMENT"},{key:"statut",label:"STATUT",render:v=><Pill label={v} color={sc(v)}/>},{key:"observations",label:"OBS",wrap:true}]}
          rows={budget} setRows={setBudget}
          formInit={{client:"",montantConvenu:0,periodicite:"Mensuel",modeReglement:"Virement",statut:"En attente",observations:""}}
          exportName="budget_honoraires"
          currentUser={currentUser} addLog={addLog}
          renderForm={(form,setForm)=>(
            <Col gap={11}>
              <Inp label="Client *" value={form.client||""} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/>
              <G2><Inp label="Montant convenu (FCFA)" type="number" value={form.montantConvenu||0} onChange={e=>setForm(f=>({...f,montantConvenu:Number(e.target.value)}))}/><Sel label="Périodicité" value={form.periodicite||""} onChange={e=>setForm(f=>({...f,periodicite:e.target.value}))}>{["Mensuel","Trimestriel","Semestriel","Annuel"].map(v=><option key={v}>{v}</option>)}</Sel></G2>
              <G2><Inp label="Mode de règlement" value={form.modeReglement||""} onChange={e=>setForm(f=>({...f,modeReglement:e.target.value}))}/><Sel label="Statut" value={form.statut||""} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>{["Payé","En attente","Impayé"].map(v=><option key={v}>{v}</option>)}</Sel></G2>
              <TA label="Observations" value={form.observations||""} onChange={e=>setForm(f=>({...f,observations:e.target.value}))} rows={2}/>
            </Col>
          )}/>}

        {page==="users"&&<GestionUtilisateurs users={users} setUsers={setUsers} currentUser={currentUser} addLog={addLog}/>}

        {page==="audit"&&(
          <Col gap={14}>
            <H icon="📝" title="Piste d'audit" sub="Historique complet de toutes les modifications"
              actions={[<Btn key="clear" variant="ghost" size="sm" onClick={()=>setLogs([])}>🗑 Effacer</Btn>]}/>
            <Card>
              <AuditLog logs={logs}/>
            </Card>
          </Col>
        )}

        {page==="deploiement"&&<GuideDeploiement/>}
      </main>

      {/* Modal changement d'utilisateur (simulation) */}
      {loginModal&&(
        <Modal title="Changer d'utilisateur (simulation)" onClose={()=>setLoginModal(false)}>
          <Col gap={10}>
            <div style={{fontSize:12,color:C.gray600,marginBottom:4}}>
              Sélectionnez un utilisateur pour simuler son accès. En production, chacun se connecte avec son propre email et mot de passe.
            </div>
            {users.filter(u=>u.actif).map(u=>{
              const r=ROLES[u.role];
              return (
                <button key={u.id} onClick={()=>{setCurrentUser(u);setLoginModal(false);addLog(u.nom,"Connexion","Connexion à l'application");}}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,
                    border:`2px solid ${currentUser.id===u.id?r.color:C.gray200}`,
                    background:currentUser.id===u.id?r.color+"11":C.white,cursor:"pointer",fontFamily:font,textAlign:"left"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:r.color,
                    color:C.white,display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:700,fontSize:14,flexShrink:0}}>{u.avatar}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{u.nom}</div>
                    <div style={{fontSize:11,color:C.gray400}}>{u.email}</div>
                  </div>
                  <Pill label={r.label} color={r.color} small/>
                  {currentUser.id===u.id&&<span style={{marginLeft:"auto",fontSize:12,color:r.color}}>✓ Actif</span>}
                </button>
              );
            })}
          </Col>
        </Modal>
      )}
    </div>
  );
}