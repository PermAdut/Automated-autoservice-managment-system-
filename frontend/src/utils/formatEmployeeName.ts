interface EmployeeNameParts {
  name?: string | null;
  surName?: string | null;
  lastName?: string | null;
}

/** Имя и фамилия для списков и селектов. */
export function formatEmployeeName(employee: EmployeeNameParts): string {
  const name = employee.name?.trim() ?? "";
  const surName = employee.surName?.trim() ?? "";
  return [name, surName].filter(Boolean).join(" ") || "—";
}

/** Фамилия Имя Отчество — для карточки сотрудника. */
export function formatEmployeeFullName(employee: EmployeeNameParts): string {
  const parts = [
    employee.surName?.trim(),
    employee.name?.trim(),
    employee.lastName?.trim(),
  ].filter(Boolean);
  return parts.join(" ") || "—";
}
