import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export interface ProjectDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  pageSize?: number;
}

export function ProjectDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  pageSize = 10,
}: ProjectDataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      <div className="overflow-x-auto rounded-sm border border-zinc-800/80 bg-zinc-950/80 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-500 italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-zinc-900/40 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-4 py-3">
                      {col.cell ? col.cell(row) : (row as any)[col.accessorKey as string]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-[11px] text-zinc-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDataTable;
