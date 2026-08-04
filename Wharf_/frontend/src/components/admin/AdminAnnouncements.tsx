import { useState, useEffect, useCallback } from 'react';
import {
  Rocket,
  RefreshCw,
  Wrench,
  Shield,
  Hammer,
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  Eye,
} from 'lucide-react';
import api from '../../lib/api';
import { Button, useToast } from '../ui';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'FEATURE' | 'UPDATE' | 'FIX' | 'SECURITY' | 'MAINTENANCE' | 'NEWS';
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  _count?: {
    reads: number;
  };
}

const typeIcons = {
  FEATURE: Rocket,
  UPDATE: RefreshCw,
  FIX: Wrench,
  SECURITY: Shield,
  MAINTENANCE: Hammer,
  NEWS: Newspaper,
};

const typeColors = {
  FEATURE: 'text-wharf-cyan-darker bg-wharf-cyan/10 border-wharf-cyan-darker/50',
  UPDATE: 'text-wharf-purple-darker bg-wharf-purple/10 border-wharf-purple-darker/50',
  FIX: 'text-yellow-500 bg-wharf-yellow/10 border-yellow-500/50',
  SECURITY: 'text-wharf-error bg-wharf-error/10 border-wharf-error/50',
  MAINTENANCE: 'text-wharf-orange-darker bg-wharf-orange/10 border-wharf-orange-darker/50',
  NEWS: 'text-wharf-pink-darker bg-wharf-pink/10 border-wharf-pink-darker/50',
};

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    message: string;
    type: string;
    isPinned: boolean;
    expiresAt: string;
  }>({
    title: '',
    message: '',
    type: 'FEATURE',
    isPinned: false,
    expiresAt: '',
  });

  const { showToast } = useToast();

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/announcements');
      setAnnouncements(data);
    } catch {
      console.error('Failed to fetch announcements');
      showToast('Failed to load announcements', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        isPinned: announcement.isPinned,
        expiresAt: announcement.expiresAt
          ? new Date(announcement.expiresAt).toISOString().split('T')[0]
          : '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        message: '',
        type: 'FEATURE',
        isPinned: false,
        expiresAt: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
        showToast('Announcement updated', 'success');
      } else {
        await api.post('/admin/announcements', { ...payload, isPublished: false });
        showToast('Announcement created draft', 'success');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch {
      showToast('Failed to save announcement', 'error');
    }
  };

  const handleTogglePublish = async (id: string, isCurrentlyPublished: boolean) => {
    try {
      await api.patch(`/admin/announcements/${id}/publish`, { isPublished: !isCurrentlyPublished });
      showToast(`Announcement ${isCurrentlyPublished ? 'archived' : 'published'}`, 'success');
      fetchAnnouncements();
    } catch {
      showToast('Failed to change publish state', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      showToast('Announcement deleted', 'success');
      fetchAnnouncements();
    } catch {
      showToast('Failed to delete announcement', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6 md:p-8 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="w-full md:w-1/2">
            <div className="h-8 bg-wharf-border-secondary rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-wharf-border-secondary rounded w-1/2"></div>
          </div>
          <div className="h-10 bg-wharf-border-secondary rounded w-32"></div>
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-wharf-border-secondary rounded-xl w-full"></div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl w-full"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-display font-black text-xl tracking-tighter flex items-center gap-3">
            Global Announcements
          </h2>
          <p className="font-mono text-sm text-wharf-text-secondary mt-1 max-w-xl capitalize">
            Create system-wide notifications that appear in user notification bells
          </p>
        </div>
        <Button
          variant="yellow"
          rounded="2xl"
          onClick={() => handleOpenModal()}
          className="flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-sm border-2 border-wharf-border-primary">
          <thead>
            <tr className="bg-wharf-surface-secondary border-b-2 border-wharf-border-primary text-wharf-text-primary">
              <th className="p-4 font-bold border-r-2 border-wharf-border-primary w-[50%]">
                Title
              </th>
              <th className="p-4 font-bold border-r-2 border-wharf-border-primary w-[15%]">
                Reads
              </th>
              <th className="p-4 font-bold border-r-2 border-wharf-border-primary w-[15%]">
                Status
              </th>
              <th className="p-4 font-bold w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-wharf-text-tertiary font-bold capitalize"
                >
                  No announcements found...
                </td>
              </tr>
            ) : (
              announcements.map((item) => {
                const Icon = typeIcons[item.type];
                const colorConfig = typeColors[item.type];

                return (
                  <tr
                    key={item.id}
                    className="border-b border-wharf-border-secondary hover:bg-wharf-surface-secondary/50"
                  >
                    <td className="p-4 border-r-2 border-wharf-border-primary">
                      <div className="font-bold mb-1 flex items-center gap-4">
                        {item.title}
                        {item.isPinned && (
                          <span className="text-[10px] bg-wharf-pink/20 text-wharf-pink-darker px-1 border border-wharf-pink/50 uppercase">
                            Pinned
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-wharf-text-tertiary truncate max-w-xs">
                        {item.message}
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-wharf-border-primary">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${colorConfig} text-[10px] font-bold tracking-widest uppercase mb-2`}
                      >
                        <Icon className="w-3 h-3" />
                        {item.type}
                      </div>
                      <div className="text-xs font-bold text-wharf-cyan-darker flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> {item._count?.reads || 0} Reads
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-wharf-border-primary">
                      {item.isPublished ? (
                        <div className="flex items-center gap-1.5 text-wharf-green-darker text-xs font-bold w-fit">
                          <Globe className="w-3.5 h-3.5" /> Published
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-wharf-text-tertiary text-xs font-bold w-fit">
                          <EyeOff className="w-3.5 h-3.5" /> Draft
                        </div>
                      )}
                      <div className="text-[10px] text-wharf-text-tertiary mt-2">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="flex gap-8">
                        <button
                          onClick={() => handleTogglePublish(item.id, item.isPublished)}
                          className="p-1.5 hover:bg-wharf-surface-primary border border-transparent hover:border-wharf-border-primary text-wharf-text-secondary hover:text-wharf-text-primary transition-colors cursor-pointer"
                          title={item.isPublished ? 'Unpublish (Archive)' : 'Publish'}
                        >
                          {item.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 hover:bg-wharf-surface-primary border border-transparent hover:border-wharf-border-primary text-wharf-text-secondary hover:text-yellow-500 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-wharf-surface-primary border border-transparent hover:border-wharf-border-primary text-wharf-text-secondary hover:text-wharf-error transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal p-6">
            <h3 className="font-display font-black text-xl mb-6">
              {editingId ? 'Edit Announcement' : 'Create Draft Announcement'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold text-wharf-text-secondary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-wharf-surface-secondary border-2 border-wharf-border-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-yellow-500"
                  placeholder="E.g., System Maintenance"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-wharf-text-secondary mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-wharf-surface-secondary border-2 border-wharf-border-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                >
                  <option value="FEATURE">Feature</option>
                  <option value="UPDATE">Update</option>
                  <option value="FIX">Fix</option>
                  <option value="SECURITY">Security</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="NEWS">News</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-wharf-text-secondary mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-wharf-surface-secondary border-2 border-wharf-border-primary px-3 py-2 font-mono text-sm resize-none focus:outline-none focus:border-yellow-500"
                  placeholder="Keep it brief and actionable..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-mono text-xs font-bold text-wharf-text-secondary mb-1">
                    Expires At (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-wharf-surface-secondary border-2 border-wharf-border-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 bg-wharf-surface-secondary border-2 border-wharf-border-primary accent-yellow-500 cursor-pointer"
                  />
                  <label
                    htmlFor="isPinned"
                    className="font-mono text-sm font-bold text-wharf-text-secondary"
                  >
                    Pin to Top
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t-2 border-wharf-border-primary mt-6">
                <Button
                  variant="outline"
                  rounded="2xl"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="yellow" rounded="2xl" type="submit">
                  {editingId ? 'Save Changes' : 'Create Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
