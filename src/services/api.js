// client/src/services/api.js - Updated API service methods for CRM features
import axios from 'axios';

const API_BASE_URL = 'https://caution-mayblabla.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Party/Client API methods with enhanced CRM features
export const partyService = {
  // Get all parties with advanced filtering
  getAll: (queryString = '') => api.get(`/parties${queryString}`),
  
  // Get single party by ID with full details
  getById: (id) => api.get(`/parties/${id}`),
  
  // Get party by partyId
  getByPartyId: (partyId) => api.get(`/parties/partyId/${partyId}`),
  
  // Create new party
  create: (partyData) => api.post('/parties', partyData),
  
  // Update party with change tracking
  update: (id, partyData) => api.put(`/parties/${id}`, partyData),
  
  // Delete party
  delete: (id) => api.delete(`/parties/${id}`),
  
  // CRM-specific methods
  
  // Add comment/note to party
  addComment: (id, commentData) => api.post(`/parties/${id}/comments`, commentData),
  
  // Add follow-up to party
  addFollowUp: (id, followUpData) => api.post(`/parties/${id}/follow-ups`, followUpData),
  
  // Complete follow-up
  completeFollowUp: (id, followUpId, completionData) => 
    api.put(`/parties/${id}/follow-ups/${followUpId}/complete`, completionData),
  
  // Get today's follow-ups
  getTodaysFollowUps: () => api.get('/parties/follow-ups/today'),
  
  // Get overdue follow-ups
  getOverdueFollowUps: () => api.get('/parties/follow-ups/overdue'),
  
  // Get party statistics
  getStats: () => api.get('/parties/stats'),
  
  // Bulk operations
  bulkUpdate: (partyIds, updateData) => 
    api.put('/parties/bulk-update', { partyIds, updateData }),
  
  // Export parties
  exportToCSV: (filters = {}) => 
    api.get('/parties/export/csv', { params: filters, responseType: 'blob' }),
  
  // Import parties
  importFromCSV: (formData) => 
    api.post('/parties/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Advanced search
  search: (searchParams) => api.post('/parties/search', searchParams),
  
  // Get party activity timeline
  getActivityTimeline: (id) => api.get(`/parties/${id}/activity`),
  
  // Archive/Restore party
  archive: (id) => api.put(`/parties/${id}/archive`),
  restore: (id) => api.put(`/parties/${id}/restore`),
  
  // Merge parties
  merge: (primaryId, secondaryIds) => 
    api.post(`/parties/${primaryId}/merge`, { secondaryIds }),
  
  // Get related quotations summary
  getQuotationsSummary: (id) => api.get(`/parties/${id}/quotations/summary`)
};

// Quotation API methods (enhanced)
export const quotationService = {
  getAll: () => api.get('/quotations'),
  getById: (id) => api.get(`/quotations/${id}`),
  getByParty: (partyId) => api.get(`/quotations/party/${partyId}`),
  create: (quotationData) => api.post('/quotations', quotationData),
  update: (id, quotationData) => api.put(`/quotations/${id}`, quotationData),
  delete: (id) => api.delete(`/quotations/${id}`),
  
  // Enhanced quotation methods
  duplicate: (id) => api.post(`/quotations/${id}/duplicate`),
  revise: (id, revisionData) => api.post(`/quotations/${id}/revise`, revisionData),
  updateStatus: (id, status, note) => api.put(`/quotations/${id}/status`, { status, note }),
  
  // PDF operations
  generatePDF: (id) => api.get(`/quotations/${id}/pdf`, { responseType: 'blob' }),
  emailPDF: (id, emailData) => api.post(`/quotations/${id}/email`, emailData),
  
  // Analytics
  getStats: () => api.get('/quotations/stats'),
  getConversionRate: () => api.get('/quotations/conversion-rate')
};

// Component/Product API methods
export const componentService = {
  getAll: () => api.get('/components'),
  getById: (id) => api.get(`/components/${id}`),
  create: (componentData) => api.post('/components', componentData),
  update: (id, componentData) => api.put(`/components/${id}`, componentData),
  delete: (id) => api.delete(`/components/${id}`),
  
  // Enhanced component methods
  search: (query) => api.get(`/components/search?q=${encodeURIComponent(query)}`),
  getByCategory: (category) => api.get(`/components/category/${category}`),
  updatePricing: (id, pricingData) => api.put(`/components/${id}/pricing`, pricingData),
  
  // Bulk operations
  bulkImport: (formData) => 
    api.post('/components/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  exportToCSV: () => api.get('/components/export/csv', { responseType: 'blob' })
};

// User/Authentication API methods (for future implementation)
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  
  // Profile management
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword })
};

// Dashboard/Analytics API methods
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getUpcomingTasks: () => api.get('/dashboard/upcoming-tasks'),
  
  // Analytics
  getSalesMetrics: (period = '30d') => api.get(`/dashboard/sales-metrics?period=${period}`),
  getClientMetrics: (period = '30d') => api.get(`/dashboard/client-metrics?period=${period}`),
  getQuotationMetrics: (period = '30d') => api.get(`/dashboard/quotation-metrics?period=${period}`),
  
  // Reports
  generateReport: (reportType, filters) => 
    api.post('/dashboard/reports/generate', { reportType, filters }),
  getReportHistory: () => api.get('/dashboard/reports/history')
};

