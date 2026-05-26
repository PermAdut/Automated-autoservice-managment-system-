import { useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CaretUpOutlined,
  CaretDownOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { InputWithIcon } from "./input-with-icon";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Поиск...",
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: { sorting, globalFilter },
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getRowCount();
  const pageStart = totalRows === 0 ? 0 : pageIndex * currentPageSize + 1;
  const pageEnd = Math.min((pageIndex + 1) * currentPageSize, totalRows);

  const visiblePageIndexes = useMemo(() => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    const pages = new Set<number>([0, pageCount - 1, pageIndex]);
    for (let offset = -1; offset <= 1; offset += 1) {
      const page = pageIndex + offset;
      if (page >= 0 && page < pageCount) {
        pages.add(page);
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }, [pageCount, pageIndex]);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-md">
        <InputWithIcon
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          icon={<SearchOutlined className="text-sm" />}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-gray-50 border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() && "cursor-pointer select-none hover:text-gray-900",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col -space-y-1 ml-0.5">
                            <CaretUpOutlined
                              className={cn(
                                "text-[8px]",
                                header.column.getIsSorted() === "asc" ? "text-indigo-600" : "text-gray-300",
                              )}
                            />
                            <CaretDownOutlined
                              className={cn(
                                "text-[8px]",
                                header.column.getIsSorted() === "desc" ? "text-indigo-600" : "text-gray-300",
                              )}
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-gray-400">
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500">
            Показано{" "}
            <span className="font-medium text-gray-700">
              {pageStart}–{pageEnd}
            </span>{" "}
            из <span className="font-medium text-gray-700">{totalRows}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <LeftOutlined />
            </Button>
            {visiblePageIndexes.map((page, index) => {
              const prevPage = visiblePageIndexes[index - 1];
              const showEllipsis = index > 0 && prevPage !== undefined && page - prevPage > 1;

              return (
                <span key={page} className="flex items-center gap-1">
                  {showEllipsis && <span className="px-1 text-gray-400">…</span>}
                  <Button
                    variant={page === pageIndex ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => table.setPageIndex(page)}
                    className={cn("min-w-8", page === pageIndex && "pointer-events-none")}
                  >
                    {page + 1}
                  </Button>
                </span>
              );
            })}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <RightOutlined />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
