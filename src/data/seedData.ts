import type { Lead, PipelineStatus } from "@/types/crm";

export const SEED_LEADS: Lead[] = [
  { id: "1", fecha: "2/3", placa: "MAZ680", propietario: "Luisa Fernanda Rodriguez Acosta", insurance: "AXA COLPATRIA", email: "", phone: "3134563013", reference: "Se lleno sola", state: "emitido", followUp: "18", remark: "", lugar: "Bogota", tipoSeguro: "todo riesgo", monto: 1500000, assignedTo: "Carlos M.", origenLead: "Referido", activities: [
    { id: "act1", type: "call", text: "Llamar para confirmar emisión de póliza", author: "Carlos M.", createdAt: "1/4/2026 09:00", scheduledAt: "3/4/2026 10:00" },
    { id: "act2", type: "note", text: "Revisar documentos de emisión", author: "Sistema", createdAt: "1/4/2026 10:00", scheduledAt: "4/4/2026 14:00" },
  ] },
  { id: "2", fecha: "3/3", placa: "MCQ584", propietario: "Astrid Alejandra Rodriguez Zamora", insurance: "MAPFRE", email: "", phone: "3185164243", reference: "la de Dutyfree", state: "contactado", followUp: "18", remark: "dijo que hoy descansa", lugar: "Barranquilla", tipoSeguro: "parcial", monto: 1800000, assignedTo: "Ana R.", origenLead: "Redes sociales", activities: [
    { id: "act3", type: "call", text: "Seguimiento contacto inicial", author: "Ana R.", createdAt: "2/4/2026 08:00", scheduledAt: "3/4/2026 15:00" },
  ] },
  { id: "3", fecha: "5/3", placa: "PCX904", propietario: "Javier Eduardo Mendoza Castañeda", insurance: "SEGUROS BOLIVAR", email: "", phone: "3203732209", reference: "el de plan verder", state: "contactado", followUp: "18", remark: "pte que cambien valor asegu", lugar: "Medellin", tipoSeguro: "todo riesgo", monto: 1500000, assignedTo: "Pedro L.", origenLead: "Página web", activities: [
    { id: "act4", type: "email", text: "Enviar cotización por correo", author: "Pedro L.", createdAt: "1/4/2026 11:00", scheduledAt: "5/4/2026 09:00" },
  ] },
  { id: "4", fecha: "12/3", placa: "", propietario: "Catalina Velez Giraldo", insurance: "ALLIANZ", email: "", phone: "3215757107", reference: "La de la Kardian", state: "cotizacion", followUp: "18", remark: "", lugar: "Bogota", tipoSeguro: "parcial", monto: 1800000, assignedTo: "María G.", origenLead: "Referido", activities: [
    { id: "act5", type: "call", text: "Llamar para cerrar cotización", author: "María G.", createdAt: "30/3/2026 16:00", scheduledAt: "2/4/2026 11:00" },
  ] },
  { id: "5", fecha: "14/3", placa: "JEV457", propietario: "Alvaro Gonzalo Durango Valero", insurance: "EQUIDAD", email: "", phone: "3104619032", reference: "el de la tundra rentista", state: "contactado", followUp: "18", remark: "pte cando la lleva", lugar: "Barranquilla", tipoSeguro: "todo riesgo", monto: 1500000, assignedTo: "Carlos M.", origenLead: "Llamada entrante" },
  { id: "6", fecha: "16/3", placa: "URW09G", propietario: "Jair Andres Quiñones Polo", insurance: "SURA", email: "", phone: "3244119076", reference: "", state: "nuevo", followUp: "18", remark: "", lugar: "Bogota", tipoSeguro: "parcial", monto: 1800000, assignedTo: "Ana R." },
  { id: "7", fecha: "16/3", placa: "ZZL133", propietario: "Humberto Edgardo Viloria Mendoza", insurance: "EQUIDAD", email: "", phone: "3246876094", reference: "el enfermero de la cardio", state: "emitido", followUp: "18", remark: "", lugar: "Valledupar", tipoSeguro: "todo riesgo", monto: 1500000, assignedTo: "Pedro L.", origenLead: "Base de datos" },
  { id: "8", fecha: "17/3", placa: "IIV901", propietario: "Jose Arcesio Parra Mora", insurance: "EQUIDAD", email: "", phone: "3103164908", reference: "el pensioando", state: "seguimiento", followUp: "18", remark: "", lugar: "Manizales", tipoSeguro: "parcial", monto: 1800000, assignedTo: "María G." },
  { id: "9", fecha: "17/3", placa: "JUT307", propietario: "Adriana Carolina Camargo Galvan", insurance: "ALLIANZ", email: "", phone: "3022093941", reference: "la que no renovo y volvio", state: "cotizacion", followUp: "31", remark: "poner en agendar hoy", lugar: "Medellin", tipoSeguro: "todo riesgo", monto: 1500000, assignedTo: "Carlos M.", origenLead: "Referido" },
  { id: "10", fecha: "17/3", placa: "RLN368", propietario: "Josue Hernandez Manzanera", insurance: "ALLIANZ", email: "", phone: "3103063795", reference: "el hijo veterinario", state: "nuevo", followUp: "19", remark: "", lugar: "Valledupar", tipoSeguro: "parcial", monto: 1800000, assignedTo: "Ana R." },
  { id: "11", fecha: "17/3", placa: "KWR757", propietario: "Cr Inversiones Reuto Villalvazo Sas", insurance: "SEGUROS BOLIVAR", email: "", phone: "3103315191", reference: "Christian", state: "ganado", followUp: "18", remark: "", lugar: "Barranquilla", tipoSeguro: "todo riesgo", monto: 1500000, assignedTo: "Pedro L.", paymentStatus: "Pagado", origenLead: "Referido" },
];
