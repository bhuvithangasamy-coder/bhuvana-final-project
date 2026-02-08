// API Service for ResumeAI Frontend
// This service handles all HTTP requests with JWT authentication

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
  message: string;
  [key: string]: any;
}

class ApiService {
  // Get JWT token from localStorage
  private static getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get authorization headers
  private static getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Generic fetch wrapper with error handling
  private static async request<T>(
    endpoint: string,
    method: string,
    body?: Record<string, any>
  ): Promise<T> {
    try {
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear localStorage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  static async register(username: string, email: string, password: string) {
    return this.request<ApiResponse<any>>('/auth/register', 'POST', { username, email, password });
  }

  static async login(email: string, password: string) {
    return this.request<ApiResponse<any>>('/auth/login', 'POST', { email, password });
  }

  static async getProfile() {
    return this.request<ApiResponse<any>>('/auth/profile', 'GET');
  }

  static async verifyToken() {
    return this.request<ApiResponse<any>>('/auth/verify-token', 'GET');
  }

  // ==================== RESUME ENDPOINTS ====================

  static async uploadResume(file: File): Promise<ApiResponse<any>> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.message || 'Resume upload failed');
    }

    return response.json();
  }

  static async getResume() {
    return this.request<ApiResponse<any>>('/resume/get', 'GET');
  }

  static async deleteResume() {
    return this.request<ApiResponse<any>>('/resume/delete', 'DELETE');
  }

  // ==================== JOBS ENDPOINTS ====================

  static async getMatchedJobs() {
    return this.request<ApiResponse<any>>('/jobs/matches', 'GET');
  }

  static async getAllJobs() {
    return this.request<ApiResponse<any>>('/jobs/all', 'GET');
  }

  static async getJobDetails(jobId: number) {
    return this.request<ApiResponse<any>>(`/jobs/${jobId}`, 'GET');
  }

  // ==================== CHATBOT ENDPOINTS ====================

  static async askQuestion(question: string) {
    return this.request<ApiResponse<any>>('/chatbot/ask', 'POST', { question });
  }

  static async getChatbotSuggestions() {
    return this.request<ApiResponse<any>>('/chatbot/suggestions', 'GET');
  }

  // ==================== ASSESSMENT ENDPOINTS ====================

  static async getAssessments() {
    return this.request<ApiResponse<any>>('/assessments/list', 'GET');
  }

  static async getAssessment(assessmentId: number) {
    return this.request<ApiResponse<any>>(`/assessments/${assessmentId}`, 'GET');
  }

  static async submitAssessment(
    assessmentId: number,
    answers: Record<number, number>
  ) {
    return this.request<ApiResponse<any>>('/assessments/submit', 'POST', {
      assessment_id: assessmentId,
      answers,
    });
  }

  static async getAssessmentHistory() {
    return this.request<ApiResponse<any>>('/assessments/history', 'GET');
  }

  // ==================== PHOTO ENDPOINTS ====================

  static async uploadPhoto(file: File): Promise<ApiResponse<any>> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/photo/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.message || 'Photo upload failed');
    }

    return response.json();
  }

  static async getPhotoAnalysis() {
    return this.request<ApiResponse<any>>('/photo/get', 'GET');
  }

  static async deletePhoto() {
    return this.request<ApiResponse<any>>('/photo/delete', 'DELETE');
  }

  static async getSamplePhotoAnalysis() {
    return this.request<ApiResponse<any>>('/photo/sample-analysis', 'GET');
  }
}
