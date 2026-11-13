import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "@/lib/apiRequest";

export default function useDataTable({
  queryKey,
  endpoint,
  initialPage = 1,
  initialLimit = 10,
  initialFilters = {},
}) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(null);

  const queryParams = useMemo(() => {
    return {
      page,
      take: limit,
      search,
      ...filters,
      ...(sort && { sort }),
    };
  }, [page, limit, search, filters, sort]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey, queryParams],
    queryFn: async () => {
  const res = await apiRequest.get(endpoint, {
    params: queryParams,
  });
  return res.data;
    },
    keepPreviousData: true,
  });

  const setFilter = (key, value) => {
    setPage(1); // نرجع لأول صفحة عند تغيير الفلتر
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    data,
    isLoading,
    isError,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    sort,
    setSort,
  };
}