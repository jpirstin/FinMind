import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../api/categories';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import { getToken } from '../lib/auth';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dailog';
import { useToast } from '@/hooks/use-toast';

export default function Categories() {
  const { toast } = useToast();
  const nav = useNavigate();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!getToken()) {
      nav('/login', { replace: true });
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategories();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load categories');
      toast({ title: 'Failed to load categories', description: e?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await createCategory(newName.trim());
      setItems((prev) => [created, ...prev]);
      setNewName('');
      toast({ title: 'Category created' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create');
      toast({ title: 'Failed to create category', description: e?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function onSaveEdit(id: number) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateCategory(id, editName.trim());
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      setEditingId(null);
      setEditName('');
      toast({ title: 'Category updated' });
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
      toast({ title: 'Failed to update category', description: e?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    setSaving(true);
    try {
      await deleteCategory(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast({ title: 'Category deleted' });
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
      toast({ title: 'Failed to delete category', description: e?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>Categories</h2>
      <p className="muted">Organize your spending with clear, simple categories.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="input-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add a new category"
          />
          <button className="btn" onClick={onAdd} disabled={saving || !newName.trim()}>Add</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="card">Loading…</div>
      ) : (
        <div className="list">
          {items.map((c) => (
            <div key={c.id} className="list-item">
              {editingId === c.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Category name"
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => onSaveEdit(c.id)} disabled={saving || !editName.trim()}>
                      Save
                    </button>
                    <button className="btn secondary" onClick={() => { setEditingId(null); setEditName(''); }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>{c.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn secondary" onClick={() => { setEditingId(c.id); setEditName(c.name); }}>
                      Edit
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="btn secondary">Delete</button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category "{c.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="card">No categories yet. Create your first above.</div>
          )}
        </div>
      )}
    </div>
  );
}
