import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://e-commerce-hnf5hxengjeeatfg.canadacentral-01.azurewebsites.net/api";

// Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message: string }>) => {
    const message = error.response?.data?.message || "Request failed";
    throw new Error(message);
  }
);

// Query Keys
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  products: {
    all: (params?: Record<string, string>) => ["products", params] as const,
    featured: ["products", "featured"] as const,
    newArrivals: ["products", "new-arrivals"] as const,
    bestSellers: ["products", "best-sellers"] as const,
    bySlug: (slug: string) => ["products", slug] as const,
  },
  cart: {
    get: ["cart"] as const,
    summary: ["cart", "summary"] as const,
  },
  wishlist: {
    get: ["wishlist"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
  },
  reviews: {
    byProduct: (productId: string | number) =>
      ["reviews", "product", productId] as const,
  },
  orders: {
    my: ["orders", "my"] as const,
    byNumber: (orderNumber: string) => ["orders", orderNumber] as const,
    all: ["orders"] as const,
  },
  payments: {
    mpesaStatus: (checkoutRequestId: string) =>
      ["payments", "mpesa", checkoutRequestId] as const,
    cryptoStatus: (chargeId: string) =>
      ["payments", "crypto", chargeId] as const,
    orderStatus: (orderId: string) => ["payments", "order", orderId] as const,
    all: ["payments"] as const,
  },
};

// API functions
export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      axiosInstance.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", data),
    logout: () => axiosInstance.post("/auth/logout"),
    getMe: () => axiosInstance.get("/auth/me"),
    forgotPassword: (email: string) =>
      axiosInstance.post("/auth/forgot-password", { email }),
    resetPassword: (data: { token: string; password: string }) =>
      axiosInstance.post("/auth/reset-password", data),
    updateProfile: (data: { name: string; email: string }) =>
      axiosInstance.put("/auth/profile", data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      axiosInstance.put("/auth/change-password", data),
  },
  products: {
    getAll: (params?: Record<string, string>) =>
      axiosInstance.get("/products", { params }),
    getFeatured: () => axiosInstance.get("/products/featured"),
    getNewArrivals: () => axiosInstance.get("/products/new-arrivals"),
    getBestSellers: () => axiosInstance.get("/products/best-sellers"),
    getBySlug: (slug: string) => axiosInstance.get(`/products/${slug}`),
    create: (data: any) =>
      axiosInstance.post("/products", data, {
        headers:
          data instanceof FormData
            ? {}
            : { "Content-Type": "application/json" },
      }),

    update: (id: string, data: any) =>
      axiosInstance.put(`/products/${id}`, data, {
        headers:
          data instanceof FormData
            ? {}
            : { "Content-Type": "application/json" },
      }),

    delete: (id: string) => axiosInstance.delete(`/products/${id}`),
  },
  cart: {
    get: () => axiosInstance.get("/cart"),
    getSummary: () => axiosInstance.get("/cart/summary"),
    add: (data: { productId: any; quantity: number }) =>
      axiosInstance.post("/cart/add", data),
    update: (id: string, quantity: number) =>
      axiosInstance.put(`/cart/${id}`, { quantity }),
    remove: (id: string) => axiosInstance.delete(`/cart/${id}`),
    clear: () => axiosInstance.delete("/cart"),
  },
  wishlist: {
    get: () => axiosInstance.get("/wishlist"),
    add: (productId: string | number) =>
      axiosInstance.post("/wishlist", { productId }),
    remove: (productId: string | number) =>
      axiosInstance.delete(`/wishlist/${productId}`),
  },
  addresses: {
    getAll: () => axiosInstance.get("/addresses"),
    create: (data: any) => axiosInstance.post("/addresses", data),
    update: (id: string, data: any) =>
      axiosInstance.put(`/addresses/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/addresses/${id}`),
    setDefault: (id: string) =>
      axiosInstance.put(`/addresses/${id}/set-default`),
  },
  reviews: {
    getByProduct: (productId: string | number) =>
      axiosInstance.get(`/reviews/product/${productId}`),
    create: (data: any) => axiosInstance.post("/reviews", data),
    update: (id: string, data: any) =>
      axiosInstance.put(`/reviews/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/reviews/${id}`),
    approve: (id: string) => axiosInstance.put(`/reviews/${id}/approve`),
  },
  orders: {
    create: (data: any) => axiosInstance.post("/orders", data),
    getMyOrders: () => axiosInstance.get("/orders/my-orders"),
    getByOrderNumber: (orderNumber: string) =>
      axiosInstance.get(`/orders/${orderNumber}`),
    getAll: () => axiosInstance.get("/orders"),
    updateStatus: (id: string, status: string) =>
      axiosInstance.put(`/orders/${id}/status`, { status }),
  },
  payments: {
    mpesa: {
      initiate: (data: { phone: string; orderId: any }) =>
        axiosInstance.post("/payments/mpesa/initiate", data),
      getStatus: (checkoutRequestId: string) =>
        axiosInstance.get(`/payments/mpesa/status/${checkoutRequestId}`),
    },
    crypto: {
      initiate: (data: { orderId: any }) =>
        axiosInstance.post("/payments/crypto/initiate", data),
      getStatus: (chargeId: string) =>
        axiosInstance.get(`/payments/crypto/status/${chargeId}`),
      cancel: (chargeId: string) =>
        axiosInstance.post(`/payments/crypto/cancel/${chargeId}`),
    },
    getOrderStatus: (orderId: string) =>
      axiosInstance.get(`/payments/order/${orderId}/status`),
    confirmPayment: (id: string) =>
      axiosInstance.post(`/payments/${id}/confirm`),
    getAllPayments: () => axiosInstance.get("/payments"),
  },
};

