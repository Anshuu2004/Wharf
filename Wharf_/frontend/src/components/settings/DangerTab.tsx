import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Download } from 'lucide-react';
import { Button, Input, useToast } from '../ui';
import api from '../../lib/api';

export const DangerTab = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleExportData = async (format: 'json' | 'zip') => {
    if (format === 'json') setIsExportingJson(true);
    if (format === 'zip') setIsExportingZip(true);

    try {
      const response = await api.get(`/user/export?format=${format}`, {
        responseType: format === 'zip' ? 'blob' : 'json',
      });

      let url: string;
      let blob: Blob;

      if (format === 'zip') {
        blob = response.data;
        url = URL.createObjectURL(blob);
      } else {
        blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
          type: 'application/json',
        });
        url = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = `wharf-data-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Data Exported Successfully As ${format.toUpperCase()}!`, 'success');
    } catch {
      showToast(`Failed To Export Data As ${format.toUpperCase()}`, 'error');
    } finally {
      setIsExportingJson(false);
      setIsExportingZip(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'CLEAR DATA') {
      showToast('Please Type "CLEAR DATA" To Confirm.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete('/user/data');
      showToast('Data Cleared Successfully.', 'info');
      window.location.reload();
    } catch {
      showToast('Failed To Clear Data', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-5 h-5 bg-wharf-error/50 rounded" />
          <div className="h-6 bg-wharf-error/50 rounded w-32" />
        </div>

        {/* Export Data Skeleton */}
        <div className="flex items-center justify-between p-4 border-2 border-wharf-error/50 bg-wharf-surface-secondary rounded-2xl animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-wharf-border-secondary rounded w-32" />
            <div className="h-3 bg-wharf-border-secondary rounded w-64" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-44 bg-wharf-border-secondary rounded-lg" />
            <div className="h-8 w-32 bg-wharf-border-secondary rounded-lg" />
          </div>
        </div>

        {/* Reset Account Skeleton */}
        <div className="flex items-center justify-between p-4 border-2 border-wharf-error/50 bg-wharf-surface-secondary rounded-2xl animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-wharf-border-secondary rounded w-40" />
            <div className="h-3 bg-wharf-border-secondary rounded w-56" />
          </div>
          <div className="h-8 w-28 bg-wharf-border-secondary rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-wharf-error" />
        <h3 className="font-display font-black text-lg tracking-tighter text-wharf-error">
          Danger Zone
        </h3>
      </div>

      {/* Export Data */}
      <div className="flex items-center justify-between p-4 border-2 border-wharf-error/50 hover:border-wharf-error transition-colors rounded-2xl flex-wrap gap-4">
        <div className="min-w-[200px]">
          <p className="font-mono font-bold text-sm">Export All Data</p>
          <p className="font-mono text-xs text-wharf-text-secondary capitalize">
            Download your personal data, chat history, and generated files
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData('json')}
            loading={isExportingJson}
            icon={<Download className="w-4 h-4" />}
            title="Fast, standard data structure format"
          >
            Export JSON (Recommended)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData('zip')}
            loading={isExportingZip}
            icon={<Download className="w-4 h-4" />}
            className="border-wharf-border-secondary"
            title="Contains categorized markdown files"
          >
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Reset Account */}
      <div className="flex items-center justify-between p-4 border-2 border-wharf-error/50 hover:border-wharf-error transition-colors rounded-2xl">
        <div>
          <p className="font-mono font-bold text-sm">Reset Account / Clear Data</p>
          <p className="font-mono text-xs text-wharf-text-secondary capitalize">
            Delete your generated data and reset all stats to 0
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          icon={<Trash2 className="w-4 h-4" />}
        >
          Clear Data
        </Button>
      </div>

      {/* Clear Data Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-6 max-w-sm w-full shadow-brutal animate-fadeInUp">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-wharf-error" />
              <h3 className="font-display font-bold text-lg">Clear All Data?</h3>
            </div>
            <p className="text-sm font-mono text-wharf-text-secondary mb-6">
              Are you sure you want to clear your data? This will reset all your stats and delete
              your profile history. This action cannot be undone.
            </p>

            <div className="space-y-2 mb-6">
              <label className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider">
                Type <span className="text-wharf-error">CLEAR DATA</span> to confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CLEAR DATA"
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                }}
                className="px-4 py-2 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 border-2 border-wharf-border-primary bg-wharf-error text-wharf-white font-mono text-xs font-bold hover:bg-wharf-error/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Clearing...' : 'Clear Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
