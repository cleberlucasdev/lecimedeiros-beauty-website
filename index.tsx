import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- Supabase ---

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

const mapRow = (r: any): Appointment => ({
  id: r.id,
  serviceId: r.service_id,
  serviceName: r.service_name,
  subOptionName: r.sub_option_name ?? undefined,
  hairLength: r.hair_length ?? undefined,
  date: r.date,
  time: r.time,
  durationMinutes: r.duration_minutes,
  clientName: r.client_name,
  clientPhone: r.client_phone,
  status: r.status,
  createdAt: r.created_at,
});
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Scissors, 
  LogOut, 
  Check, 
  X, 
  MessageCircle, 
  MapPin, 
  Clock4, 
  Edit2, 
  Sparkles, 
  ArrowRight, 
  Info, 
  CalendarDays,
  LayoutDashboard,
  Bell,
  AlarmClock,
  Coffee
} from 'lucide-react';

// --- Tipos e Interfaces ---

interface ServiceOption {
  id: string;
  name: string;
  price: string;
  duration: string;
  durationMinutes: number;
  isStartingPrice: boolean;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  displayPrice: string;
  displayDuration: string;
  durationMinutes?: number; 
  options?: ServiceOption[];
  requiresLength?: boolean;
  isStartingPrice: boolean;
}

interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  subOptionName?: string;
  hairLength?: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  clientName: string;
  clientPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number;
}

// --- Configurações e Dados Estáticos ---

const SERVICES: ServiceCategory[] = [
  { 
    id: '1', 
    name: 'Corte', 
    displayPrice: 'a partir de R$ 30', 
    displayDuration: '30-50 min',
    isStartingPrice: true,
    options: [
      { id: '1.1', name: 'Corte Feminino', price: 'R$ 50', duration: '50 min', durationMinutes: 50, isStartingPrice: true },
      { id: '1.2', name: 'Corte Masculino', price: 'R$ 30', duration: '30 min', durationMinutes: 30, isStartingPrice: false }
    ]
  },
  { id: '2', name: 'Hidratação', displayPrice: 'a partir de R$ 50', displayDuration: '45 min', durationMinutes: 45, isStartingPrice: true },
  { 
    id: '3', 
    name: 'Coloração', 
    displayPrice: 'a partir de R$ 50', 
    displayDuration: '1h',
    isStartingPrice: false,
    options: [
      { id: '3.1', name: 'Com tintura trazida pelo cliente', price: 'R$ 50', duration: '1h', durationMinutes: 60, isStartingPrice: false },
      { id: '3.2', name: 'Com tintura fornecida pelo salão', price: 'R$ 80', duration: '1h', durationMinutes: 60, isStartingPrice: false }
    ]
  },
  { id: '4', name: 'Escova', displayPrice: 'a partir de R$ 50', displayDuration: '1h', durationMinutes: 60, isStartingPrice: true },
  { id: '5', name: 'Sobrancelha', displayPrice: 'R$ 25', displayDuration: '30 min', durationMinutes: 30, isStartingPrice: false },
  { 
    id: '6', 
    name: 'Progressiva', 
    displayPrice: 'a partir de R$ 120', 
    displayDuration: '2h 30min - 4h',
    isStartingPrice: true,
    requiresLength: true,
    options: [
      { id: '6.1', name: 'Com formol', price: 'R$ 120', duration: '4h', durationMinutes: 240, isStartingPrice: true },
      { id: '6.2', name: 'Sem formol', price: 'R$ 140', duration: '4h', durationMinutes: 240, isStartingPrice: true }
    ]
  },
  { id: '7', name: 'Botox', displayPrice: 'a partir de R$ 120', displayDuration: '2h+', durationMinutes: 120, isStartingPrice: true },
  { 
    id: '8', 
    name: 'Selagem', 
    displayPrice: 'a partir de R$ 120', 
    displayDuration: '2h 30min - 4h',
    isStartingPrice: true,
    requiresLength: true,
    options: [
      { id: '8.1', name: 'Com formol', price: 'R$ 120', duration: '4h', durationMinutes: 240, isStartingPrice: true },
      { id: '8.2', name: 'Sem formol', price: 'R$ 140', duration: '4h', durationMinutes: 240, isStartingPrice: true }
    ]
  },
  { 
    id: '9', 
    name: 'Cronograma Capilar (3 sessões)', 
    description: '(Hidratação, restauração e nutrição) — Valor total único pelas 3 sessões.',
    displayPrice: 'a partir de R$ 210', 
    displayDuration: '1h cada sessão', 
    durationMinutes: 60, 
    isStartingPrice: true 
  },
  { id: '10', name: 'Corte + Escova', displayPrice: 'a partir de R$ 80', displayDuration: '1h', durationMinutes: 60, isStartingPrice: true },
  { id: '11', name: 'Hidratação + Escova', displayPrice: 'a partir de R$ 80', displayDuration: '1h', durationMinutes: 60, isStartingPrice: true },
  { id: '12', name: 'Botox + Hidratação', displayPrice: 'a partir de R$ 60', displayDuration: '1h', durationMinutes: 60, isStartingPrice: true },
  { id: '13', name: 'Luzes (técnica atualizada)', displayPrice: 'a partir de R$ 300', displayDuration: '4h', durationMinutes: 240, isStartingPrice: true },
  { id: '14', name: 'Morena Iluminada', displayPrice: 'a partir de R$ 320', displayDuration: '4h', durationMinutes: 240, isStartingPrice: true },
  { 
    id: '15', 
    name: 'Coloração + Escova', 
    displayPrice: 'a partir de R$ 100', 
    displayDuration: '1h 30min',
    durationMinutes: 90,
    isStartingPrice: true,
    options: [
      { id: '15.1', name: 'Com tintura trazida pelo cliente', price: 'R$ 100', duration: '1h 30min', durationMinutes: 90, isStartingPrice: true },
      { id: '15.2', name: 'Com tintura fornecida pelo salão', price: 'R$ 130', duration: '1h 30min', durationMinutes: 90, isStartingPrice: true }
    ]
  }
];

