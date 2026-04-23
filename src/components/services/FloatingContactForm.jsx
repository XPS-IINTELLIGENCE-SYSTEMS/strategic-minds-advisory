import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FloatingContactForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    await base44.functions.invoke('sendContactEmail', form);
    setStatus('sent');
    setTimeout(() => { setStatus('idle'); setForm({ name: '', email: '', message: '' }); setOpen(false); }, 2500);
  };

  return (
    <>
      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 btn-ivory w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        aria-label="Open contact form"
      >
        <MessageSquare className="w-5 h-5" />
      </motion.button>

      {/* Overlay + panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed bottom-8 right-8 z-50 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-border">
                <div>
                  <h3 className="font-display text-xl">Say hello</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">We reply within one business day.</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-7">
                {status === 'sent' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6 text-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-accent" />
                    <p className="font-display text-xl text-gradient-ivory">Message received.</p>
                    <p className="text-sm text-muted-foreground">An advisor will be in touch shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <input
                      required
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
                    />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
                    />
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="What are you working on?"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
                    />
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="btn-ivory rounded-full w-full py-3 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                    >
                      {status === 'sending'
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}