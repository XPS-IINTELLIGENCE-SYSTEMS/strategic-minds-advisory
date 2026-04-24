import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  ExternalLink, Loader2, GitBranch, CheckCircle2, Clock, AlertCircle, 
  Code2, Database, Zap, TrendingUp, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [codeOps, setCodeOps] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = async () => {
    setRefreshing(true);
    try {
      // Fetch Vercel projects via backend function
      const vercelRes = await base44.functions.invoke('getVercelProjects', {});
      setProjects(vercelRes.data.projects || []);

      // Fetch recent code operations
      const opsRes = await base44.entities.CodeOperation.list('-timestamp', 20);
      setCodeOps(opsRes);

      // Aggregate metrics
      const projectIndexes = await base44.entities.ProjectIndex.list('-last_indexed', 10);
      setMetrics({
        totalProjects: vercelRes.data.projects?.length || 0,
        totalOperations: opsRes.length,
        indexedProjects: projectIndexes.length,
        lastDeployment: vercelRes.data.lastDeployment || 'N/A',
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'READY') return 'text-green-400 bg-green-400/10 border-green-500/30';
    if (status === 'BUILDING') return 'text-blue-400 bg-blue-400/10 border-blue-500/30';
    if (status === 'ERROR') return 'text-red-400 bg-red-400/10 border-red-500/30';
    return 'text-muted-foreground bg-secondary/40';
  };

  const getStatusIcon = (status) => {
    if (status === 'READY') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (status === 'BUILDING') return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    if (status === 'ERROR') return <AlertCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Project Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Monitor all Vercel projects and deployment status</p>
          </div>
          <button
            onClick={fetchProjects}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition disabled:opacity-40 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Metrics */}
        {!loading && metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', value: metrics.totalProjects, icon: Code2, color: 'text-blue-400' },
              { label: 'Code Operations', value: metrics.totalOperations, icon: Zap, color: 'text-accent' },
              { label: 'Indexed Projects', value: metrics.indexedProjects, icon: Database, color: 'text-green-400' },
              { label: 'Last Deploy', value: metrics.lastDeployment, icon: TrendingUp, color: 'text-purple-400' },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl border border-border bg-card/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{m.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                  </div>
                  <div className="font-display text-2xl text-gradient-accent">{m.value}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Projects Grid */}
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Vercel Projects</div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Code2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No projects found. Link your Vercel account.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border border-border bg-card/50 hover:border-accent/30 transition space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{p.name}</h3>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-accent hover:text-accent/80 transition flex items-center gap-1 mt-1"
                      >
                        {p.url?.replace('https://', '')} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border w-fit ${getStatusColor(p.latest_deployment?.state)}`}>
                    {getStatusIcon(p.latest_deployment?.state)}
                    <span className="capitalize font-medium">{p.latest_deployment?.state || 'Unknown'}</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {p.git_repository && (
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3 h-3" />
                        <span className="truncate">{p.git_repository.repo}</span>
                      </div>
                    )}
                    {p.latest_deployment?.created_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(p.latest_deployment.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-secondary/40 rounded-lg p-2 text-center">
                      <div className="text-muted-foreground">Deployments</div>
                      <div className="font-medium text-accent mt-0.5">{p.latest_deployment?.created_at ? '1+' : '0'}</div>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-2 text-center">
                      <div className="text-muted-foreground">Region</div>
                      <div className="font-medium text-accent mt-0.5">{p.region || 'Default'}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Operations */}
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Recent Code Operations</div>
          <div className="space-y-2">
            {codeOps.slice(0, 5).map((op, i) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                  op.status === 'completed'
                    ? 'border-green-500/30 bg-green-500/5'
                    : op.status === 'failed'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-border bg-secondary/40'
                }`}
              >
                {op.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />}
                {op.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
                {op.status === 'pending' && <Loader2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5 animate-spin" />}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{op.operation_type}: {op.target_path}</div>
                  <div className="text-muted-foreground mt-0.5 line-clamp-1">{op.description}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(op.timestamp).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}