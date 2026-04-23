import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfToday, getDay } from 'date-fns';
import { base44 } from '@/api/base44Client';
import SectionBadge from '../shared/SectionBadge';

const SERVICE_NAMES = [
  'AI Strategic Advisory',
  'Advanced UI / UX Systems',
  'Intelligence & Data Gathering',
  'Predictive & Simulated Strategy',
  'AI-Driven Marketing',
  'AI System Architecture',
];

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

export default function BookingFlow() {
  const [step, setStep] = useState(0); // 0=service 1=datetime 2=details 3=done
  const [selectedService, setSelectedService] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const today = startOfToday();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart); // 0=Sun

  const submit = async () => {
    setSubmitting(true);
    await base44.entities.Booking.create({
      name: form.name,
      email: form.email,
      service: selectedService,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedSlot,
      notes: form.notes,
      status: 'pending',
    });
    setStep(3);
    setSubmitting(false);
  };

  return (
    <section className="py-28 border-t border-border/60">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <SectionBadge icon={CalendarDays}>Scheduling</SectionBadge>
          <h2 className="font-display text-4xl md:text-5xl mt-6 leading-[1.05] text-gradient-ivory">
            Book a briefing.<br />
            <span className="italic">Start the work.</span>
          </h2>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {['Service', 'Date & Time', 'Details'].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 text-xs ${step >= i ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all ${step > i ? 'bg-accent border-accent text-accent-foreground' : step === i ? 'border-accent text-accent' : 'border-border'}`}>
                  {step > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`h-px flex-1 max-w-[60px] transition-all ${step > i ? 'bg-accent' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card/50 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 0 — choose service */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-10">
                <h3 className="font-display text-2xl mb-6">Which service interests you?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SERVICE_NAMES.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelectedService(s); setStep(1); }}
                      className={`text-left px-5 py-4 rounded-2xl border text-sm transition-all hover:border-accent/60 hover:bg-secondary/60 ${selectedService === s ? 'border-accent bg-secondary' : 'border-border bg-secondary/30'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1 — pick date + time */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(0)} className="text-muted-foreground hover:text-foreground transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-display text-2xl">Pick a date & time</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg border border-border hover:bg-secondary transition">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
                      <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg border border-border hover:bg-secondary transition">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array(startOffset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                      {days.map(day => {
                        const past = isBefore(day, today);
                        const weekend = [0, 6].includes(getDay(day));
                        const sel = selectedDate && isSameDay(day, selectedDate);
                        const disabled = past || weekend;
                        return (
                          <button
                            key={day.toISOString()}
                            disabled={disabled}
                            onClick={() => setSelectedDate(day)}
                            className={`aspect-square text-sm rounded-xl transition-all ${disabled ? 'text-muted-foreground/30 cursor-not-allowed' : sel ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-secondary hover:text-foreground text-foreground/80'}`}
                          >
                            {format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Available slots (ET)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          disabled={!selectedDate}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 text-sm rounded-xl border transition-all ${!selectedDate ? 'opacity-30 cursor-not-allowed border-border' : selectedSlot === slot ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/50 hover:bg-secondary'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedDate || !selectedSlot}
                    onClick={() => setStep(2)}
                    className="btn-ivory rounded-full px-7 py-3 text-sm font-medium disabled:opacity-40 hover:opacity-90 transition"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — contact details */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-display text-2xl">Your details</h3>
                </div>

                {/* Summary */}
                <div className="flex flex-wrap gap-3 mb-7">
                  <span className="px-4 py-2 rounded-full bg-secondary border border-border text-xs">{selectedService}</span>
                  <span className="px-4 py-2 rounded-full bg-secondary border border-border text-xs">{selectedDate && format(selectedDate, 'EEE, MMM d yyyy')}</span>
                  <span className="px-4 py-2 rounded-full bg-secondary border border-border text-xs">{selectedSlot}</span>
                </div>

                <div className="space-y-4">
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name *"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-accent transition"
                  />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email address *"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-accent transition"
                  />
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Anything we should know beforehand? (optional)"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-accent transition resize-none"
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!form.name || !form.email || submitting}
                    onClick={submit}
                    className="btn-ivory rounded-full px-7 py-3 text-sm font-medium disabled:opacity-40 hover:opacity-90 transition inline-flex items-center gap-2"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</> : 'Confirm Booking →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — confirmation */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-3xl text-gradient-ivory mb-3">Booking confirmed.</h3>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  We've received your request for <strong className="text-foreground">{selectedService}</strong> on{' '}
                  <strong className="text-foreground">{selectedDate && format(selectedDate, 'MMMM d')} at {selectedSlot}</strong>. Confirmation details will be emailed to <strong className="text-foreground">{form.email}</strong>.
                </p>
                <button
                  onClick={() => { setStep(0); setSelectedDate(null); setSelectedSlot(''); setSelectedService(''); setForm({ name: '', email: '', notes: '' }); }}
                  className="mt-8 text-sm text-muted-foreground hover:text-accent transition underline underline-offset-4"
                >
                  Book another session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}