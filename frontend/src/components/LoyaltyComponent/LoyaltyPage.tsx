import {
  useGetMyLoyaltyQuery,
  useGetMyLoyaltyTransactionsQuery,
  useGetActiveDiscountsQuery,
  type LoyaltyTransaction,
} from "../../api/loyaltyApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const tierConfig = {
  bronze:   { label: "Стандарт",  color: "text-orange-700 bg-orange-100", emoji: "🥉", min: 0,    max: 499,   multiplier: 1.0 },
  silver:   { label: "Серебро",   color: "text-gray-600 bg-gray-100",    emoji: "🥈", min: 500,  max: 1999,  multiplier: 1.1 },
  gold:     { label: "Золото",    color: "text-yellow-700 bg-yellow-100", emoji: "🥇", min: 2000, max: 4999,  multiplier: 1.2 },
  platinum: { label: "Премиум",   color: "text-purple-700 bg-purple-100", emoji: "💎", min: 5000, max: Infinity, multiplier: 1.5 },
};

const txTypeLabels: Record<string, { label: string; color: string }> = {
  earn:       { label: "Начислено",   color: "text-green-600" },
  bonus:      { label: "Бонус",        color: "text-blue-600" },
  spend:      { label: "Списано",      color: "text-red-500" },
  adjustment: { label: "Корректировка", color: "text-gray-500" },
};

function TxRow({ tx }: { tx: LoyaltyTransaction }) {
  const cfg = txTypeLabels[tx.type] ?? { label: tx.type, color: "text-gray-600" };
  const sign = tx.points >= 0 ? "+" : "";
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{cfg.label}</p>
        {tx.description && <p className="text-xs text-gray-400 mt-0.5">{tx.description}</p>}
        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString("ru-RU")}</p>
      </div>
      <span className={cn("font-bold text-sm tabular-nums", cfg.color)}>
        {sign}{tx.points.toLocaleString()} бал.
      </span>
    </div>
  );
}

export default function LoyaltyPage() {
  const { data: loyalty, isLoading } = useGetMyLoyaltyQuery();
  const { data: transactions = [], isLoading: txLoading } = useGetMyLoyaltyTransactionsQuery();
  const { data: discounts = [] } = useGetActiveDiscountsQuery();

  const tier = loyalty?.tier ?? "bronze";
  const tierInfo = tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.bronze;
  const nextTier = tier === "bronze" ? tierConfig.silver
    : tier === "silver" ? tierConfig.gold
    : tier === "gold" ? tierConfig.platinum
    : null;

  const progressPct = nextTier
    ? Math.min(100, ((loyalty?.totalEarned ?? 0) - tierInfo.min) / (tierInfo.max - tierInfo.min) * 100)
    : 100;

  return (
    <PageLayout className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Программа лояльности</h1>
        <p className="text-gray-500 text-sm mt-0.5">Накапливайте баллы и получайте скидки</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-40 bg-gray-100 rounded-2xl" />
      ) : loyalty ? (
        <Card className="overflow-hidden">
          <div className={cn("p-6", tier === "platinum" ? "bg-linear-to-r from-purple-600 to-indigo-600" : tier === "gold" ? "bg-linear-to-r from-yellow-500 to-orange-400" : tier === "silver" ? "bg-linear-to-r from-gray-400 to-gray-600" : "bg-linear-to-r from-orange-400 to-orange-600")}>
            <div className="flex items-center justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{tierInfo.emoji}</span>
                  <span className="font-bold text-xl">{tierInfo.label}</span>
                </div>
                <p className="text-white/80 text-sm">Коэффициент начисления: ×{tierInfo.multiplier}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{loyalty.points.toLocaleString()}</p>
                <p className="text-white/80 text-sm">баллов</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{loyalty.totalEarned.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Всего заработано</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{loyalty.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Потрачено баллов</p>
              </div>
            </div>

            {nextTier && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{tierInfo.label}</span>
                  <span>{nextTier.label} (с {nextTier.min.toLocaleString()} бал.)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  ещё {(nextTier.min - (loyalty.totalEarned)).toLocaleString()} бал. до {nextTier.label}
                </p>
              </div>
            )}

            <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
              💡 1 балл = 1 рубль скидки. До 20% от стоимости заказа можно оплатить баллами.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-3">🎁</p>
            <p className="text-gray-500">Ваша программа лояльности ещё не активирована</p>
            <p className="text-sm text-gray-400 mt-1">Оформите первый заказ, чтобы начать накапливать баллы</p>
          </CardContent>
        </Card>
      )}

      {discounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Доступные акции</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {discounts.map(d => (
              <div key={d.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-800">{d.name}</p>
                  {d.code && <p className="text-xs text-gray-500 font-mono">Промокод: {d.code}</p>}
                  <p className="text-xs text-gray-400">До {new Date(d.endDate).toLocaleDateString("ru-RU")}</p>
                </div>
                <Badge variant="success">
                  {d.type === "percent" ? `${d.value}%` : `${d.value} ₽`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">История баллов</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded" />)}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">История пуста</p>
          ) : (
            transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
