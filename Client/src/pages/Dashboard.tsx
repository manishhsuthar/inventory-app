import { useStore } from "@/contexts/StoreContext";
import { Package, Truck, AlertTriangle, IndianRupee, Bell, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { products, dealers, purchases, sales, getProductStock, getLowStockProducts, getTotalOutstandingPayments } = useStore();

  const totalProducts = products.length;
  const totalDealers = dealers.length;
  const lowStock = getLowStockProducts();
  const outstanding = getTotalOutstandingPayments();
  const totalSalesAmount = sales.reduce((s, sale) => s + sale.totalAmount, 0);
  const totalPurchaseAmount = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const notifications = [
    ...(lowStock.length > 0 ? [{
      id: "low-stock",
      text: `${lowStock.length} product${lowStock.length > 1 ? "s are" : " is"} below minimum stock`,
      style: "bg-destructive/10 text-destructive border-destructive/20",
      icon: AlertTriangle,
    }] : []),
    ...(outstanding > 0 ? [{
      id: "outstanding",
      text: `Outstanding dealer payments: ₹${outstanding.toLocaleString()}`,
      style: "bg-warning/10 text-warning border-warning/20",
      icon: IndianRupee,
    }] : []),
  ];

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-primary" },
    { label: "Total Dealers", value: totalDealers, icon: Truck, color: "text-accent" },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle, color: "text-warning" },
    { label: "Outstanding Payments", value: `₹${outstanding.toLocaleString()}`, icon: IndianRupee, color: "text-destructive" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your hardware shop</p>
      </div>

      <div className="rounded-2xl bg-card p-4 neu-raised">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        </div>
        {notifications.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm text-foreground">No active alerts. Inventory looks healthy.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notice) => (
              <div key={notice.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${notice.style}`}>
                <notice.icon className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{notice.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-card p-5 neu-raised animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-card p-6 neu-raised">
          <h3 className="font-semibold text-foreground mb-1">Revenue Summary</h3>
          <p className="text-xs text-muted-foreground mb-4">Total purchases vs sales</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Purchases</span>
              <span className="text-sm font-semibold text-foreground">₹{totalPurchaseAmount.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${totalPurchaseAmount && totalSalesAmount ? Math.min(100, (totalPurchaseAmount / (totalPurchaseAmount + totalSalesAmount)) * 100) : 50}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Sales</span>
              <span className="text-sm font-semibold text-foreground">₹{totalSalesAmount.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalPurchaseAmount && totalSalesAmount ? Math.min(100, (totalSalesAmount / (totalPurchaseAmount + totalSalesAmount)) * 100) : 50}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 neu-raised">
          <h3 className="font-semibold text-foreground mb-1">Low Stock Alerts</h3>
          <p className="text-xs text-muted-foreground mb-4">Items at or below minimum stock</p>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All items are well-stocked 🎉</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-auto">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl p-3 neu-inset">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-destructive">{getProductStock(p.id)}</span>
                    <span className="text-xs text-muted-foreground ml-1">/ {p.minStock} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Stock Levels */}
      <div className="rounded-2xl bg-card p-6 neu-raised">
        <h3 className="font-semibold text-foreground mb-1">Current Stock Levels</h3>
        <p className="text-xs text-muted-foreground mb-4">Dynamic stock calculated from transactions</p>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No products added yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Stock</th>
                  <th className="pb-3 font-medium text-right">Min Stock</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 10).map((p) => {
                  const stock = getProductStock(p.id);
                  const isLow = stock <= p.minStock;
                  return (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.category}</td>
                      <td className="py-3 text-right font-semibold text-foreground">{stock} {p.unit}</td>
                      <td className="py-3 text-right text-muted-foreground">{p.minStock}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isLow ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                          {isLow ? "Low" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
