/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Printer, 
  User, 
  Weight, 
  Ruler, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Stethoscope,
  ChevronRight,
  UserRound,
  UserRoundPlus,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---

type Gender = 'M' | 'F';

interface RiskFactor {
  id: string;
  label: string;
  points: number;
  genderOnly?: Gender;
}

const RISK_FACTORS_1: RiskFactor[] = [
  { id: 'age_41_60', label: 'Idade 41-60 anos', points: 1 },
  { id: 'minor_surgery', label: 'Cirurgia menor (<45 min)', points: 1 },
  { id: 'varicose_veins', label: 'Varizes visíveis', points: 1 },
  { id: 'edema', label: 'Edema de MMII (Pernas inchadas)', points: 1 },
  { id: 'heart_sepsis', label: 'Condições cardíacas / Sepse', points: 1 },
  { id: 'restricted_mobility', label: 'Mobilidade restrita', points: 1 },
  { id: 'copd_pneumonia', label: 'DPOC / Pneumonia', points: 1 },
  { id: 'ibd', label: 'Histórico de DII (Doença Inflamatória Intestinal)', points: 1 },
  { id: 'smoking', label: 'Tabagismo', points: 1 },
  { id: 'diabetes', label: 'Diabetes (Uso de Insulina)', points: 1 },
  { id: 'chemotherapy', label: 'Quimioterapia', points: 1 },
  { id: 'blood_transfusion', label: 'Transfusão de Sangue', points: 1 },
  { id: 'hiv', label: 'HIV', points: 1 },
  { id: 'surgery_2h', label: 'Cirurgia > 2 horas', points: 1 },
  { id: 'ocp_hrt', label: 'Anticoncepcional ou TRH', points: 1, genderOnly: 'F' },
  { id: 'pregnancy', label: 'Gravidez ou pós-parto (<1 mês)', points: 1, genderOnly: 'F' },
  { id: 'obstetric_history', label: 'Histórico Obstétrico Alterado (Aborto repetição, etc)', points: 1, genderOnly: 'F' },
];

const RISK_FACTORS_2: RiskFactor[] = [
  { id: 'age_61_74', label: 'Idade 61-74 anos', points: 2 },
  { id: 'cancer', label: 'Câncer atual ou prévio', points: 2 },
  { id: 'major_surgery', label: 'Cirurgia grande porte (>45 min)', points: 2 },
  { id: 'central_venous', label: 'Acesso venoso central', points: 2 },
  { id: 'plaster_cast', label: 'Imobilização gessada', points: 2 },
];

const RISK_FACTORS_3: RiskFactor[] = [
  { id: 'age_75_plus', label: 'Idade 75 anos ou mais', points: 3 },
  { id: 'personal_vte', label: 'Histórico pessoal de TEV', points: 3 },
  { id: 'family_vte', label: 'Histórico familiar de trombose', points: 3 },
  { id: 'thrombophilia', label: 'Trombofilia conhecida', points: 3 },
];

const RISK_FACTORS_5: RiskFactor[] = [
  { id: 'arthroplasty', label: 'Artroplastia (Joelho/Quadril)', points: 5 },
  { id: 'fracture', label: 'Fratura de Quadril/Pelve/Perna', points: 5 },
  { id: 'trauma', label: 'Trauma grave (Politrauma)', points: 5 },
  { id: 'spinal_injury', label: 'Lesão medular com paralisia', points: 5 },
  { id: 'stroke', label: 'AVC recente (<1 mês)', points: 5 },
];

// --- Main Component ---

