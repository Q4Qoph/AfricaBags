const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://e-commerce-hnf5hxengjeeatfg.canadacentral-01.azurewebsites.net';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      fetchApi('/auth/logout', {
        method: 'POST',
      }),
    getMe: () => fetchApi('/auth/me'),
    forgotPassword: (email: string) =>
      fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (data: { token: string; password: string }) =>
      fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProfile: (data: { name: string; email: string }) =>
      fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      fetchApi('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  products: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/products${query}`);
    },
    getFeatured: () => fetchApi('/products/featured'),
    getNewArrivals: () => fetchApi('/products/new-arrivals'),
    getBestSellers: () => fetchApi('/products/best-sellers'),
    getBySlug: (slug: string) => fetchApi(`/products/${slug}`),
    create: (data: any) =>
      fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  cart: {
    get: () => fetchApi('/cart'),
    getSummary: () => fetchApi('/cart/summary'),
    add: (data: { productId: any; quantity: number }) =>
      fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, quantity: number) =>
      fetchApi(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    remove: (id: string) =>
      fetchApi(`/cart/${id}`, {
        method: 'DELETE',
      }),
    clear: () =>
      fetchApi('/cart', {
        method: 'DELETE',
      }),
  },

  wishlist: {
    get: () => fetchApi('/wishlist'),
    add: (productId: string | number) =>
      fetchApi('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),
    remove: (productId: string | number) =>
      fetchApi(`/wishlist/${productId}`, {
        method: 'DELETE',
      }),
  },

  addresses: {
    getAll: () => fetchApi('/addresses'),
    create: (data: any) =>
      fetchApi('/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi(`/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi(`/addresses/${id}`, {
        method: 'DELETE',
      }),
    setDefault: (id: string) =>
      fetchApi(`/addresses/${id}/set-default`, {
        method: 'PUT',
      }),
  },

  reviews: {
    getByProduct: (productId: string | number) => fetchApi(`/reviews/product/${productId}`),
    create: (data: any) =>
      fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi(`/reviews/${id}`, {
        method: 'DELETE',
      }),
    approve: (id: string) =>
      fetchApi(`/reviews/${id}/approve`, {
        method: 'PUT',
      }),
  },

  orders: {
    create: (data: any) =>
      fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyOrders: () => fetchApi('/orders/my-orders'),
    getByOrderNumber: (orderNumber: string) =>
      fetchApi(`/orders/${orderNumber}`),
    getAll: () => fetchApi('/orders'),
    updateStatus: (id: string, status: string) =>
      fetchApi(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  payments: {
    mpesa: {
      initiate: (data: { phone: string; amount: number; orderId: string }) =>
        fetchApi('/payments/mpesa/initiate', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      getStatus: (checkoutRequestId: string) =>
        fetchApi(`/payments/mpesa/status/${checkoutRequestId}`),
    },
    crypto: {
      initiate: (data: { currency: string; amount: number; orderId: string }) =>
        fetchApi('/payments/crypto/initiate', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      getStatus: (chargeId: string) =>
        fetchApi(`/payments/crypto/status/${chargeId}`),
      cancel: (chargeId: string) =>
        fetchApi(`/payments/crypto/cancel/${chargeId}`, {
          method: 'POST',
        }),
    },
    getOrderStatus: (orderId: string) =>
      fetchApi(`/payments/order/${orderId}/status`),
    confirmPayment: (id: string) =>
      fetchApi(`/payments/${id}/confirm`, {
        method: 'POST',
      }),
    getAllPayments: () => fetchApi('/payments'),
  },
};

export { ApiError };
