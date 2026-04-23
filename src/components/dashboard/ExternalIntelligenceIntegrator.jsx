import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, RefreshCw, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SOURCE_TYPES = [
  { type: 'slack', label: 'Slack', icon: '💬', connectorName: 'Slack' },
  { type: 'notion', label: 'Notion', icon: '📄', connectorName: 'Notion' },
  { type: 'trello', label: 'Trello', icon: '📋', connectorName: 'Trello' },
  { type: 'hubspot', label: 'HubSpot', icon: '📊', connectorName: 'Hubspot' },
];

export default function ExternalIntelligenceIntegrator() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newSource, setNewSource] = useState({
    source_type: 'slack',
    source_name: '',
    config: {},
  });

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const user = await base44.auth.me();
      const allSources = await base44.entities.ExternalDataSource.filter({
        user_email: user.email,
      });
      setSources(allSources);
    } catch (error) {
      console.error('Failed to load sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSource = async () => {
    if (!newSource.source_name) {
      alert('Please enter a source name');
      return;
    }

    setCreating(true);
    try {
      // Get connector info
      const sourceConfig = SOURCE_TYPES.find(s => s.type === newSource.source_type);
      
      // In real implementation, would open OAuth flow via the registered connector
      // For now, create with placeholder
      const user = await base44.auth.me();
      
      const source = await base44.entities.ExternalDataSource.create({
        user_email: user.email,
        source_type: newSource.source_type,
        source_name: newSource.source_name,
        connector_id: 'placeholder', // Would be set by OAuth flow
        config: JSON.stringify(newSource.config),
        sync_enabled: true,
      });

      setSources(prev => [...prev, source]);
      setNewSource({ source_type: 'slack', source_name: '', config: {} });
      setShowForm(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const syncSource = async (sourceId) => {
    setSyncing(sourceId);
    try {
      const response = await base44.functions.invoke('externalIntelligenceSync', {
        dataSourceId: sourceId,
      });

      alert(`✓ Synced ${response.data.signals_created} intelligence signals from ${response.data.source_type}`);
      
      // Reload sources to update last_sync
      await loadSources();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSyncing(null);
    }
  };

  const deleteSource = async (sourceId) => {
    if (!confirm('Delete this data source connection?')) return;

    try {
      await base44.entities.ExternalDataSource.delete(sourceId);
      setSources(prev => prev.filter(s => s.id !== sourceId));
    } catch (error) {
      alert(`Error: ${error.message}`);
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
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-medium text-foreground">External Intelligence Integrator</h3>
              <p className="text-xs text-muted-foreground">Connect data sources to auto-sync intelligence signals</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-lg">
              <Plus className="w-4 h-4" />
              Add Source
            </Button>
          )}
        </div>
      </div>

      {/* New Source Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h4 className="font-bold text-accent mb-4">Connect Data Source</h4>

          <div className="space-y-4">
            {/* Source Type */}
            <div>
              <label className="text-xs font-bold text-accent mb-2 block">Data Source Type</label>
              <div className="grid grid-cols-2 gap-2">
                {SOURCE_TYPES.map(sourceType => (
                  <button
                    key={sourceType.type}
                    onClick={() => setNewSource(prev => ({ ...prev, source_type: sourceType.type }))}
                    className={`p-3 rounded-lg border-2 transition ${
                      newSource.source_type === sourceType.type
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    <span className="text-2xl">{sourceType.icon}</span>
                    <p className="text-xs font-medium mt-1">{sourceType.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Name */}
            <div>
              <label className="text-xs font-bold text-accent mb-2 block">Connection Name</label>
              <input
                type="text"
                value={newSource.source_name}
                onChange={(e) => setNewSource(prev => ({ ...prev, source_name: e.target.value }))}
                placeholder="e.g., Marketing Slack"
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={connectSource}
                disabled={creating}
                className="flex-1 btn-ivory rounded-lg"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Connect Source
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Sources */}
      <div className="space-y-3">
        {sources.map(source => (
          <div key={source.id} className="glass-card rounded-2xl p-5 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-foreground">{source.source_name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {source.source_type.charAt(0).toUpperCase() + source.source_type.slice(1)} • {source.items_synced || 0} items
                </p>
                {source.last_sync && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Last sync: {new Date(source.last_sync).toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                onClick={() => deleteSource(source.id)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => syncSource(source.id)}
              disabled={syncing === source.id}
              className="btn-ivory rounded-lg w-full"
            >
              {syncing === source.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {sources.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-12 border border-border text-center">
          <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No data sources connected yet</p>
          <Button onClick={() => setShowForm(true)} className="btn-ivory rounded-lg">
            <Plus className="w-4 h-4" />
            Connect Your First Source
          </Button>
        </div>
      )}
    </div>
  );
}