const LUNCH_START = 660; // 11:00 em minutos
const LUNCH_END = 780;   // 13:00 em minutos
const CLOSING_TIME = 1080; // 18:00 em minutos

const generateBusinessHours = () => {
  const hours = [];
  for (let h = 8; h <= 18; h++) {
    const hh = h.toString().padStart(2, '0');
    // Não permite iniciar atendimento no meio do almoço
    const m00 = h * 60;
    const m30 = h * 60 + 30;

    if (m00 < LUNCH_START || m00 >= LUNCH_END) {
        if (h < 18) hours.push(`${hh}:00`);
    }
    if (m30 < LUNCH_START || m30 >= LUNCH_END) {
        if (h < 18) hours.push(`${hh}:30`);
    }
  }
  return hours;
};

const BUSINESS_HOURS = generateBusinessHours();
const SALON_NAME = "Leci Medeiros Salão de Beleza";
const WHATSAPP_NUMBER = "5531985880095";

// --- Helpers ---

const formatDisplayDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

const getDayName = (dateStr: string) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[new Date(dateStr + 'T12:00:00').getDay()];
};

const maskPhone = (value: string) => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  else if (v.length > 0) v = v.replace(/^(\d{0,2})/, "($1");
  return v;
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// --- Componentes de UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseStyles = "relative overflow-hidden px-8 py-5 rounded-full font-bold text-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-indigo-950 text-white hover:bg-indigo-900 shadow-[0_10px_20px_-5px_rgba(30,27,75,0.4)]",
    secondary: "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_10px_20px_-5px_rgba(244,63,94,0.4)]",
    outline: "border-2 border-indigo-950 text-indigo-950 hover:bg-indigo-50",
    ghost: "text-indigo-950 hover:bg-indigo-50/50",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", noPadding = false }: any) => (
  <div className={`bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden ${noPadding ? '' : 'p-8'} ${className}`}>
    {children}
  </div>
);

// --- Aplicação Principal ---