export default function App() {
  const [patientName, setPatientName] = useState('');
  const [patientID, setPatientID] = useState('');
  const [gender, setGender] = useState<Gender>('M');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('aldo');
  const [doctorName, setDoctorName] = useState('Aldo Z. Passalacqua');
  const [doctorCRM, setDoctorCRM] = useState('CRM/MS: 8027');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Cirurgia Vascular');
  const [selectedFactors, setSelectedFactors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'form' | 'report'>('form');

  // BMI Calculation
  const bmi = useMemo(() => {
    const w = parseFloat(weight.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.'));
    if (w > 0 && h > 0) return w / (h * h);
    return 0;
  }, [weight, height]);

  // Score Calculation
  const { totalScore, tickedLabels } = useMemo(() => {
    let score = 0;
    const labels: string[] = [];

    // BMI points
    if (bmi > 40) {
      score += 2;
      labels.push(`Obesidade Mórbida (IMC ${bmi.toFixed(1)}) (+2)`);
    } else if (bmi > 25) {
      score += 1;
      labels.push(`IMC > 25 (${bmi.toFixed(1)}) (+1)`);
    }

    // Factors points
    const allFactors = [...RISK_FACTORS_1, ...RISK_FACTORS_2, ...RISK_FACTORS_3, ...RISK_FACTORS_5];
    allFactors.forEach(f => {
      if (selectedFactors.has(f.id)) {
        if (f.genderOnly && f.genderOnly !== gender) return;
        score += f.points;
        labels.push(`${f.label} (+${f.points})`);
      }
    });

    return { totalScore: score, tickedLabels: labels };
  }, [bmi, selectedFactors, gender]);

  // Risk Classification Logic
  const riskInfo = useMemo(() => {
    const isArthroplasty = selectedFactors.has('arthroplasty');
    
    if (totalScore >= 9) {
      return {
        label: "Risco Elevadíssimo (10,7%)",
        color: "text-red-600",
        prophylaxis: "Deambulação Precoce + HNF/HBPM + CPI",
        duration: "30 dias (Profilaxia Estendida)"
      };
    } else if (totalScore >= 7) {
      return {
        label: "Risco Muito Alto (4,0%)",
        color: "text-red-500",
        prophylaxis: "Deambulação Precoce + HNF/HBPM ± CPI",
        duration: totalScore >= 7 || isArthroplasty ? "Até 30 dias" : "7-10 dias"
      };
    } else if (totalScore >= 5) {
      return {
        label: "Risco Alto (1,8%)",
        color: "text-orange-600",
        prophylaxis: "Deambulação Precoce + HNF/HBPM ou CPI",
        duration: isArthroplasty ? "Até 30 dias" : "7-10 dias"
      };
    } else if (totalScore >= 3) {
      return {
        label: "Risco Moderado (<0,7%)",
        color: "text-yellow-600",
        prophylaxis: "Deambulação Precoce + Profilaxia Farmacológica ou Mecânica",
        duration: "Período de internação"
      };
    } else {
      return {
        label: "Risco Baixo (<0,5%)",
        color: "text-green-600",
        prophylaxis: "Apenas Deambulação Precoce",
        duration: "N/A"
      };
    }
  }, [totalScore, selectedFactors]);

  const toggleFactor = (id: string, points: number) => {
    const newSelected = new Set(selectedFactors);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      // Logic for Surgery durations linkages from user request
      if (id === 'surgery_2h') {
        newSelected.add('major_surgery');
      }
      newSelected.add(id);
    }
    setSelectedFactors(newSelected);
  };

  const handlePrint = () => {
    // Focus window and trigger print with a fallback alert
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
      alert("Para imprimir, clique no botão de imprimir do seu navegador ou tente abrir esta página em uma nova aba.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-800 selection:bg-blue-100">
      {/* Global CSS for Printing */}
      <style>{`
        .print-only { display: none; }
        @media print {
          @page { 
            size: A4;
            margin: 1.5cm; 
          }
          body { 
            background: white !important; 
            font-family: serif !important; 
            color: black !important;
            font-size: 11pt !important;
            line-height: 1.2 !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .container { 
            max-width: 100% !important; 
            box-shadow: none !important; 
            padding: 0 !important; 
            margin: 0 !important;
          }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          
          /* Prevent page breaks inside sections */
          .print-section { page-break-inside: avoid; }
        }
        input, button { touch-action: manipulation; }
      `}</style>

      {/* --- Main App UI --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Component */}
            <div className="flex flex-col items-start gap-1 group">
              <div className="w-auto h-16 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://i.postimg.cc/ZnMMFLf5/logoneov-sem-escrito.jpg" 
                  alt="NeoVasc Logo" 
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    // Fallback to a styled text logo if image is missing
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-10 h-10 bg-[#1a3a5f] rounded-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="M12 4v4"/><path d="M12 12v4"/><path d="M12 20v.01"/></svg></div>';
                    }
                  }}
                />
              </div>
              <p className="text-[9px] text-[#1a3a5f] font-black uppercase tracking-[0.2em] leading-none ml-1">Flebologia Avançada</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'form') {
                  setViewMode('report');
                } else {
                  handlePrint();
                }
              }}
              className={`flex items-center gap-2 ${viewMode === 'report' ? 'bg-[#1a3a5f]' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-200`}
            >
              {viewMode === 'report' ? <Printer size={20} /> : <CheckCircle2 size={20} />}
              <span className="hidden sm:inline">{viewMode === 'report' ? 'Imprimir Agora' : 'Gerar Laudo'}</span>
            </button>
            {viewMode === 'report' && (
              <button 
                type="button"
                onClick={() => setViewMode('form')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* View Mode Toggle Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'form' ? (
          <motion.main 
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="max-w-4xl mx-auto px-4 py-8 no-print"
          >
            {/* Patient Data Section */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
              <div className="flex items-center gap-2 mb-6 border-l-4 border-blue-500 pl-3">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Identificação do Paciente</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <User size={16} /> Nome Completo do Paciente
                  </label>
                  <input 
                    type="text" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50/50 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Info size={16} /> ID / Prontuário
                  </label>
                  <input 
                    type="text" 
                    value={patientID}
                    onChange={(e) => setPatientID(e.target.value)}
                    placeholder="Nº de Registro"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50/50 text-base"
                  />
                </div>
              </div>

              {/* Doctor Info Section */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-3">
                  <Stethoscope size={16} /> Médico Responsável
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'aldo', name: 'Aldo Z. Passalacqua', crm: 'CRM/MS: 8027', specialty: 'Cirurgia Vascular' },
                    { id: 'cesar', name: 'César P. Campos', crm: 'CRM/MS: 8029', specialty: 'Cirurgia Vascular' }
                  ].map((doc) => (
                    <button 
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setDoctorName(doc.name);
                        setDoctorCRM(doc.crm);
                        setDoctorSpecialty(doc.specialty);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${selectedDoctorId === doc.id ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedDoctorId === doc.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <User size={20} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${selectedDoctorId === doc.id ? 'text-blue-900' : 'text-slate-700'}`}>{doc.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{doc.crm} • {doc.specialty}</p>
                      </div>
                      {selectedDoctorId === doc.id && (
                        <div className="ml-auto text-blue-600">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    {gender === 'M' ? <UserRound size={16} /> : <UserRoundPlus size={16} className="text-pink-500" />} Gênero
                  </label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setGender('M')}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${gender === 'M' ? 'bg-white text-[#1a3a5f] shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      MASCULINO
                    </button>
                    <button 
                      onClick={() => setGender('F')}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${gender === 'F' ? 'bg-[#d63384] text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      FEMININO
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Weight size={16} /> Peso (kg)
                  </label>
                  <input 
                    type="text" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 75"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50/50 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Ruler size={16} /> Altura (m)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Ex: 1.70"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-slate-50/50 text-base"
                    />
                    {bmi > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        IMC: {bmi.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Risk Factors Sections */}
            <div className="space-y-6">
              <RiskSection title="1 PONTO" factors={RISK_FACTORS_1} selected={selectedFactors} onToggle={toggleFactor} gender={gender} color="blue" />
              <RiskSection title="2 PONTOS" factors={RISK_FACTORS_2} selected={selectedFactors} onToggle={toggleFactor} gender={gender} color="orange" />
              <RiskSection title="3 PONTOS" factors={RISK_FACTORS_3} selected={selectedFactors} onToggle={toggleFactor} gender={gender} color="red" />
              <RiskSection title="5 PONTOS" factors={RISK_FACTORS_5} selected={selectedFactors} onToggle={toggleFactor} gender={gender} color="red-dark" />
            </div>
          </motion.main>
        ) : (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-4 py-8 no-print"
          >
            <div className="bg-white rounded-2xl p-12 shadow-2xl border border-slate-200 relative overflow-hidden">
               {/* Watermark/Accent */}
               <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 -translate-y-4 translate-x-4">
                  <Stethoscope size={200} />
               </div>

               {/* Report UI Preview */}
               <div className="flex flex-col items-center border-b-2 border-[#1a3a5f] pb-8 mb-8">
                  <div className="w-auto h-28 mb-1 flex flex-col items-center justify-center">
                    <img 
                      src="https://i.postimg.cc/ZnMMFLf5/logoneov-sem-escrito.jpg" 
                      alt="NeoVasc Logo" 
                      className="h-full w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const p = e.currentTarget.parentElement;
                        if(p) p.innerHTML = '<span class="text-4xl font-black text-[#1a3a5f]">NEOVASC</span>';
                      }}
                    />
                    <p className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-[0.3em] mt-2">Flebologia Avançada</p>
                  </div>
                  <h2 className="text-2xl font-black text-[#1a3a5f] uppercase tracking-tight mt-6">Relatório de Avaliação Caprini</h2>
               </div>

               <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest italic border-b border-slate-200 pb-2">Paciente</p>
                    <p className="text-xl font-bold text-[#1a3a5f] leading-tight">{patientName || "Não Identificado"}</p>
                    <p className="text-xs text-slate-500 font-medium mt-2">ID: {patientID || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest italic border-b border-slate-200 pb-2">Médico Responsável</p>
                    <p className="text-xl font-bold text-[#1a3a5f] leading-tight">{doctorName || "Não Informado"}</p>
                    <p className="text-xs text-slate-500 font-medium mt-2">{doctorCRM || "N/A"} • {doctorSpecialty}</p>
                  </div>
               </div>

               <div className="mb-10">
                  <h3 className="text-sm font-black text-[#1a3a5f] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                    Fatores Encontrados
                  </h3>
                  <div className="space-y-2">
                    {tickedLabels.map((label, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50/50 p-2 rounded-lg"
                      >
                         <span className="text-blue-500 font-bold">•</span>
                         <span>{label}</span>
                      </motion.div>
                    ))}
                    {tickedLabels.length === 0 && <p className="text-sm italic text-slate-400">Nenhum fator adicional pontuado.</p>}
                  </div>
               </div>

               <div className="bg-[#1a3a5f] text-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/10 mb-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Escore Caprini</p>
                      <p className="text-7xl font-black">{totalScore}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Classificação</p>
                      <p className="text-2xl font-black uppercase text-blue-200 mb-4">{riskInfo.label}</p>
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-medium">
                        Duração: {riskInfo.duration}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Profilaxia Sugerida</p>
                    <p className="text-lg font-bold leading-tight">{riskInfo.prophylaxis}</p>
                  </div>
               </div>

               <div className="flex justify-center pt-8 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrint();
                    }}
                    className="group bg-[#1a3a5f] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-3 shadow-2xl shadow-blue-900/20 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    <Printer size={20} className="group-hover:rotate-12 transition-transform" /> 
                    Confirmar e Imprimir
                  </button>
               </div>
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-6 font-medium italic">
              Este laudo deve ser anexado aos documentos pré-operatórios do paciente.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Panel (Only in Form Mode) */}
      {viewMode === 'form' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40 no-print">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-6">
            <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-2 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Total</span>
              <span className="text-4xl font-black text-[#1a3a5f] tabular-nums">{totalScore}</span>
            </div>
            
            <div className="flex-1">
              <div className={`text-lg font-black flex items-center gap-2 ${riskInfo.label !== "N/A" ? riskInfo.color : 'text-slate-400'}`}>
                <AlertTriangle size={20} />
                {riskInfo.label}
              </div>
              <div className="text-xs text-slate-600 font-medium line-clamp-2">
                <span className="text-slate-400 font-bold mr-1">PROFILAXIA:</span>
                {riskInfo.prophylaxis}
              </div>
            </div>

            <button 
              onClick={() => setViewMode('report')}
              className="flex items-center justify-center p-4 bg-[#1a3a5f] text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95 group"
              title="Gerar Laudo Pré-Visualizável"
            >
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </footer>
      )}

      {/* --- PURE PRINTABLE REPORT AREA (Used by window.print()) --- */}
      <div className="print-only container mx-auto p-12 bg-white text-black font-serif">
         {/* Report Header for Paper */}
         <div className="flex flex-col items-center border-b-2 border-black pb-8 mb-8">
            <div className="w-auto h-28 mb-1 flex flex-col items-center justify-center">
              <img 
                src="https://i.postimg.cc/ZnMMFLf5/logoneov-sem-escrito.jpg" 
                alt="NeoVasc Logo" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const p = e.currentTarget.parentElement;
                  if(p) p.innerHTML = '<span class="text-3xl font-black">NEOVASC</span>';
                }}
              />
              <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] mt-2">Flebologia Avançada</p>
            </div>
            <h2 className="text-2xl font-black mt-8 uppercase text-center tracking-tight">Relatório de Avaliação de Risco de TEV</h2>
         </div>

         {/* Patient Info for Paper */}
         <div className="mb-8 border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="border-b border-r border-slate-300 p-3 bg-slate-50 font-bold w-1/4 uppercase">Paciente</td>
                  <td className="border-b border-slate-300 p-3 w-3/4">{patientName || "________________________________________________"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-slate-300 p-3 bg-slate-50 font-bold uppercase">Registro / ID</td>
                  <td className="border-b border-slate-300 p-3">{patientID || "________________"}</td>
                </tr>
                <tr>
                  <td className="border-r border-slate-300 p-3 bg-slate-50 font-bold uppercase">Data Avaliação</td>
                  <td className="p-3">{new Date().toLocaleDateString('pt-BR')}</td>
                </tr>
              </tbody>
            </table>
         </div>

         {/* Selection Summary for Paper */}
         <div className="mb-4 print-section">
            <h3 className="text-md font-bold border-b border-black mb-2 uppercase flex items-center gap-2 pb-1">
              Fatores de Risco Identificados
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[9pt]">
              {tickedLabels.length > 0 ? tickedLabels.map((l, i) => (
                <div key={i} className="flex gap-2 items-start shrink-0">
                  <span className="font-bold shrink-0">•</span>
                  <span className="leading-tight shrink-0">{l}</span>
                </div>
              )) : (
                <p className="italic text-slate-500 col-span-2">Nenhum fator de risco identificado.</p>
              )}
            </div>
         </div>

         {/* Results Box for Paper */}
         <div className="mb-4 p-4 border-2 border-black rounded-xl print-section">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9pt] font-bold text-slate-500 uppercase mb-1 tracking-widest">Caprini Score Total</p>
                  <p className="text-4xl font-black">{totalScore}</p>
               </div>
               <div>
                  <p className="text-[9pt] font-bold text-slate-500 uppercase mb-1 tracking-widest">Classificação de Risco</p>
                  <p className="text-xl font-black uppercase">{riskInfo.label}</p>
               </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-300">
               <div>
                  <p className="text-[9pt] font-bold text-slate-500 uppercase mb-0.5 tracking-widest">Profilaxia Recomendada</p>
                  <p className="text-md font-bold">{riskInfo.prophylaxis}</p>
                  <p className="text-sm mt-0.5 font-medium italic">Duração: {riskInfo.duration}</p>
               </div>
            </div>
         </div>

         {/* Detailed Guidelines for Paper */}
         <div className="mb-4 print-section">
            <h3 className="text-md font-bold border-b border-black mb-2 uppercase pb-1">Conduta Sugerida</h3>
            <div className="text-[9pt] space-y-1">
              <p><strong>Deambulação:</strong> Incentivar mobilização precoce ativa ou passiva.</p>
              {totalScore >= 3 && <p><strong>Mecânica:</strong> Uso de meias de compressão graduada ou compressão pneumática intermitente (CPI).</p>}
              {totalScore >= 5 && <p><strong>Farmacológica:</strong> Iniciar profilaxia com HBPM (ex: Enoxaparina 40mg SC 1x/dia) ou HNF, ressalvadas contraindicações hemorrágicas.</p>}
            </div>
         </div>

         {/* Signature / Doctor Block for Paper */}
         <div className="flex justify-between items-end mt-4 print-section">
            <div className="text-[8px] text-slate-400">
               Doc ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
            <div className="flex flex-col items-center">
               {doctorName ? (
                 <div className="flex flex-col items-center">
                    <p className="text-sm font-black uppercase text-center">{doctorName}</p>
                    <p className="text-xs font-bold text-slate-600 text-center">{doctorCRM}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">{doctorSpecialty}</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                    <div className="w-64 border-b border-black mb-1"></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Assinatura Médica</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}


// --- Sub-components ---

function RiskSection({ 
  title, 
  factors, 
  selected, 
  onToggle, 
  gender, 
  color 
}: { 
  title: string, 
  factors: RiskFactor[], 
  selected: Set<string>, 
  onToggle: (id: string, p: number) => void,
  gender: Gender,
  color: string
}) {
  const visibleFactors = factors.filter(f => !f.genderOnly || f.genderOnly === gender);
  
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 text-blue-700 bg-blue-50',
    orange: 'border-orange-500 text-orange-700 bg-orange-50',
    red: 'border-red-500 text-red-700 bg-red-50',
    'red-dark': 'border-red-800 text-red-900 bg-red-100',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${colorMap[color]}`}>
          {title}
        </span>
        <div className="h-px flex-1 bg-slate-100"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleFactors.map((f) => (
          <label 
            key={f.id}
            className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              selected.has(f.id) 
                ? 'bg-[#1a3a5f]/5 border-[#1a3a5f] ring-1 ring-[#1a3a5f]' 
                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="relative mt-0.5">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={selected.has(f.id)}
                onChange={() => onToggle(f.id, f.points)}
              />
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                selected.has(f.id) ? 'bg-[#1a3a5f] text-white' : 'border-2 border-slate-200 bg-white'
              }`}>
                {selected.has(f.id) && <CheckCircle2 size={14} strokeWidth={4} />}
              </div>
            </div>
            <div className="flex-1">
              <span className={`text-sm leading-tight transition-colors ${selected.has(f.id) ? 'text-[#1a3a5f] font-bold' : 'text-slate-600 font-medium'}`}>
                {f.label}
              </span>
            </div>
            {f.genderOnly === 'F' && (
              <span className="shrink-0 text-[10px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded uppercase">Fem</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
