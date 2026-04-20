import { useState } from "react";
import {
  useGetMyClaimsQuery,
  useGetActiveWarrantiesQuery,
  useCreateClaimMutation,
  getCertificateUrl,
  type Warranty,
  type WarrantyClaim,
} from "../../api/warrantyApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "info" }> = {
  active:   { label: "Активна",    variant: "success" },
  expired:  { label: "Истекла",    variant: "destructive" },
  claimed:  { label: "Предъявлена", variant: "warning" },
  voided:   { label: "Аннулирована", variant: "secondary" },
  pending:  { label: "Ожидание",   variant: "warning" },
  under_review: { label: "На рассмотрении", variant: "info" },
  approved: { label: "Одобрена",   variant: "success" },
  rejected: { label: "Отклонена",  variant: "destructive" },
  resolved: { label: "Решена",     variant: "success" },
};

const typeLabels: Record<string, string> = {
  work: "Работы",
  spare_part: "Запчасти",
  complex: "Комплексная",
};

function WarrantyCard({ warranty }: { warranty: Warranty }) {
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [description, setDescription] = useState("");
  const [createClaim, { isLoading }] = useCreateClaimMutation();
  const cfg = statusConfig[warranty.status] ?? { label: warranty.status, variant: "secondary" as const };

  const handleClaim = async () => {
    if (!description.trim()) return;
    await createClaim({ warrantyId: warranty.id, description });
    setShowClaimForm(false);
    setDescription("");
  };

  const daysLeft = Math.ceil((new Date(warranty.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={cn(warranty.status === "active" ? "border-green-200" : "border-gray-200")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={cfg.variant as "success"}>{cfg.label}</Badge>
              <span className="text-sm text-gray-500">{typeLabels[warranty.type] ?? warranty.type}</span>
            </div>
            {warranty.description && (
              <p className="text-sm text-gray-700 mb-2">{warranty.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>Выдана: {new Date(warranty.issuedAt).toLocaleDateString("ru-RU")}</span>
              <span>До: {new Date(warranty.expiresAt).toLocaleDateString("ru-RU")}</span>
            </div>
            {warranty.status === "active" && daysLeft > 0 && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                Осталось: {daysLeft} {daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href={getCertificateUrl(warranty.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              📄 Талон PDF
            </a>
            {warranty.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => setShowClaimForm(!showClaimForm)}>
                Гарантийный случай
              </Button>
            )}
          </div>
        </div>

        {showClaimForm && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опишите проблему..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleClaim} disabled={isLoading || !description.trim()}>
                {isLoading ? "Отправка..." : "Подать заявку"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowClaimForm(false)}>Отмена</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClaimCard({ claim }: { claim: WarrantyClaim }) {
  const cfg = statusConfig[claim.status] ?? { label: claim.status, variant: "secondary" as const };
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={cfg.variant as "success"}>{cfg.label}</Badge>
            <span className="text-xs text-gray-400">{new Date(claim.createdAt).toLocaleDateString("ru-RU")}</span>
          </div>
          <p className="text-sm text-gray-700">{claim.description}</p>
          {claim.resolution && (
            <p className="text-sm text-green-700 mt-1">Решение: {claim.resolution}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WarrantyPage() {
  const { data: warranties = [], isLoading: wLoading } = useGetActiveWarrantiesQuery();
  const { data: claims = [], isLoading: cLoading } = useGetMyClaimsQuery();

  const [tab, setTab] = useState<"warranties" | "claims">("warranties");

  return (
    <PageLayout className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Гарантия</h1>
        <p className="text-gray-500 text-sm mt-0.5">Гарантийные обязательства по выполненным работам</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(["warranties", "claims"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer",
              tab === t ? "bg-white text-indigo-700 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {t === "warranties" ? "Гарантии" : "Мои обращения"}
          </button>
        ))}
      </div>

      {tab === "warranties" && (
        wLoading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="animate-pulse h-28 bg-gray-100 rounded-xl" />)}</div>
        ) : warranties.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><p className="text-gray-400">Нет активных гарантий</p></CardContent></Card>
        ) : (
          <div className="space-y-4">{warranties.map(w => <WarrantyCard key={w.id} warranty={w} />)}</div>
        )
      )}

      {tab === "claims" && (
        cLoading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />)}</div>
        ) : claims.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><p className="text-gray-400">Нет гарантийных обращений</p></CardContent></Card>
        ) : (
          <div className="space-y-3">{claims.map(c => <ClaimCard key={c.id} claim={c} />)}</div>
        )
      )}
    </PageLayout>
  );
}
