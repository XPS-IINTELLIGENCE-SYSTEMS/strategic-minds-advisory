import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeploymentPanel() {
  const [stressTests, setStressTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(null);
  const [deployments, setDeployments] = useState({});

  useEffect(() => {
    loadStressTests();
  }, []);

  const loadStressTests = async () => {
    try {
      const tests = await base44.entities.StressTestResult.filter({
        survived: false, // Focus on tests where pivots are needed
      });
      setStressTests(tests);
    } catch (error) {
      console.error('Failed to load stress tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const deployToGoogleTasks = async (testId) => {
    setDeploying(testId);
    try {
      const response = await base44.functions.invoke('deployPivotsToTasks', {
        stressTestResultId: testId,
      });

      setDeployments(prev => ({
        ...prev,
        [testId]: {
          success: true,
          task_count: response.data.tasks_created,
          google_tasks_list_id: response.data.google_tasks_list_id,
        },
      }));

      alert(`✓ ${response.data.tasks_created} tasks deployed to Google Tasks`);
    } catch (error) {
      setDeployments(prev => ({
        ...prev,
        [testId]: { success: false, error: error.message },
      }));
      alert(`✗ Deployment failed: ${error.message}`);
    } finally {
      setDeploying(null);
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
          <div>
            <h3 className="font-medium text-foreground">Deploy Pivot Strategies</h3>
            <p className="text-xs text-muted-foreground mt-1">Convert stress test pivots into actionable Google Tasks</p>
          </div>
        </div>
      </div>

      {/* Deployments List */}
      <div className="grid gap-3">
        {stressTests.map(test => {
          const deployment = deployments[test.id];
          const isDeployed = deployment?.success;

          return (
            <div key={test.id} className="glass-card rounded-2xl p-5 border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{test.scenario_name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{test.verdict}</p>
                </div>

                {isDeployed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold">Deployed</span>
                  </div>
                ) : deployment?.success === false ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-xs font-bold">Failed</span>
                  </div>
                ) : null}
              </div>

              {/* Recommendations */}
              {test.recommendations && (
                <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-xs font-bold text-accent mb-1">Pivot Strategies</p>
                  <p className="text-xs text-foreground/80 line-clamp-2">{test.recommendations.substring(0, 200)}</p>
                </div>
              )}

              {/* Deployment Status */}
              {isDeployed && (
                <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400">
                    ✓ {deployment.task_count} tasks created in Google Tasks
                  </p>
                </div>
              )}

              {/* Deploy Button */}
              {!isDeployed && (
                <Button
                  onClick={() => deployToGoogleTasks(test.id)}
                  disabled={deploying === test.id}
                  className="btn-ivory rounded-lg w-full"
                >
                  {deploying === test.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Deploy to Google Tasks
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}