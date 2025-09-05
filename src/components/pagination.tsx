"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Props = {
  currentPage: number;
  totalPages: number;
};

export function PaginationControls({ currentPage, totalPages }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaginationControlsContent
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </Suspense>
  );
}

function PaginationControlsContent({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();
  const limit = Math.min(totalPages, 9);
  const offset = Math.max(
    Math.min(currentPage - Math.floor(limit / 2), totalPages - limit + 1),
    1
  );

  const toHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={toHref(currentPage - 1)}
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        {offset > 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {Array.from({ length: limit }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={offset + i === currentPage}
              href={toHref(offset + i)}
            >
              {offset + i}
            </PaginationLink>
          </PaginationItem>
        ))}
        {offset + limit <= totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href={toHref(currentPage + 1)}
            className={
              currentPage < totalPages
                ? undefined
                : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
