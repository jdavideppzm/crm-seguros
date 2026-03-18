import { AnimatePresence, motion } from "framer-motion";
import { X, Phone, Mail, MessageSquare, Save } from "lucide-react";
import { useState } from "react";
import type { Lead, PipelineStatus, Note } from "@/types/crm";
import { STATUS_CONFIG, USERS } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";

const transition = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface DetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
}

const allStatuses: PipelineStatus[] = [
  "agendar", "seguimiento", "recolectar", "emitir", "lograr", "bienvenida", "bloqueo", "devolucion",
];

export function DetailPanel({ lead, onClose, onUpdateLead }: DetailPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [editState, setEditState] = useState<PipelineStatus | null>(null);
  const [editAssigned, setEditAssigned] = useState<string>("");
  const [editRemark, setEditRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    if (lead) {
      setEditState(lead.state);
      setEditAssigned(lead.assignedTo || "");
      setEditRemark(lead.remark);
      setNewNote("");
    }
  };

  const handleSave = () => {
    if (!lead || editState === null) return;
    setSaving(true);
    const notes: Note[] = [
      ...(lead.notes || []),
      ...(newNote.trim()
        ? [{ id: Date.now().toString(), text: newNote.trim(), author: "Usuario", createdAt: new Date().toLocaleString("es-CO") }]
        : []),
    ];
    setTimeout(() => {
      onUpdateLead({ ...lead, state: editState, assignedTo: editAssigned, remark: editRemark, notes });
      setSaving(false);
      setNewNote("");
    }, 600);
  };

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          key="detail"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={transition}
          onAnimationComplete={() => handleOpen()}
          className="w-[480px] shrink-0 border-l border-border bg-card h-screen overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="text-sm font-semibold text-foreground truncate pr-4">{lead.propietario}</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="Placa" value={lead.placa || "—"} mono />
              <InfoField label="Ciudad" value={lead.lugar} />
              <InfoField label="Aseguradora" value={lead.insurance} />
              <InfoField label="Tipo" value={lead.tipoSeguro} />
              <InfoField label="Monto" value={formatMonto(lead.monto)} mono />
              <InfoField label="Fecha" value={lead.fecha} />
              <InfoField label="Seguimiento" value={`Día ${lead.followUp}`} />
              <InfoField label="Referencia" value={lead.reference || "—"} />
            </div>

            {/* Contact */}
            <div className="flex gap-2">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm text-foreground hover:bg-muted/80 transition-colors">
                  <Phone size={13} /> {lead.phone}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm text-foreground hover:bg-muted/80 transition-colors">
                  <Mail size={13} /> Email
                </a>
              )}
            </div>

            {/* Editable Fields */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
                <div className="flex flex-wrap gap-1.5">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditState(s)}
                      className={`transition-all ${editState === s ? "ring-2 ring-ring ring-offset-1" : "opacity-70 hover:opacity-100"}`}
                    >
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Asignado a</label>
                <select
                  value={editAssigned}
                  onChange={(e) => setEditAssigned(e.target.value)}
                  className="w-full text-sm py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Sin asignar</option>
                  {USERS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Observación</label>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  rows={2}
                  className="w-full text-sm py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3 pt-2 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground block">Notas / Historial</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(lead.notes || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Sin notas registradas.</p>
                )}
                {(lead.notes || []).map((note) => (
                  <div key={note.id} className="bg-muted/50 rounded-md px-3 py-2">
                    <p className="text-sm text-foreground">{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.author} · {note.createdAt}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="flex-1 text-sm py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {saving ? (
                    <span className="inline-block w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {saving ? "Guardando..." : "Actualizar ficha"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
