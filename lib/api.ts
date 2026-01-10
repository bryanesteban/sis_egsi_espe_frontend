import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API de autenticación
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/login', { username, password });
    return response.data;
  },
  refreshToken: async (token: string) => {
    const response = await apiClient.post('/login/refresh', { token });
    return response.data;
  },
};

// Tipos para usuarios
export interface UserDTO {
  id?: string;
  name: string;
  lastname: string;
  cedula: string;
  username: string;
  password?: string;
  roleName: string;
}

export interface UsersResponse {
  users: UserDTO[];
  total: number;
}

// API de usuarios
export const usersAPI = {
  // Obtener todos los usuarios
  getAll: async (): Promise<UsersResponse> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  // Obtener un usuario por ID
  getById: async (id: string): Promise<UserDTO> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  // Crear nuevo usuario
  create: async (user: UserDTO): Promise<UserDTO> => {
    const response = await apiClient.post('/users', user);
    return response.data;
  },
  
  // Actualizar usuario
  update: async (user: UserDTO): Promise<UserDTO> => {
    const response = await apiClient.put('/users', user);
    return response.data;
  },
  
  // Eliminar usuario (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
