import { SupplierPosition } from "../../api/suppliersApi";

const positionStatusLabels: Record<string, string> = {
  pending: "Ожидает",
  in_transit: "В пути",
  delivered: "Доставлено",
};

export function getPositionTitle(position: SupplierPosition, index: number): string {
  if (position.sparePartName) {
    return position.sparePartNumber
      ? `${position.sparePartName} · ${position.sparePartNumber}`
      : position.sparePartName;
  }

  return `Закупка #${index + 1}`;
}

export function getPositionSubtitle(position: SupplierPosition): string {
  const deliveryDate = new Date(position.deliverDate).toLocaleDateString("ru-RU");
  return `${position.quantity} шт. · доставка ${deliveryDate}`;
}

export function getPositionStatusLabel(status: string): string {
  return positionStatusLabels[status] ?? status;
}
