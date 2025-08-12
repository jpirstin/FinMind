import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { listExpenses, createExpense, updateExpense, deleteExpense, type Expense } from '@/api/expenses';
import { listCategories, type Category } from '@/api/categories';

export default function Expenses() {
  const { toast } = useToast();
  const [items, setItems] = useState<Expense[]>([]); // paged items shown
  const [allItems, setAllItems] = useState<Expense[]>([]); // all filtered items for client-side paging
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Filters & pagination
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    refresh();
    loadCategories();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listExpenses({
        from: from || undefined,
        to: to || undefined,
        category_id: filterCategoryId ? Number(filterCategoryId) : undefined,
        search: search || undefined,
        // We still pass page/page_size for future server support,
        // but we will slice on client for now.
        page,
        page_size: pageSize,
      });
      setAllItems(data);
      // Reset page to 1 on new fetch
      const firstPage = data.slice(0, pageSize);
      setItems(firstPage);
      setPage(1);
    } catch (e: any) {
      setError(e?.message || 'Failed to load expenses');
      toast({ title: 'Failed to load expenses', description: e?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const cats = await listCategories();
      setCategories(cats);
    } catch {}
  }

  function resetForm() {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId('');
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(exp: Expense) {
    setEditing(exp);
    setAmount(String(exp.amount));
    setDescription(exp.description || '');
    setDate(exp.date.slice(0, 10));
    setCategoryId(exp.category_id ? String(exp.category_id) : '');
    setOpen(true);
  }

  async function onSubmit() {
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const updated = await updateExpense(editing.id, {
          amount: Number(amount),
          description,
          date,
          category_id: categoryId ? Number(categoryId) : null,
        });
        setAllItems((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
        setItems((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
        toast({ title: 'Expense updated' });
      } else {
        const created = await createExpense({
          amount: Number(amount),
          description,
          date,
          category_id: categoryId ? Number(categoryId) : null,
        });
        setAllItems((prev) => [created, ...prev]);
        // If on first page, prepend into view; otherwise keep current slice
        setItems((prev) => (page === 1 ? [created, ...prev].slice(0, pageSize) : prev));
        toast({ title: 'Expense created' });
      }
      setOpen(false);
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save expense');
      toast({ title: 'Failed to save expense', description: e?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    setSaving(true);
    try {
      await deleteExpense(id);
      setAllItems((prev) => prev.filter((x) => x.id !== id));
      // Recompute current page slice after deletion
      const newAll = allItems.filter((x) => x.id !== id);
      const newTotalPages = Math.max(1, Math.ceil(newAll.length / pageSize));
      const nextPage = Math.min(page, newTotalPages);
      const start = (nextPage - 1) * pageSize;
      const end = start + pageSize;
      setItems(newAll.slice(start, end));
      setPage(nextPage);
      toast({ title: 'Expense deleted' });
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
      toast({ title: 'Failed to delete expense', description: e?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const totals = useMemo(() => {
    // Totals over all filtered items
    const sum = allItems.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    return { sum };
  }, [allItems]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(allItems.length / pageSize)), [allItems.length, pageSize]);

  function goToPage(target: number) {
    const p = Math.min(Math.max(1, target), totalPages);
    setPage(p);
    const start = (p - 1) * pageSize;
    const end = start + pageSize;
    setItems(allItems.slice(start, end));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expenses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Expense' : 'New Expense'}</DialogTitle>
              <DialogDescription>Track your spending with accurate details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Groceries at Walmart" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select id="category" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="error">{error}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={onSubmit} disabled={saving || !amount}>{editing ? 'Save' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="card p-4 grid md:grid-cols-5 gap-3">
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="fcat">Category</Label>
          <select id="fcat" className="input" value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="search">Search</Label>
          <Input id="search" placeholder="description contains…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" onClick={() => { setFrom(''); setTo(''); setFilterCategoryId(''); setSearch(''); setPage(1); }}>Reset</Button>
          <Button onClick={() => { setPage(1); refresh(); }}>Apply</Button>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading…</div>
      ) : (
        <div className="card">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No expenses yet. Add your first one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2">{e.date.slice(0, 10)}</td>
                      <td className="py-2">{e.description}</td>
                      <td className="py-2">{e.category_id ? categoryMap.get(e.category_id) : '—'}</td>
                      <td className="py-2 font-medium">${e.amount.toFixed(2)}</td>
                      <td className="py-2">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => openEdit(e)}>Edit</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this expense.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(e.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="border-t bg-muted/30">
                    <td className="py-2" colSpan={3}>Total</td>
                    <td className="py-2 font-semibold">${totals.sum.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Page {page}</div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 1) { goToPage(page - 1); } }} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) { goToPage(page + 1); } }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="flex items-center gap-2">
              <Label htmlFor="ps">Page size</Label>
              <select id="ps" className="input" value={pageSize} onChange={(e) => {
                const size = Number(e.target.value);
                setPageSize(size);
                // Reset to page 1 and slice locally
                const first = allItems.slice(0, size);
                setItems(first);
                setPage(1);
              }}>
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
