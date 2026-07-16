import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

// Define the Package type based on the API response
export type Package = {
  _id: string;
  coins: number;
  price: number;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PackageListResponse = {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: Package[];
};

export type PackageSingleResponse = {
  success: boolean;
  message: string;
  data: Package;
};

const packageSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get packages with pagination
    getPackages: builder.query<PackageListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/package",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: [TagTypes.package],
    }),

    // Get single package by ID
    getPackage: builder.query<PackageSingleResponse, string>({
      query: (id) => ({
        url: `/package/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: TagTypes.package, id }],
    }),

    // Create a new package
    createPackage: builder.mutation<PackageSingleResponse, Partial<Omit<Package, '_id' | 'createdAt' | 'updatedAt'>>>({
      query: (data) => ({
        url: "/package",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.package],
    }),

    // Update an existing package
    updatePackage: builder.mutation<PackageSingleResponse, { id: string; data: Partial<Omit<Package, '_id' | 'createdAt' | 'updatedAt'>> }>({
      query: ({ id, data }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: TagTypes.package, id }, TagTypes.package],
    }),

    // Delete a package
    deletePackage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.package],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageSlice;
