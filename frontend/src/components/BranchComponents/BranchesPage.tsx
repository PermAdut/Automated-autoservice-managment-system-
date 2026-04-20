import { useState } from "react";
import {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useGetTransfersQuery,
  useUpdateTransferStatusMutation,
  type Branch,
} from "../../api/branchesApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

const transferStatusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "destructive" }> = {
  pending:    { label: "Ожидает",  variant: "warning" },
  in_transit: { label: "В пути",   variant: "info" },
  completed:  { label: "Получено", variant: "success" },
  cancelled:  { label: "Отменено", variant: "destructive" },
};

function BranchCard({ branch, onEdit }: { branch: Branch; onEdit: (b: Branch) => void }) {
  return (
    <Card className={cn(!branch.isActive && "opacity-60")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏢</span>
              <h3 className="font-semibold text-gray-900">{branch.name}</h3>
              {!branch.isActive && <Badge variant="secondary">Неактивен</Badge>}
            </div>
            <p className="text-sm text-gray-600">{branch.address}{branch.city ? `, ${branch.city}` : ""}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              {branch.phone && <span>📞 {branch.phone}</span>}
              {branch.email && <span>✉️ {branch.email}</span>}
              {branch.workingHours && <span>⏰ {branch.workingHours}</span>}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onEdit(branch)}>Изменить</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BranchFormModal({
  branch,
  onSubmit,
  onClose,
  isLoading,
}: {
  branch?: Branch | null;
  onSubmit: (data: Partial<Branch>) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<Partial<Branch>>(branch ?? {});
  const set = (k: keyof Branch, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">{branch ? "Редактировать филиал" : "Новый филиал"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Название *</Label>
            <Input value={form.name ?? ""} onChange={e => set("name", e.target.value)} placeholder="Центральный офис" />
          </div>
          <div className="col-span-2">
            <Label>Адрес *</Label>
            <Input value={form.address ?? ""} onChange={e => set("address", e.target.value)} placeholder="ул. Ленина, 1" />
          </div>
          <div>
            <Label>Город</Label>
            <Input value={form.city ?? ""} onChange={e => set("city", e.target.value)} placeholder="Москва" />
          </div>
          <div>
            <Label>Телефон</Label>
            <Input value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} placeholder="+7 (495) 000-00-00" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="branch@service.ru" />
          </div>
          <div>
            <Label>Рабочие часы</Label>
            <Input value={form.workingHours ?? ""} onChange={e => set("workingHours", e.target.value)} placeholder="9:00–21:00" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button disabled={isLoading || !form.name || !form.address} onClick={() => onSubmit(form)}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TransfersTab() {
  const { data: transfers = [], isLoading } = useGetTransfersQuery();
  const [updateStatus] = useUpdateTransferStatusMutation();

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}</div>
      ) : transfers.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Нет перемещений</p>
      ) : (
        transfers.map(t => {
          const cfg = transferStatusConfig[t.status] ?? { label: t.status, variant: "secondary" as const };
          return (
            <div key={t.id} className="p-4 border rounded-lg flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={cfg.variant as "warning"}>{cfg.label}</Badge>
                  <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
                <p className="text-sm text-gray-700">Кол-во: {t.quantity}</p>
                {t.notes && <p className="text-xs text-gray-400">{t.notes}</p>}
              </div>
              {t.status === "in_transit" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus({ id: t.id, status: "completed" })}>
                  Получено
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function BranchesPage() {
  const { data: branches = [], isLoading } = useGetBranchesQuery();
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [tab, setTab] = useState<"branches" | "transfers">("branches");

  const handleSubmit = async (data: Partial<Branch>) => {
    if (editingBranch) {
      await updateBranch({ id: editingBranch.id, data });
      setEditingBranch(null);
    } else {
      await createBranch(data as Omit<Branch, "id" | "isActive">);
      setShowForm(false);
    }
  };

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Филиалы</h1>
          <p className="text-gray-500 text-sm mt-0.5">Управление сетью автосервисов</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Добавить филиал</Button>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(["branches", "transfers"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer",
              tab === t ? "bg-white text-indigo-700 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {t === "branches" ? `Филиалы (${branches.length})` : "Перемещения"}
          </button>
        ))}
      </div>

      {tab === "branches" && (
        isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-4">
            {branches.map(b => (
              <BranchCard key={b.id} branch={b} onEdit={setEditingBranch} />
            ))}
          </div>
        )
      )}

      {tab === "transfers" && <TransfersTab />}

      {(showForm || editingBranch) && (
        <BranchFormModal
          branch={editingBranch}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingBranch(null); }}
          isLoading={isCreating || isUpdating}
        />
      )}
    </PageLayout>
  );
}