export default function App() {
  const [page, setPage] = useState<string>('/');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('Supabase fetch error:', error); return; }
        setAppointments((data ?? []).map(mapRow));
      });
  }, []);

  const navigate = (to: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(to);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-rose-100">
      <div className="max-w-screen-xl mx-auto">
        {page === '/' && <LandingPage navigate={navigate} />}
        {page === '/agenda' && <BookingPage navigate={navigate} onComplete={(app: Appointment) => setAppointments(prev => [app, ...prev])} appointments={appointments} />}
        {page === '/admin/login' && <AdminLogin onLogin={() => { setIsAdmin(true); navigate('/admin'); }} onBack={() => navigate('/')} />}
        {page === '/admin' && isAdmin && (
          <AdminPanel 
            appointments={appointments} 
            onUpdate={async (updated: Appointment) => {
              const { error } = await supabase
                .from('agendamentos')
                .update({
                  status: updated.status,
                  date: updated.date,
                  time: updated.time,
                })
                .eq('id', updated.id);
              if (error) { console.error('Supabase update error:', error); return; }
              setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
            }}
            onLogout={() => { setIsAdmin(false); navigate('/'); }}
          />
        )}
      </div>

      {!page.includes('admin') && (
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          className="fixed bottom-8 left-8 z-50 bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          <MessageCircle size={32} />
          <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl shadow-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-100">
            Dúvidas? Chame agora!
          </span>
        </a>
      )}
    </div>
  );
}

// --- Landing Page ---

