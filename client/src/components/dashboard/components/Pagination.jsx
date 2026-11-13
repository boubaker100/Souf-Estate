import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


export default function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1, // عدد الصفحات حول الحالية
  className,
}) {
  const pages = useMemo(() => {
    if (totalPages <= 1) return [];

    const range = new Set([1, totalPages]);

    for (let i = -siblingCount; i <= siblingCount; i++) {
      const page = currentPage + i;
      if (page > 1 && page < totalPages) {
        range.add(page);
      }
    }

    return Array.from(range).sort((a, b) => a - b);
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <Pagination className={cn("mt-6 justify-center", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            className={cn(isFirst && "pointer-events-none opacity-40")}
            onClick={(e) => {
              e.preventDefault();
              if (!isFirst) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pages.map((page, index) => {
          const prev = pages[index - 1];

          return (
            <React.Fragment key={page}>
              {prev !== undefined && page - prev > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page !== currentPage) {
                      onPageChange(page);
                    }
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            className={cn(isLast && "pointer-events-none opacity-40")}
            onClick={(e) => {
              e.preventDefault();
              if (!isLast) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}