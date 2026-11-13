import { useSearchParams } from "react-router-dom";

export const usePaginatedQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 9;
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "latest";

  const updateParams = (newParams) => {
    setSearchParams({
      page,
      limit,
      search,
      sort,
      ...newParams,
    });
  };

  return {
    page,
    limit,
    search,
    sort,
    updateParams,
  };
};
