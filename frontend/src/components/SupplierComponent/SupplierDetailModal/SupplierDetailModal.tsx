import { Supplier } from "../../../api/suppliersApi";
import { ModalOverlay } from "../../ui/modal-overlay";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { PositionInvoices } from "../PositionInvoices/PositionInvoices";
import {
  getPositionStatusLabel,
  getPositionSubtitle,
  getPositionTitle,
} from "../../../utils/formatPurchasePosition";

interface SupplierDetailModalProps {
  supplier: Supplier;
  canManage: boolean;
  canDelete: boolean;
  onClose: () => void;
}

export function SupplierDetailModal({
  supplier,
  canManage,
  canDelete,
  onClose,
}: SupplierDetailModalProps) {
  const validPositions = (supplier.positionsForBuying ?? []).filter(
    (position): position is typeof position & { id: string } => Boolean(position?.id),
  );

  return (
    <ModalOverlay onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{supplier.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {supplier.contact} · {supplier.address}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        {validPositions.length === 0 ? (
          <p className="text-sm text-gray-500">У поставщика нет закупочных позиций</p>
        ) : (
          <div className="space-y-4">
            {validPositions.map((position, index) => (
              <div
                key={position.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {getPositionTitle(position, index)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getPositionSubtitle(position)}
                    </p>
                  </div>
                  <Badge variant="info">
                    {getPositionStatusLabel(position.status)}
                  </Badge>
                </div>

                <PositionInvoices
                  positionId={position.id}
                  canManage={canManage}
                  canDelete={canDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
