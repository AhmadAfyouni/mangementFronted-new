// src/hooks/useGlobalSearch.ts
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/state/store';
import { EntityType, setSearchQuery, setFilter, resetFilters, setCurrentPage, setItemsPerPage, resetEntitySearch } from '@/state/slices/searchSlice';

// Generic interface for searchable entities
interface SearchableEntity {
    id: string; // Only require `id`
}

// Configuration for search fields and filters
export interface SearchConfig<
    T extends SearchableEntity,
    F extends Partial<Record<keyof T, string | number | boolean | null>> = Partial<Record<keyof T, string | number | boolean | null>>
> {
    // Fields to search in
    searchFields: (keyof T)[];
    // Available filter options
    filterOptions?: {
        [key: string]: {
            label: string;
            options: Array<{ value: string | number | boolean | null; label: string }>;
        };
    };
    // Custom filter function for complex filtering
    customFilterFn?: (item: T, filters: F) => boolean;
}

/**
 * Custom hook for using global search functionality
 * @param entity The entity type ('departments', 'employees', etc.)
 * @param data The array of data to search/filter
 * @param config Search configuration
 */
function useGlobalSearch<
    T extends SearchableEntity,
    F extends Partial<Record<keyof T, string | number | boolean | null>>
>(entity: EntityType, data: T[] | readonly T[] | undefined, config: SearchConfig<T, F>) {
    const dispatch = useDispatch();
    const globalSearchState = useSelector((state: RootState) => state.globalSearch);

    // Get entity-specific state
    const searchQuery = globalSearchState.queries[entity];
    const filters = globalSearchState.filters[entity] as F;
    const { currentPage, itemsPerPage } = globalSearchState.pagination[entity];

    // Filter data based on search query and filters
    const filteredData = useMemo(() => {
        // Ensure data is an array before applying filter
        const dataArray = Array.isArray(data) ? data : [];

        return dataArray.filter((item) => {
            // Search query filtering
            const matchesSearch =
                !searchQuery ||
                config.searchFields.some((field) => {
                    const value = item[field];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(searchQuery.toLowerCase());
                    }
                    if (typeof value === 'number') {
                        return value.toString().includes(searchQuery);
                    }
                    return false;
                });

            // Filter criteria
            let matchesFilters = true;

            // Use custom filter function if provided
            if (config.customFilterFn) {
                matchesFilters = config.customFilterFn(item, filters);
            } else {
                // Standard filtering
                for (const key in filters) {
                    const filterValue = filters[key];
                    if (filterValue !== null && filterValue !== undefined) {
                        if (item[key as keyof T] !== filterValue) {
                            matchesFilters = false;
                            break;
                        }
                    }
                }
            }

            return matchesSearch && matchesFilters;
        });
    }, [data, searchQuery, filters, config]);

    // Paginate the filtered results
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Calculate total number of pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / itemsPerPage);
    }, [filteredData.length, itemsPerPage]);

    // Action handlers
    const handleSearch = (query: string) => {
        dispatch(setSearchQuery({ entity, query }));
    };

    const handleFilter = (
        filterKey: string,
        value: string | number | boolean | null
    ) => {
        dispatch(setFilter({ entity, filterKey, value }));
    };

    const handleResetFilters = () => {
        dispatch(resetFilters(entity));
    };

    const handlePageChange = (page: number) => {
        dispatch(setCurrentPage({ entity, page }));
    };

    const handleItemsPerPageChange = (count: number) => {
        dispatch(setItemsPerPage({ entity, count }));
    };

    const handleResetSearch = () => {
        dispatch(resetEntitySearch(entity));
    };

    return {
        // Current state
        searchQuery,
        filters,
        currentPage,
        itemsPerPage,

        // Filtered and paginated data
        filteredData,
        paginatedData,
        totalItems: filteredData.length,
        totalPages,

        // Handlers
        handleSearch,
        handleFilter,
        handleResetFilters,
        handlePageChange,
        handleItemsPerPageChange,
        handleResetSearch,
    };
}

export default useGlobalSearch;