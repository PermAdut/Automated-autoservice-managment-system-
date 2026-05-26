import { baseApi } from './baseApi';

export interface LoyaltyProgram {
  id: string;
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  programId: string;
  orderId?: string;
  type: 'earn' | 'bonus' | 'spend' | 'adjustment';
  points: number;
  description?: string;
  createdAt: string;
}

export const loyaltyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLoyalty: builder.query<LoyaltyProgram | null, void>({
      query: () => '/promotions/loyalty/my',
      providesTags: ['Loyalty'],
    }),
    getLoyaltyByUser: builder.query<LoyaltyProgram | null, string>({
      query: (userId) => `/promotions/loyalty/user/${userId}`,
      providesTags: ['Loyalty'],
    }),
    getMyLoyaltyTransactions: builder.query<LoyaltyTransaction[], void>({
      query: () => '/promotions/loyalty/my/transactions',
      providesTags: ['Loyalty'],
    }),
    getActiveDiscounts: builder.query<{ id: string; name: string; code?: string; type: string; value: string; endDate: string }[], void>({
      query: () => '/promotions/discounts/active',
      providesTags: ['Loyalty'],
    }),
  }),
});

export const {
  useGetMyLoyaltyQuery,
  useGetLoyaltyByUserQuery,
  useGetMyLoyaltyTransactionsQuery,
  useGetActiveDiscountsQuery,
} = loyaltyApi;
