import axios from 'axios';
import {
  IDashboardSummary,
  IRatingTrendItem,
  ICategoryDistributionItem,
  ISentimentTrendItem,
  IReview,
  IIssue,
  ITask,
  IExperiment,
  IAskResponse,
  IExecutiveReport,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pulseApi = {
  // System Health
  async getHealth() {
    const { data } = await api.get('/health');
    return data;
  },

  // Dashboard
  async getSummary(params?: { startDate?: string; endDate?: string; platform?: string }) {
    const { data } = await api.get<{ success: boolean; data: IDashboardSummary }>('/dashboard/summary', { params });
    return data.data;
  },

  async getRatingTrend(params?: { startDate?: string; endDate?: string; platform?: string; granularity?: string }) {
    const { data } = await api.get<{ success: boolean; data: IRatingTrendItem[] }>('/dashboard/rating-trend', { params });
    return data.data;
  },

  async getCategoryDistribution(params?: { startDate?: string; endDate?: string; platform?: string }) {
    const { data } = await api.get<{ success: boolean; data: ICategoryDistributionItem[] }>('/dashboard/category-distribution', { params });
    return data.data;
  },

  async getSentimentTrend(params?: { startDate?: string; endDate?: string; platform?: string }) {
    const { data } = await api.get<{ success: boolean; data: ISentimentTrendItem[] }>('/dashboard/sentiment-trend', { params });
    return data.data;
  },

  // Reviews
  async getReviews(params?: {
    page?: number;
    limit?: number;
    rating?: string;
    platform?: string;
    sentiment?: string;
    category?: string;
    severity?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { data } = await api.get<{
      success: boolean;
      data: {
        reviews: IReview[];
        pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
      };
    }>('/reviews', { params });
    return data.data;
  },

  async getReviewById(id: string) {
    const { data } = await api.get<{ success: boolean; data: IReview }>(`/reviews/${id}`);
    return data.data;
  },

  async classifyReview(id: string) {
    const { data } = await api.post(`/reviews/${id}/classify`);
    return data.data;
  },

  async updateReviewClassification(id: string, updates: Partial<IReview>) {
    const { data } = await api.patch(`/reviews/${id}/classification`, updates);
    return data.data;
  },

  // Issues
  async getIssues(params?: { status?: string; severity?: string; category?: string }) {
    const { data } = await api.get<{ success: boolean; data: IIssue[] }>('/issues', { params });
    return data.data;
  },

  async getIssueById(id: string) {
    const { data } = await api.get<{ success: boolean; data: IIssue }>(`/issues/${id}`);
    return data.data;
  },

  async updateIssue(id: string, updates: Partial<IIssue>) {
    const { data } = await api.patch(`/issues/${id}`, updates);
    return data.data;
  },

  async generateTaskFromIssue(id: string) {
    const { data } = await api.post<{ success: boolean; data: ITask }>(`/issues/${id}/generate-task`);
    return data.data;
  },

  // Tasks
  async getTasks(params?: { status?: string; priority?: string }) {
    const { data } = await api.get<{ success: boolean; data: ITask[] }>('/tasks', { params });
    return data.data;
  },

  async createTask(task: Partial<ITask>) {
    const { data } = await api.post<{ success: boolean; data: ITask }>('/tasks', task);
    return data.data;
  },

  async updateTask(id: string, updates: Partial<ITask>) {
    const { data } = await api.patch<{ success: boolean; data: ITask }>(`/tasks/${id}`, updates);
    return data.data;
  },

  // Experiments
  async getExperiments() {
    const { data } = await api.get<{ success: boolean; data: IExperiment[] }>('/experiments');
    return data.data;
  },

  async updateExperiment(id: string, updates: Partial<IExperiment>) {
    const { data } = await api.patch<{ success: boolean; data: IExperiment }>(`/experiments/${id}`, updates);
    return data.data;
  },

  // AI & Query Assistant
  async askQuestion(question: string) {
    const { data } = await api.post<{ success: boolean; data: IAskResponse }>('/insights/ask', { question });
    return data.data;
  },

  async analyzeInsights(reviewIds?: string[]) {
    const { data } = await api.post('/insights/analyze', { reviewIds });
    return data.data;
  },

  // Data Sources & Reports
  async getDataSources() {
    const { data } = await api.get('/data-sources');
    return data.data;
  },

  async getExecutiveReport(params?: { startDate?: string; endDate?: string }) {
    const { data } = await api.get<{ success: boolean; data: IExecutiveReport }>('/reports/summary', { params });
    return data.data;
  },

  getExportReviewsUrl() {
    return '/api/exports/reviews';
  },
};

export default api;
