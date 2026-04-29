import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { nativeData } from '@/lib/nativeDataClient';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        await nativeData.entity('UserDeletionRequest').create({
          user_id: user.id,
          email: user.email,
          status: 'requested',
          source: 'account_settings',
        });
      }
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to submit account deletion request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border-t border-border">
      <h3 className="font-medium text-foreground mb-4">Account Settings</h3>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Delete Account</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Submit an account deletion request and sign out. A system administrator should verify and complete data removal from Supabase.
              </p>
              {!showConfirm ? (
                <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Confirm Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}