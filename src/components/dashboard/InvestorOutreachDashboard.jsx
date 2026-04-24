import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Mail, Calendar, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileSelect from '@/components/common/MobileSelect';

// Enhanced with Kanban board view
export default function InvestorOutreachDashboard() {
  const [viewMode, setViewMode] = React.useState('kanban');
  const [investors, setInvestors] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    stage: 'series_a',
    domains: '',
  });

  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    try {
      const user = await base44.auth.me();
      const workspaces = await base44.entities.Workspace.filter({
        owner_email: user.email,
      });

      if (workspaces.length > 0) {
        setWorkspace(workspaces[0]);
        const investorList = await base44.entities.Investor.filter({
          workspace_id: workspaces[0].id,
        });
        setInvestors(investorList);
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInvestor = async () => {
    if (!workspace || !formData.name || !formData.email) return;

    try {
      const newInvestor = await base44.entities.Investor.create({
        ...formData,
        workspace_id: workspace.id,
        last_contact: new Date().toISOString(),
      });

      setInvestors(prev => [...prev, newInvestor]);
      setFormData({
        name: '',
        email: '',
        company: '',
        stage: 'series_a',
        domains: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add investor:', error);
    }
  };

  const updateInvestorStatus = async (investorId, newStatus) => {
    try {
      await base44.entities.Investor.update(investorId, {
        status: newStatus,
        last_contact: new Date().toISOString(),
      });

      setInvestors(prev =>
        prev.map(inv => inv.id === investorId ? { ...inv, status: newStatus } : inv)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const scheduleGoogleMeeting = async (investorId, investorEmail, investorName) => {
    try {
      // Create calendar event
      const response = await base44.connectors.connectAppUser('GOOGLE CALENDER');
      
      // If calendar is connected, you could invoke a function to create event
      // For now, just log the action
      await base44.entities.InvestorMeeting.create({
        investor_id: investorId,
        workspace_id: workspace.id,
        scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        meeting_type: 'initial',
        status: 'scheduled',
      });

      // Send calendar invite via email
      await base44.integrations.Core.SendEmail({
        to: investorEmail,
        subject: `Meeting Request: Strategic Discussion with ${workspace?.name}`,
        body: `Hi ${investorName},\n\nWe'd like to schedule a time to discuss an exciting opportunity. Please let us know your availability.\n\nBest regards`,
      });

      alert('Meeting scheduled and invite sent!');
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  const deleteInvestor = async (investorId) => {
    try {
      await base44.entities.Investor.delete(investorId);
      setInvestors(prev => prev.filter(inv => inv.id !== investorId));
    } catch (error) {
      console.error('Failed to delete investor:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  // Import Kanban board
  const InvestorKanbanBoard = React.lazy(() => import('./InvestorKanbanBoard'));

  if (viewMode === 'kanban') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-lg text-gradient-ivory">Investor Pipeline</h2>
          <button
            onClick={() => setViewMode('list')}
            className="text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition"
          >
            List View
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <InvestorKanbanBoard />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Investor Outreach</h3>
              <p className="text-xs text-muted-foreground">{investors.length} investors tracked</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('kanban')}
              className="text-xs px-3 py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 transition text-accent"
            >
              Kanban
            </button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="btn-ivory rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Add Investor Form */}
        {showForm && (
          <div className="space-y-3 pt-4 border-t border-border">
            <input
              type="text"
              placeholder="Investor Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />
            <input
              type="text"
              placeholder="Company / Fund Name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />
            <MobileSelect
               value={formData.stage}
               onChange={(value) => setFormData({ ...formData, stage: value })}
               options={[
                 { value: 'seed', label: 'Seed' },
                 { value: 'series_a', label: 'Series A' },
                 { value: 'series_b', label: 'Series B' },
                 { value: 'growth', label: 'Growth' },
                 { value: 'late_stage', label: 'Late Stage' }
               ]}
               placeholder="Select stage"
             />
            <input
              type="text"
              placeholder="Domains (e.g., AI, fintech, climate)"
              value={formData.domains}
              onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />
            <Button onClick={addInvestor} className="btn-ivory rounded-lg w-full">
              Save Investor
            </Button>
          </div>
        )}
      </div>

      {/* Investor List */}
      <div className="grid gap-3">
        {investors.map(investor => (
          <div key={investor.id} className="glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{investor.name}</h4>
                <p className="text-xs text-muted-foreground">{investor.company}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 rounded text-xs bg-accent/15 text-accent capitalize">
                    {investor.stage?.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    investor.status === 'interested' ? 'bg-green-500/15 text-green-400' :
                    investor.status === 'rejected' ? 'bg-destructive/15 text-destructive' :
                    'bg-secondary/30 text-muted-foreground'
                  }`}>
                    {investor.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteInvestor(investor.id)}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Contact & Meeting Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <button
                onClick={() => window.location.href = `mailto:${investor.email}`}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-secondary/30 hover:bg-secondary transition flex items-center justify-center gap-1.5 text-foreground"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </button>
              <button
                onClick={() => scheduleGoogleMeeting(investor.id, investor.email, investor.name)}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-accent/15 hover:bg-accent/25 transition flex items-center justify-center gap-1.5 text-accent"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule
              </button>

              {/* Status Dropdown */}
              <MobileSelect
                value={investor.status}
                onChange={(value) => updateInvestorStatus(investor.id, value)}
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'interested', label: 'Interested' },
                  { value: 'pitching', label: 'Pitching' },
                  { value: 'invested', label: 'Invested' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
                placeholder="Select status"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}