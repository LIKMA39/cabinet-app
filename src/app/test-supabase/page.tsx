"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Dossier = {
  id: number;
  nom: string;
  domaine: string | null;
  type_mission: string | null;
  senior: string | null;
  cm: string | null;
  collaborateur: string | null;
  support: string | null;
  jour_intervention: string | null;
  observations: string | null;
};

export default function TestSupabasePage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [message, setMessage] = useState("Chargement...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDossiers() {
      try {
        const { data, error } = await supabase
          .from("dossiers")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          setMessage("Erreur Supabase : " + error.message);
        } else {
          setDossiers(data || []);
          setMessage("Données chargées avec succès.");
        }
      } catch (e) {
        setMessage("Erreur de connexion à Supabase.");
      } finally {
        setLoading(false);
      }
    }

    loadDossiers();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Test Supabase — Dossiers</h1>
      <p>{message}</p>

      {loading && <p>Chargement en cours...</p>}

      {!loading && dossiers.length === 0 && (
        <p>Aucun dossier trouvé.</p>
      )}

      {!loading && dossiers.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Nom</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Domaine</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Type mission</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>CM</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Collaborateur</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((dossier) => (
              <tr key={dossier.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{dossier.id}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{dossier.nom}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{dossier.domaine}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{dossier.type_mission}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{dossier.cm}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{dossier.collaborateur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}