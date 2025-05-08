// src/state/slices/searchSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define entity types
export type EntityType = 'departments' | 'employees' | 'jobTitles' | 'jobCategories';

// Generic filter type that can be extended for specific entities
export interface BaseFilter {
    [key: string]: string | number | boolean | null | undefined;
}

// Specific entity filters
export interface DepartmentFilter extends BaseFilter {
    category?: string | null;
    parentDepartment?: string | null;
}

export interface EmployeeFilter extends BaseFilter {
    department?: string | null;
    jobTitle?: string | null;
    status?: 'active' | 'inactive' | null;
}

export interface JobTitleFilter extends BaseFilter {
    department?: string | null;
    category?: string | null;
}

export interface JobCategoryFilter extends BaseFilter {
    type?: string | null;
}

// Define the state interface with generic filters
interface GlobalSearchState {
    activeEntity: EntityType;
    queries: {
        [key in EntityType]: string;
    };
    filters: {
        departments: DepartmentFilter;
        employees: EmployeeFilter;
        jobTitles: JobTitleFilter;
        jobCategories: JobCategoryFilter;
    };
    pagination: {
        [key in EntityType]: {
            currentPage: number;
            itemsPerPage: number;
        };
    };
}

// Export for type usage in components
export type { GlobalSearchState };

// Initial state with empty filters for all entity types
const initialState: GlobalSearchState = {
    activeEntity: 'departments',
    queries: {
        departments: '',
        employees: '',
        jobTitles: '',
        jobCategories: '',
    },
    filters: {
        departments: {},
        employees: {},
        jobTitles: {},
        jobCategories: {},
    },
    pagination: {
        departments: {
            currentPage: 1,
            itemsPerPage: 10,
        },
        employees: {
            currentPage: 1,
            itemsPerPage: 10,
        },
        jobTitles: {
            currentPage: 1,
            itemsPerPage: 10,
        },
        jobCategories: {
            currentPage: 1,
            itemsPerPage: 10,
        },
    },
};

const globalSearchSlice = createSlice({
    name: 'globalSearch',
    initialState,
    reducers: {
        // Set the active entity type
        setActiveEntity(state, action: PayloadAction<EntityType>) {
            state.activeEntity = action.payload;
        },

        // Set search query for a specific entity
        setSearchQuery(state, action: PayloadAction<{ entity: EntityType; query: string }>) {
            const { entity, query } = action.payload;
            state.queries[entity] = query;
            state.pagination[entity].currentPage = 1; // Reset to first page when searching
        },

        // Set filter for a specific entity
        setFilter(state, action: PayloadAction<{
            entity: EntityType;
            filterKey: string;
            value: string | number | boolean | null;
        }>) {
            const { entity, filterKey, value } = action.payload;
            state.filters[entity] = {
                ...state.filters[entity],
                [filterKey]: value,
            };
            state.pagination[entity].currentPage = 1; // Reset to first page when filtering
        },

        // Reset all filters for a specific entity
        resetFilters(state, action: PayloadAction<EntityType>) {
            const entity = action.payload;
            state.filters[entity] = {};
            state.pagination[entity].currentPage = 1;
        },

        // Pagination actions
        setCurrentPage(state, action: PayloadAction<{ entity: EntityType; page: number }>) {
            const { entity, page } = action.payload;
            state.pagination[entity].currentPage = page;
        },

        setItemsPerPage(state, action: PayloadAction<{ entity: EntityType; count: number }>) {
            const { entity, count } = action.payload;
            state.pagination[entity].itemsPerPage = count;
            state.pagination[entity].currentPage = 1; // Reset to first page
        },

        // Reset everything for a specific entity
        resetEntitySearch(state, action: PayloadAction<EntityType>) {
            const entity = action.payload;
            state.queries[entity] = '';
            state.filters[entity] = {};
            state.pagination[entity] = {
                currentPage: 1,
                itemsPerPage: 10,
            };
        },

        // Reset the entire search state
        resetAllSearch() {
            return initialState;
        },
    },
});

export const {
    setActiveEntity,
    setSearchQuery,
    setFilter,
    resetFilters,
    setCurrentPage,
    setItemsPerPage,
    resetEntitySearch,
    resetAllSearch,
} = globalSearchSlice.actions;

export default globalSearchSlice.reducer