// React Query Hooks
export const useAuth = {
  me: () => useQuery({ queryKey: queryKeys.auth.me, queryFn: api.auth.getMe }),
  register: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.auth.register,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      },
    });
  },
  login: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.auth.login,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      },
    });
  },
  logout: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.auth.logout,
      onSuccess: () => {
        queryClient.clear();
      },
    });
  },
  forgotPassword: () => useMutation({ mutationFn: api.auth.forgotPassword }),
  resetPassword: () => useMutation({ mutationFn: api.auth.resetPassword }),
  updateProfile: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.auth.updateProfile,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      },
    });
  },
  changePassword: () => useMutation({ mutationFn: api.auth.changePassword }),
};

export const useProducts = {
  all: (params?: Record<string, string>) =>
    useQuery<any>({
      queryKey: queryKeys.products.all(params),
      queryFn: () => api.products.getAll(params),
    }),
  featured: () =>
    useQuery<any>({
      queryKey: queryKeys.products.featured,
      queryFn: api.products.getFeatured,
    }),
  newArrivals: () =>
    useQuery<any>({
      queryKey: queryKeys.products.newArrivals,
      queryFn: api.products.getNewArrivals,
    }),
  bestSellers: () =>
    useQuery<any>({
      queryKey: queryKeys.products.bestSellers,
      queryFn: api.products.getBestSellers,
    }),
  bySlug: (slug: string) =>
    useQuery<any>({
      queryKey: queryKeys.products.bySlug(slug),
      queryFn: () => api.products.getBySlug(slug),
      enabled: !!slug,
    }),
  create: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.products.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
    });
  },
  update: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        api.products.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
    });
  },
  delete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.products.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
    });
  },
};

export const useCart = {
  get: () =>
    useQuery<any>({ queryKey: queryKeys.cart.get, queryFn: api.cart.get }),
  summary: () =>
    useQuery<any>({
      queryKey: queryKeys.cart.summary,
      queryFn: api.cart.getSummary,
    }),
  add: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.cart.add,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.get });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary });
      },
    });
  },
  update: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
        api.cart.update(id, quantity),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.get });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary });
      },
    });
  },
  remove: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.cart.remove,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.get });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary });
      },
    });
  },
  clear: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.cart.clear,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.get });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary });
      },
    });
  },
};

export const useWishlist = {
  get: () =>
    useQuery<any>({
      queryKey: queryKeys.wishlist.get,
      queryFn: api.wishlist.get,
    }),
  add: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.wishlist.add,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.get });
      },
    });
  },
  remove: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.wishlist.remove,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.get });
      },
    });
  },
};

export const useAddresses = {
  all: () =>
    useQuery<any>({
      queryKey: queryKeys.addresses.all,
      queryFn: api.addresses.getAll,
    }),
  create: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.addresses.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      },
    });
  },
  update: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        api.addresses.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      },
    });
  },
  delete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.addresses.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      },
    });
  },
  setDefault: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.addresses.setDefault,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      },
    });
  },
};

export const useReviews = {
  byProduct: (productId: string | number) =>
    useQuery<any>({
      queryKey: queryKeys.reviews.byProduct(productId),
      queryFn: () => api.reviews.getByProduct(productId),
      enabled: !!productId,
    }),
  create: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.reviews.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      },
    });
  },
  update: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        api.reviews.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      },
    });
  },
  delete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.reviews.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      },
    });
  },
  approve: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.reviews.approve,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      },
    });
  },
};

export const useOrders = {
  my: () =>
    useQuery<any>({
      queryKey: queryKeys.orders.my,
      queryFn: api.orders.getMyOrders,
    }),
  byNumber: (orderNumber: string) =>
    useQuery<any>({
      queryKey: queryKeys.orders.byNumber(orderNumber),
      queryFn: () => api.orders.getByOrderNumber(orderNumber),
      enabled: !!orderNumber,
    }),
  all: () =>
    useQuery<any>({
      queryKey: queryKeys.orders.all,
      queryFn: api.orders.getAll,
    }),
  create: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.orders.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.get });
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.summary });
      },
    });
  },
  updateStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
        api.orders.updateStatus(orderId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    });
  },
};

export const usePayments = {
  mpesaInitiate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.payments.mpesa.initiate,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    });
  },
  mpesaStatus: (checkoutRequestId: string) =>
    useQuery({
      queryKey: queryKeys.payments.mpesaStatus(checkoutRequestId),
      queryFn: () => api.payments.mpesa.getStatus(checkoutRequestId),
      enabled: !!checkoutRequestId,
      refetchInterval: 3000, // Poll every 3 seconds
    }),
  cryptoInitiate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.payments.crypto.initiate,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    });
  },
  cryptoStatus: (chargeId: string) =>
    useQuery({
      queryKey: queryKeys.payments.cryptoStatus(chargeId),
      queryFn: () => api.payments.crypto.getStatus(chargeId),
      enabled: !!chargeId,
      refetchInterval: 5000, // Poll every 5 seconds
    }),
  cryptoCancel: () => useMutation({ mutationFn: api.payments.crypto.cancel }),
  orderStatus: (orderId: string) =>
    useQuery({
      queryKey: queryKeys.payments.orderStatus(orderId),
      queryFn: () => api.payments.getOrderStatus(orderId),
      enabled: !!orderId,
    }),
  confirmPayment: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.payments.confirmPayment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["payments"] });
      },
    });
  },
  all: () =>
    useQuery<any>({
      queryKey: queryKeys.payments.all,
      queryFn: api.payments.getAllPayments,
    }),
};

export { axiosInstance };
