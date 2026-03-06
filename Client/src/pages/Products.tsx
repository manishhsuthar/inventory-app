import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

export default function Products() {
  const { products, addProduct, getProductStock, loading, error } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    minStock: "",
    unit: "pcs",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.costPrice || !form.sellingPrice) return;
    try {
      await addProduct({
        name: form.name,
        category: form.category,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        minStock: Number(form.minStock) || 0,
        unit: form.unit || "pcs",
      });
      setSubmitError(null);
      setForm({ name: "", category: "", costPrice: "", sellingPrice: "", minStock: "", unit: "pcs" });
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your hardware inventory items</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm neu-button hover:opacity-90 transition-all active:neu-button-active"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 neu-raised animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label="Product Name" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} required />
            <InputField label="Category" value={form.category} onChange={(v) => setForm(f => ({ ...f, category: v }))} />
            <InputField label="Cost Price (₹)" type="number" value={form.costPrice} onChange={(v) => setForm(f => ({ ...f, costPrice: v }))} required />
            <InputField label="Selling Price (₹)" type="number" value={form.sellingPrice} onChange={(v) => setForm(f => ({ ...f, sellingPrice: v }))} required />
            <InputField label="Min Stock Level" type="number" value={form.minStock} onChange={(v) => setForm(f => ({ ...f, minStock: v }))} />
            <InputField label="Unit" value={form.unit} onChange={(v) => setForm(f => ({ ...f, unit: v }))} />
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm neu-button active:neu-button-active">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl bg-muted text-muted-foreground font-medium text-sm neu-button active:neu-button-active">Cancel</button>
          </div>
          {submitError && <p className="text-sm text-red-500 mt-3">{submitError}</p>}
        </form>
      )}

      <div className="rounded-2xl bg-card p-6 neu-raised">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading products...</p>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-8">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No products yet. Add your first product above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Cost (₹)</th>
                  <th className="pb-3 font-medium text-right">Sell (₹)</th>
                  <th className="pb-3 font-medium text-right">Stock</th>
                  <th className="pb-3 font-medium text-right">Min Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{p.name}</td>
                    <td className="py-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="py-3 text-right text-foreground">₹{Number(p.costPrice || 0).toLocaleString()}</td>
                    <td className="py-3 text-right text-foreground">₹{Number(p.sellingPrice || 0).toLocaleString()}</td>
                    <td className="py-3 text-right font-semibold text-foreground">
                      {getProductStock(p.id)} {p.unit || "pcs"}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{p.minStock ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl bg-background text-foreground text-sm neu-inset border-0 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}
