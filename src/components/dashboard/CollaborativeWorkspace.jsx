import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Share2, MessageSquare, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CollaborativeWorkspace() {
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});

  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    try {
      const user = await base44.auth.me();
      
      // Create or fetch workspace
      const existingWorkspaces = await base44.entities.Workspace.filter({
        owner_email: user.email,
      });

      let ws = existingWorkspaces[0];
      if (!ws) {
        ws = await base44.entities.Workspace.create({
          name: `${user.full_name}'s Team Workspace`,
          owner_email: user.email,
          description: 'Collaborative AI strategy workspace',
        });
      }

      setWorkspace(ws);

      // Fetch workspace members
      const wsMembers = await base44.entities.WorkspaceMember.filter({
        workspace_id: ws.id,
      });
      setMembers(wsMembers);

      // Fetch comments on recent intelligence
      const intelligence = await base44.entities.StrategicIntelligence.list();
      const commentsData = {};
      for (const intel of intelligence.slice(0, 10)) {
        const intel_comments = await base44.entities.InsightComment.filter({
          intelligence_id: intel.id,
        });
        commentsData[intel.id] = intel_comments;
      }
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail || !workspace) return;

    try {
      await base44.entities.WorkspaceMember.create({
        workspace_id: workspace.id,
        user_email: inviteEmail,
        role: 'editor',
        joined_date: new Date().toISOString(),
      });

      setInviteEmail('');
      setMembers(prev => [...prev, { user_email: inviteEmail, role: 'editor' }]);

      // Send invitation email
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `You've been invited to join ${workspace.name}`,
        body: `You've been invited to collaborate on this strategic AI workspace. Log in to view shared insights and co-manage projects.`,
      });
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const removeMember = async (email) => {
    try {
      const memberToRemove = members.find(m => m.user_email === email);
      if (memberToRemove) {
        await base44.entities.WorkspaceMember.delete(memberToRemove.id);
        setMembers(prev => prev.filter(m => m.user_email !== email));
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Workspace Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{workspace?.name}</h3>
              <p className="text-xs text-muted-foreground">{members.length} members</p>
            </div>
          </div>
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Invite Members */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Invite Team Members</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />
            <Button
              onClick={inviteMember}
              disabled={!inviteEmail}
              className="btn-ivory rounded-lg"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <h4 className="text-sm font-medium mb-4">Active Members</h4>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.user_email} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30 border border-border">
              <div>
                <p className="text-sm text-foreground">{member.user_email}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
              </div>
              <button
                onClick={() => removeMember(member.user_email)}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Comments on Shared Insights */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-medium">Team Comments on Insights</h4>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(comments).flatMap(([intelId, comms]) =>
            comms.map((comment, idx) => (
              <div key={`${intelId}-${idx}`} className="px-3 py-2.5 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{comment.user_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.comment_date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-foreground">{comment.comment_text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}