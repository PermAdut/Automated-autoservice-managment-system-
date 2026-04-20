import { useState } from "react";
import {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useGetContractsQuery,
  useCreateContractMutation,
  useUpdateContractStatusMutation,
  type Company,
  type CompanyContract,
} from "../../api/corporateApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const contractStatusConfig: Record<string, { label: string; variant: "warning" | "success" | "secondary" | "destructive" | "info" }> = {
  draft:       { label: "Черновик",    variant: "secondary" },
  active:      { label: "Активен",     variant: "success" },
  suspended:   { label: "Приостановлен", variant: "warning" },
  expired:     { label: "Истёк",       variant: "destructive" },
  terminated:  { label: "Расторгнут",  variant: "destructive" },
};

function CompanyCard({ company, onSelect }: { company: Company; onSelect: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl shrink-0">🏭</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
              {!company.isActive && <Badge variant="secondary">Неактивна</Badge>}
            </div>
            {company.inn && <p className="text-xs text-gray-500 mt-0.5">ИНН: {company.inn}</p>}
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              {company.city && <span>{company.city}</span>}
              {company.contactPerson && <span>Контакт: {company.contactPerson}</span>}
              {company.phone && <span>{company.phone}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractCard({ contract }: { contract: CompanyContract }) {
  const [updateStatus] = useUpdateContractStatusMutation();
  const cfg = contractStatusConfig[contract.status] ?? { label: contract.status, variant: "secondary" as const };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={cfg.variant as "success"}>{cfg.label}</Badge>
            {contract.contractNumber && <span className="text-xs text-gray-500">№ {contract.contractNumber}</span>}
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-1">
            <span>С: {new Date(contract.startDate).toLocaleDateString("ru-RU")}</span>
            <span>По: {new Date(contract.endDate).toLocaleDateString("ru-RU")}</span>
            {contract.discountPercent && <span>Скидка: {contract.discountPercent}%</span>}
            {contract.creditLimit && <span>Лимит: {parseFloat(contract.creditLimit).toLocaleString()} ₽</span>}
            {contract.paymentTermDays && <span>Отсрочка: {contract.paymentTermDays} дн.</span>}
          </div>
          {contract.notes && <p className="text-xs text-gray-400 mt-1">{contract.notes}</p>}
        </div>
        {contract.status === "draft" && (
          <Button size="sm" onClick={() => updateStatus({ id: contract.id, status: "active" })}>Активировать</Button>
        )}
        {contract.status === "active" && (
          <Button size="sm" variant="outline" onClick={() => updateStatus({ id: contract.id, status: "suspended" })}>Приостановить</Button>
        )}
      </div>
    </div>
  );
}

function CompanyDetail({ company, onBack }: { company: Company; onBack: () => void }) {
  const { data: contracts = [], isLoading } = useGetContractsQuery(company.id);
  const [createContract, { isLoading: isCreating }] = useCreateContractMutation();
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractForm, setContractForm] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    contractNumber: "", discountPercent: "", creditLimit: "", paymentTermDays: "", notes: "",
  });

  const handleCreateContract = async () => {
    await createContract({ companyId: company.id, ...contractForm });
    setShowContractForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>← Назад</Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
          {company.inn && <p className="text-sm text-gray-500">ИНН: {company.inn}</p>}
        </div>
      </div>

      <Card>
        <CardContent className="p-5 grid grid-cols-2 gap-3 text-sm">
          {company.address && <div><span className="text-gray-500">Адрес:</span> {company.address}</div>}
          {company.city && <div><span className="text-gray-500">Город:</span> {company.city}</div>}
          {company.contactPerson && <div><span className="text-gray-500">Контакт:</span> {company.contactPerson}</div>}
          {company.phone && <div><span className="text-gray-500">Телефон:</span> {company.phone}</div>}
          {company.email && <div><span className="text-gray-500">Email:</span> {company.email}</div>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Договоры ({contracts.length})</h3>
        <Button size="sm" onClick={() => setShowContractForm(!showContractForm)}>+ Новый договор</Button>
      </div>

      {showContractForm && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Номер договора</Label>
                <Input value={contractForm.contractNumber} onChange={e => setContractForm(p => ({ ...p, contractNumber: e.target.value }))} placeholder="ДО-001" />
              </div>
              <div>
                <Label className="text-xs">Скидка (%)</Label>
                <Input type="number" value={contractForm.discountPercent} onChange={e => setContractForm(p => ({ ...p, discountPercent: e.target.value }))} placeholder="5" />
              </div>
              <div>
                <Label className="text-xs">Дата начала</Label>
                <Input type="date" value={contractForm.startDate} onChange={e => setContractForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Дата окончания</Label>
                <Input type="date" value={contractForm.endDate} onChange={e => setContractForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Кредитный лимит (₽)</Label>
                <Input type="number" value={contractForm.creditLimit} onChange={e => setContractForm(p => ({ ...p, creditLimit: e.target.value }))} placeholder="100000" />
              </div>
              <div>
                <Label className="text-xs">Отсрочка (дней)</Label>
                <Input type="number" value={contractForm.paymentTermDays} onChange={e => setContractForm(p => ({ ...p, paymentTermDays: e.target.value }))} placeholder="30" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={isCreating} onClick={handleCreateContract}>
                {isCreating ? "Создание..." : "Создать договор"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowContractForm(false)}>Отмена</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}</div>
      ) : contracts.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Нет договоров</p>
      ) : (
        <div className="space-y-3">{contracts.map(c => <ContractCard key={c.id} contract={c} />)}</div>
      )}
    </div>
  );
}

export default function CorporatePage() {
  const { data: companies = [], isLoading } = useGetCompaniesQuery();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", inn: "", address: "", city: "", contactPerson: "", phone: "", email: "" });

  const handleCreate = async () => {
    await createCompany(form as Omit<Company, "id" | "isActive" | "createdAt">);
    setShowForm(false);
    setForm({ name: "", inn: "", address: "", city: "", contactPerson: "", phone: "", email: "" });
  };

  if (selectedCompany) {
    return (
      <PageLayout className="space-y-6">
        <CompanyDetail company={selectedCompany} onBack={() => setSelectedCompany(null)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Корпоративные клиенты</h1>
          <p className="text-gray-500 text-sm mt-0.5">Организации и договорное обслуживание</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Добавить организацию</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Новая организация</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Название *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder='ООО "Ромашка"' />
              </div>
              <div>
                <Label>ИНН</Label>
                <Input value={form.inn} onChange={e => setForm(p => ({ ...p, inn: e.target.value }))} placeholder="7712345678" />
              </div>
              <div>
                <Label>Город</Label>
                <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Москва" />
              </div>
              <div className="col-span-2">
                <Label>Адрес</Label>
                <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="ул. Ленина, 1" />
              </div>
              <div>
                <Label>Контактное лицо</Label>
                <Input value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} placeholder="Иван Иванов" />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+7 (495) 000-00-00" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button disabled={isCreating || !form.name} onClick={handleCreate}>
                {isCreating ? "Создание..." : "Создать"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />)}</div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-3">🏭</p>
            <p className="text-gray-500">Нет корпоративных клиентов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {companies.map(c => <CompanyCard key={c.id} company={c} onSelect={() => setSelectedCompany(c)} />)}
        </div>
      )}
    </PageLayout>
  );
}