// Notification API methods
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  
  // Preferences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences)
};

// Settings API methods
export const settingsService = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
  
  // Specific setting categories
  getCompanyInfo: () => api.get('/settings/company'),
  updateCompanyInfo: (companyData) => api.put('/settings/company', companyData),
  
  getEmailTemplates: () => api.get('/settings/email-templates'),
  updateEmailTemplate: (templateId, templateData) => 
    api.put(`/settings/email-templates/${templateId}`, templateData),
  
  getPDFSettings: () => api.get('/settings/pdf'),
  updatePDFSettings: (pdfSettings) => api.put('/settings/pdf', pdfSettings)
};

// File upload utilities
export const fileService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/files/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/files/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteFile: (fileId) => api.delete(`/files/${fileId}`)
};
export const brandService = {
  getAll: async () => {
    try {
      return await api.get('/brands');
    } catch (error) {
      // Fallback: might be using components endpoint instead
      try {
        return await api.get('/components');
      } catch (fallbackError) {
        console.warn('Brand/Component API not implemented yet');
        return { data: [] };
      }
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/brands/${id}`);
    } catch (error) {
      console.warn('Brand detail API not implemented yet');
      throw new Error('Brand detail feature coming soon');
    }
  },
  
  create: async (brandData) => {
    try {
      return await api.post('/brands', brandData);
    } catch (error) {
      console.warn('Create brand API not implemented yet');
      throw new Error('Create brand feature coming soon');
    }
  },
  
  update: async (id, brandData) => {
    try {
      return await api.put(`/brands/${id}`, brandData);
    } catch (error) {
      console.warn('Update brand API not implemented yet');
      throw new Error('Update brand feature coming soon');
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/brands/${id}`);
    } catch (error) {
      console.warn('Delete brand API not implemented yet');
      throw new Error('Delete brand feature coming soon');
    }
  },
  
  search: async (query) => {
    try {
      return await api.get(`/brands/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      // Fallback to get all and filter client-side
      try {
        const response = await api.get('/brands');
        const filteredData = response.data.filter(item => 
          item.name?.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        );
        return { data: filteredData };
      } catch (fallbackError) {
        console.warn('Brand search API not implemented yet');
        return { data: [] };
      }
    }
  }
};

// Category API methods (if needed)
export const categoryService = {
  getAll: async () => {
    try {
      return await api.get('/categories');
    } catch (error) {
      console.warn('Category API not implemented yet');
      return { data: [] };
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/categories/${id}`);
    } catch (error) {
      console.warn('Category detail API not implemented yet');
      throw new Error('Category detail feature coming soon');
    }
  },
  
  create: async (categoryData) => {
    try {
      return await api.post('/categories', categoryData);
    } catch (error) {
      console.warn('Create category API not implemented yet');
      throw new Error('Create category feature coming soon');
    }
  },
  
  update: async (id, categoryData) => {
    try {
      return await api.put(`/categories/${id}`, categoryData);
    } catch (error) {
      console.warn('Update category API not implemented yet');
      throw new Error('Update category feature coming soon');
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/categories/${id}`);
    } catch (error) {
      console.warn('Delete category API not implemented yet');
      throw new Error('Delete category feature coming soon');
    }
  }
};

// Model API methods (alias for componentService for backward compatibility)
export const modelService = {
  getAll: async () => {
    try {
      return await api.get('/models');
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.getAll();
      } catch (fallbackError) {
        console.warn('Model/Component API not implemented yet');
        return { data: [] };
      }
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/models/${id}`);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.getById(id);
      } catch (fallbackError) {
        console.warn('Model detail API not implemented yet');
        throw new Error('Model detail feature coming soon');
      }
    }
  },
  
  create: async (modelData) => {
    try {
      return await api.post('/models', modelData);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.create(modelData);
      } catch (fallbackError) {
        console.warn('Create model API not implemented yet');
        throw new Error('Create model feature coming soon');
      }
    }
  },
  
  update: async (id, modelData) => {
    try {
      return await api.put(`/models/${id}`, modelData);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.update(id, modelData);
      } catch (fallbackError) {
        console.warn('Update model API not implemented yet');
        throw new Error('Update model feature coming soon');
      }
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/models/${id}`);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.delete(id);
      } catch (fallbackError) {
        console.warn('Delete model API not implemented yet');
        throw new Error('Delete model feature coming soon');
      }
    }
  },
  
  search: async (query) => {
    try {
      return await api.get(`/models/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      // Fallback to components search
      try {
        return await componentService.search(query);
      } catch (fallbackError) {
        console.warn('Model search API not implemented yet');
        return { data: [] };
      }
    }
  },
  
  getByCategory: async (categoryId) => {
    try {
      return await api.get(`/models/category/${categoryId}`);
    } catch (error) {
      console.warn('Models by category API not implemented yet');
      return { data: [] };
    }
  },
  
  getByBrand: async (brandId) => {
    try {
      return await api.get(`/models/brand/${brandId}`);
    } catch (error) {
      console.warn('Models by brand API not implemented yet');
      return { data: [] };
    }
  }
};

// Export all services
export default {
  partyService,
  quotationService,
  componentService,
  brandService,
  categoryService,
  modelService,
  authService,
  dashboardService,
  notificationService,
  settingsService,
  fileService
};