function LandingPage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="px-6 py-12 md:py-24">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-6 py-2 rounded-full font-bold text-lg mb-8 animate-bounce">
          <Sparkles size={20} />
          Agenda aberta para esta semana!
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-black text-indigo-950 mb-8 leading-[1.1]">
          Sua melhor <span className="text-rose-500 italic">versão</span> começa aqui.
        </h1>
        
        <p className="text-2xl text-slate-500 mb-12 max-w-2xl leading-relaxed">
          No {SALON_NAME}, oferecemos cuidado personalizado para realçar sua autoestima com excelência e carinho.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg mb-20">
          <Button onClick={() => navigate('/agenda')} className="flex-1 py-7 text-2xl">
            Agendar Agora <ArrowRight size={24} />
          </Button>
          <Button variant="outline" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`)} className="flex-1 py-7 text-2xl">
            WhatsApp
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <Card className="hover:-translate-y-2 transition-transform cursor-default group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-950 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-950 group-hover:text-white transition-colors">
              <MapPin size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Localização</h3>
            <p className="text-lg text-slate-500">Rua Granada, 269 — Bethânia, Ipatinga. Fácil acesso e ambiente aconchegante.</p>
          </Card>

          <Card className="hover:-translate-y-2 transition-transform cursor-default group">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Clock4 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Atendimento</h3>
            <p className="text-lg text-slate-500">Terça a Sábado, das 08:00 às 18:00. Reserve seu horário com antecedência.</p>
          </Card>

          <Card className="hover:-translate-y-2 transition-transform cursor-default group">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Scissors size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Expertise</h3>
            <p className="text-lg text-slate-500">Corte, coloração e tratamentos capilares com excelência.</p>
          </Card>
        </div>
      </div>

      <footer className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 font-medium">
        <p>© 2024 {SALON_NAME}.</p>
        <button onClick={() => navigate('/admin/login')} className="hover:text-indigo-950 transition-colors">
          Administração
        </button>
      </footer>
    </div>
  );
}

// --- Booking Flow ---

function BookingPage({ navigate, onComplete, appointments }: any) {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    category: null as ServiceCategory | null,
    option: null as ServiceOption | null,
    length: '' as string,
    date: '',
    time: '',
    name: '',
    phone: ''
  });
  const [confirmed, setConfirmed] = useState(false);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 1) dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const getServiceDuration = () => {
    return selection.option?.durationMinutes || selection.category?.durationMinutes || 60;
  };

  const checkAvailability = (date: string, time: string) => {
    const startMin = timeToMinutes(time);
    const duration = getServiceDuration();
    const endMin = startMin + duration;

    // 1. Checar se ultrapassa o fechamento
    if (endMin > CLOSING_TIME) return { available: false, reason: 'Ultrapassa o horário de fechamento (18:00)' };

    // 2. Checar se invade o almoço (Inicia antes das 11 e termina após as 11)
    if (startMin < LUNCH_START && endMin > LUNCH_START) return { available: false, reason: 'Conflita com horário de almoço (11h-13h)' };

    // 3. Checar conflito com outros agendamentos
    const conflict = appointments.find((a: Appointment) => {
      if (a.date !== date || a.status === 'cancelled') return false;
      const appStart = timeToMinutes(a.time);
      const appEnd = appStart + a.durationMinutes;
      const blockedUntil = Math.ceil(appEnd / 30) * 30;
      
      return (startMin >= appStart && startMin < blockedUntil) || (endMin > appStart && endMin <= blockedUntil);
    });

    if (conflict) return { available: false, reason: 'Horário já ocupado' };

    return { available: true };
  };

  const handleFinish = async () => {
    const app: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: selection.category!.id,
      serviceName: selection.category?.name || '',
      subOptionName: selection.option?.name,
      hairLength: selection.length,
      date: selection.date,
      time: selection.time,
      durationMinutes: getServiceDuration(),
      clientName: selection.name,
      clientPhone: selection.phone,
      status: 'pending',
      createdAt: Date.now()
    };

    const { error } = await supabase.from('agendamentos').insert({
      id: app.id,
      service_id: app.serviceId,
      service_name: app.serviceName,
      sub_option_name: app.subOptionName ?? null,
      hair_length: app.hairLength ?? null,
      date: app.date,
      time: app.time,
      duration_minutes: app.durationMinutes,
      client_name: app.clientName,
      client_phone: app.clientPhone,
      status: app.status,
      created_at: app.createdAt,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      // Ainda mostra confirmação pro cliente — não bloqueia o fluxo
    }

    onComplete(app);
    setConfirmed(true);
  };

  const handleCategoryClick = (cat: ServiceCategory) => {
    if (selection.category?.id === cat.id) {
      setSelection({...selection, category: null, option: null, length: ''});
    } else {
      setSelection({...selection, category: cat, option: null, length: ''});
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 ring-8 ring-emerald-50/50">
          <CheckCircle size={80} />
        </div>
        <h2 className="text-5xl font-serif font-black text-indigo-950 mb-6">Solicitado!</h2>
        <p className="text-2xl text-slate-500 mb-10 leading-relaxed">
          <strong>{selection.name}</strong>, seu agendamento foi enviado para avaliação de <strong>Leci Medeiros</strong>.
        </p>
        <Card className="mb-6 text-left bg-indigo-50/30 border-indigo-100">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-xl">
              <Calendar className="text-indigo-950" />
              <span className="font-bold">{getDayName(selection.date)}, {formatDisplayDate(selection.date)}</span>
            </div>
            <div className="flex items-center gap-4 text-xl">
              <Clock className="text-indigo-950" />
              <span className="font-bold">Às {selection.time}</span>
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Button variant="whatsapp" className="py-6 text-2xl" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Olá%20Leci,%20sou%20${selection.name}.%20Agendei%20${selection.category?.name}%20pelo%20site.%20Pode%20confirmar?`, "_blank")}>
            Confirmar no WhatsApp
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
      <div className="flex items-center justify-between mb-16">
        <button onClick={() => { if (step > 1) setStep(step - 1); else navigate('/'); }} className="p-4 bg-white rounded-2xl shadow-md text-indigo-950 hover:bg-indigo-50 transition-all active:scale-90">
          <ChevronLeft size={32} />
        </button>
        <div className="text-right">
          <div className="text-slate-400 font-bold tracking-widest text-sm uppercase mb-1">Etapa {step} de 4</div>
          <div className="flex gap-2 justify-end">
            {[1,2,3,4].map(s => <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-rose-500' : 'bg-slate-200'}`} />)}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in slide-in-from-right-10 fade-in duration-500">
          <h2 className="text-5xl font-serif font-black text-indigo-950 mb-6">O que vamos fazer?</h2>
          <div className="grid gap-6 mb-12">
            {SERVICES.map(cat => (
              <div key={cat.id}>
                <button onClick={() => handleCategoryClick(cat)} className={`w-full flex items-center justify-between p-8 rounded-[2.5rem] border-4 transition-all text-left group ${selection.category?.id === cat.id ? 'bg-indigo-950 text-white border-indigo-950 shadow-2xl scale-[1.02]' : 'bg-white text-slate-900 border-white hover:border-indigo-100 shadow-xl'}`}>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black">{cat.name}</h3>
                    <div className="flex items-center gap-4 text-lg"><span className="font-bold text-rose-500">{cat.displayPrice}</span></div>
                  </div>
                  <ChevronRight size={28} />
                </button>
                {selection.category?.id === cat.id && cat.options && (
                  <div className="mt-4 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-indigo-100 grid gap-4">
                    {cat.options.map(opt => (
                      <button key={opt.id} onClick={() => setSelection({...selection, option: opt})} className={`p-6 rounded-2xl border-4 text-left transition-all flex justify-between items-center ${selection.option?.id === opt.id ? 'bg-white border-rose-500 shadow-md scale-[1.02]' : 'bg-white border-transparent hover:border-indigo-200'}`}>
                        <div><div className="text-xl font-bold text-indigo-950">{opt.name}</div><div className="text-slate-500 font-bold">{opt.price}</div></div>
                        {selection.option?.id === opt.id && <CheckCircle className="text-rose-500" size={32} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {(selection.category && (!selection.category.options || selection.option)) && (
            <button onClick={() => setStep(2)} className="fixed bottom-8 right-8 z-50 bg-indigo-950 text-white p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in zoom-in-75 ring-8 ring-white"><ChevronRight size={48} /></button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-right-10 fade-in duration-500">
          <h2 className="text-5xl font-serif font-black text-indigo-950 mb-12">Quando você vem?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {availableDates.map(date => (
              <button key={date} onClick={() => setSelection({...selection, date, time: ''})} className={`p-6 rounded-[2rem] border-4 text-center transition-all flex flex-col items-center justify-center gap-1 ${selection.date === date ? 'bg-indigo-950 text-white border-indigo-950 shadow-2xl scale-105' : 'bg-white border-white shadow-xl hover:border-indigo-100'}`}>
                <span className={`text-sm font-black uppercase tracking-widest ${selection.date === date ? 'text-indigo-200' : 'text-slate-400'}`}>{getDayName(date)}</span>
                <span className="text-3xl font-black">{formatDisplayDate(date)}</span>
              </button>
            ))}
          </div>
          {selection.date && <button onClick={() => setStep(3)} className="fixed bottom-8 right-8 z-50 bg-indigo-950 text-white p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in zoom-in-75 ring-8 ring-white"><ChevronRight size={48} /></button>}
        </div>
      )}

      {step === 3 && (
        <div className="animate-in slide-in-from-right-10 fade-in duration-500">
          <h2 className="text-5xl font-serif font-black text-indigo-950 mb-4">Escolha o horário</h2>
          <p className="text-2xl text-slate-400 mb-6">Para o dia {formatDisplayDate(selection.date)}</p>
          
          <div className="flex items-center gap-6 mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <Coffee className="text-amber-600" size={32} />
            <p className="text-lg text-amber-900 font-bold">Horário de almoço das 11:00 às 13:00</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {BUSINESS_HOURS.map(time => {
              const { available, reason } = checkAvailability(selection.date, time);
              return (
                <button 
                  key={time} 
                  disabled={!available} 
                  onClick={() => setSelection({...selection, time})} 
                  title={reason}
                  className={`relative p-6 rounded-[2rem] border-4 text-2xl font-black transition-all shadow-xl ${!available ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed' : selection.time === time ? 'bg-indigo-950 text-white border-indigo-950 scale-105' : 'bg-white border-white hover:border-indigo-100 text-indigo-950'}`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          {selection.time && <button onClick={() => setStep(4)} className="fixed bottom-8 right-8 z-50 bg-indigo-950 text-white p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in zoom-in-75 ring-8 ring-white"><ChevronRight size={48} /></button>}
        </div>
      )}

      {step === 4 && (
        <div className="animate-in slide-in-from-right-10 fade-in duration-500">
          <h2 className="text-5xl font-serif font-black text-indigo-950 mb-12">Como te chamamos?</h2>
          <div className="grid gap-8">
            <div className="space-y-4">
              <label className="text-2xl font-black text-indigo-950 block">Seu Nome</label>
              <input type="text" placeholder="Ex: Maria Alice" className="w-full p-8 rounded-[2rem] border-4 border-white shadow-2xl focus:border-indigo-950 outline-none text-2xl font-bold transition-all" value={selection.name} onChange={e => setSelection({...selection, name: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-2xl font-black text-indigo-950 block">Seu WhatsApp</label>
              <input type="tel" placeholder="(00) 00000-0000" className="w-full p-8 rounded-[2rem] border-4 border-white shadow-2xl focus:border-indigo-950 outline-none text-2xl font-bold transition-all" value={selection.phone} onChange={e => setSelection({...selection, phone: maskPhone(e.target.value)})} />
            </div>
            <Button className="w-full py-8 text-3xl" disabled={!selection.name || selection.phone.length < 10} onClick={handleFinish}>Confirmar Agendamento</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Admin Views ---

function AdminLogin({ onLogin, onBack }: any) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="max-w-md mx-auto px-6 py-24 flex flex-col items-center animate-in zoom-in-95">
      <div className="w-24 h-24 bg-indigo-950 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl rotate-6"><User size={48} /></div>
      <h2 className="text-4xl font-serif font-black text-indigo-950 mb-12">Painel da Leci</h2>
      <Card className="w-full">
        <form onSubmit={e => { e.preventDefault(); if (pass.toLowerCase() === 'admin') onLogin(); else setErr(true); }} className="space-y-6">
          <input type="password" autoFocus className="w-full p-6 bg-slate-50 rounded-2xl outline-none text-2xl font-bold" value={pass} onChange={e => { setPass(e.target.value); setErr(false); }} placeholder="Senha" />
          {err && <p className="text-rose-500 font-bold">Senha incorreta</p>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </Card>
      <button onClick={onBack} className="mt-12 text-slate-400 font-bold hover:text-indigo-950">Voltar ao site</button>
    </div>
  );
}

function AdminPanel({ appointments, onUpdate, onLogout }: any) {
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  const isAppointmentSoon = (a: Appointment) => {
    const todayStr = now.toISOString().split('T')[0];
    if (a.date !== todayStr || a.status === 'cancelled') return false;
    const appMin = timeToMinutes(a.time);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const diff = appMin - nowMin;
    return diff >= -15 && diff <= 60; 
  };

  const sendReminder = (a: Appointment) => {
    const msg = `Olá%20${a.clientName},%20passando%20para%20lembrar%20do%20seu%20horário%20hoje%20às%20${a.time}%20no%20Salão%20da%20Leci!%20Te%20vejo%20em%20breve.`;
    window.open(`https://wa.me/${a.clientPhone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const groupedAppointments = useMemo(() => {
    const todayStr = now.toISOString().split('T')[0];
    const tomDate = new Date(now); tomDate.setDate(now.getDate() + 1);
    const tomStr = tomDate.toISOString().split('T')[0];
    const res = { hoje: [] as Appointment[], amanha: [] as Appointment[], outros: [] as Appointment[] };
    appointments.forEach((a: Appointment) => {
      if (a.date === todayStr) res.hoje.push(a);
      else if (a.date === tomStr) res.amanha.push(a);
      else res.outros.push(a);
    });
    Object.keys(res).forEach(k => (res as any)[k].sort((a: any, b: any) => a.time.localeCompare(b.time)));
    return res;
  }, [appointments, now]);

  const AppointmentItem = ({ a }: any) => {
    const soon = isAppointmentSoon(a);
    return (
      <Card className={`flex flex-col lg:flex-row items-center justify-between gap-6 border-l-[1rem] hover:scale-[1.01] transition-all mb-4 ${soon ? 'ring-4 ring-rose-500/20 shadow-rose-100' : ''} ${a.status === 'confirmed' ? 'border-emerald-500' : a.status === 'cancelled' ? 'border-rose-400 opacity-60' : 'border-amber-400'}`}>
        <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
          <div className="bg-slate-50 p-4 rounded-2xl min-w-[120px] text-center">
            <div className="text-4xl font-black text-indigo-950">{a.time}</div>
            <div className="text-sm font-bold text-slate-400">{formatDisplayDate(a.date)}</div>
          </div>
          <div className="space-y-1 md:text-left text-center">
            <h3 className="text-3xl font-serif font-black text-indigo-950">{a.clientName}</h3>
            <p className="text-xl text-rose-500 font-bold">{a.serviceName}</p>
            <p className="text-lg text-slate-400 flex items-center justify-center md:justify-start gap-2"><Phone size={16} /> {a.clientPhone}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {a.status === 'pending' && <button onClick={() => onUpdate({...a, status: 'confirmed'})} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"><Check size={24} /></button>}
          <button onClick={() => setEditing(a)} className="p-4 bg-indigo-50 text-indigo-950 rounded-2xl hover:bg-indigo-950 hover:text-white transition-all"><Edit2 size={24} /></button>
          <button onClick={() => sendReminder(a)} className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all" title="Lembrar Cliente"><Bell size={24} /></button>
          {a.status !== 'cancelled' && <button onClick={() => onUpdate({...a, status: 'cancelled'})} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X size={24} /></button>}
        </div>
      </Card>
    );
  };

  const GroupSection = ({ title, list, icon: Icon }: any) => list.length > 0 && (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6 border-b-4 border-slate-50 pb-4">
        <Icon size={24} className="text-indigo-950" />
        <h2 className="text-3xl font-serif font-black text-indigo-950">{title}</h2>
      </div>
      {list.map((a: any) => <AppointmentItem key={a.id} a={a} />)}
    </div>
  );

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-950 text-white rounded-2xl flex items-center justify-center shadow-xl rotate-3"><LayoutDashboard size={32} /></div>
          <h1 className="text-4xl font-serif font-black text-indigo-950">Painel da Leci</h1>
        </div>
        <button onClick={onLogout} className="p-4 bg-white text-slate-300 hover:text-rose-500 rounded-2xl shadow-xl transition-all"><LogOut size={28} /></button>
      </header>
      {appointments.length === 0 ? (
        <Card className="text-center py-24 bg-slate-50/50 border-dashed border-slate-200"><Calendar size={80} className="text-slate-200 mx-auto mb-6" /><p className="text-2xl font-black text-slate-400">Sem agendamentos.</p></Card>
      ) : (
        <>
          <GroupSection title="Hoje" list={groupedAppointments.hoje} icon={AlarmClock} />
          <GroupSection title="Amanhã" list={groupedAppointments.amanha} icon={Calendar} />
          <GroupSection title="Outros dias" list={groupedAppointments.outros} icon={CalendarDays} />
        </>
      )}
      {editing && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in">
          <Card className="w-full max-w-lg">
            <h2 className="text-3xl font-serif font-black mb-8">Reagendar</h2>
            <div className="space-y-6">
              <input type="date" className="w-full p-4 bg-slate-50 rounded-xl text-xl font-bold" value={editing.date} onChange={e => setEditing({...editing, date: e.target.value})} />
              <select className="w-full p-4 bg-slate-50 rounded-xl text-xl font-bold" value={editing.time} onChange={e => setEditing({...editing, time: e.target.value})}>{BUSINESS_HOURS.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <div className="flex gap-4 pt-4"><Button className="flex-1" onClick={() => { onUpdate(editing); setEditing(null); }}>Salvar</Button><Button variant="ghost" className="flex-1" onClick={() => setEditing(null)}>Sair</Button></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);