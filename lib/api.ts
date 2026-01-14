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

// Tipos para procesos EGSI
export interface ProcessEgsiDTO {
  idProcess?: string;
  name: string;
  description: string;
  dateBegin: string;
  dateEnd: string;
  status: string;
  customPhase?: string;
  userCreator?: string;
}

export interface ProcessesResponse {
  process: ProcessEgsiDTO[];
  total: number;
}

export interface ProcessCreateResponse {
  processCreated: ProcessEgsiDTO;
  phaseCreated: {
    idPhase: string;
    idProcess: string;
    questionaryCode: string;
    responsibles: string;
    status: string;
  };
}

// API de procesos EGSI
export const processAPI = {
  // Obtener todos los procesos
  getAll: async (): Promise<ProcessesResponse> => {
    const response = await apiClient.get('/processEgsi');
    return response.data;
  },
  
  // Obtener un proceso por ID
  getById: async (id: string): Promise<ProcessEgsiDTO> => {
    const response = await apiClient.get(`/processEgsi/find/${id}`);
    return response.data;
  },
  
  // Crear nuevo proceso
  create: async (process: ProcessEgsiDTO): Promise<ProcessCreateResponse> => {
    const response = await apiClient.post('/processEgsi', process);
    return response.data;
  },
  
  // Actualizar proceso
  update: async (process: ProcessEgsiDTO): Promise<ProcessEgsiDTO> => {
    const response = await apiClient.put('/processEgsi', process);
    return response.data;
  },
  
  // Eliminar proceso
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/processEgsi/delete/${id}`);
  },
};

// Tipos para fases
export interface PhaseDTO {
  idPhase: string;
  idProcess: string;
  questionaryCode: string;
  responsibles: string;
  status: string;
}

// Tipos para preguntas
export interface QuestionDTO {
  idQuestion: number;
  idQuestionary: string;
  description: string;
  questionType: string;
  questionJson?: string;
}

// Tipos para respuestas
export interface AnswerDTO {
  idAnswer: string;
  idQuestion: number;
  idPhase: string;
  answerText: string;
  createdAt?: string;
  updatedAt?: string;
  answerType?: string;
  answerStatus: string;
}

// Tipos para cuestionarios
export interface QuestionaryDTO {
  idQuestionary: string;
  questionaryName: string;
  description: string;
  phase: string;
}

// API de fases
export const phasesAPI = {
  // Obtener todas las fases
  getAll: async (): Promise<PhaseDTO[]> => {
    const response = await apiClient.get('/api/phases');
    return response.data;
  },
  
  // Obtener una fase por ID
  getById: async (id: string): Promise<PhaseDTO> => {
    const response = await apiClient.get(`/api/phases/${id}`);
    return response.data;
  },
  
  // Obtener fases por proceso
  getByProcess: async (idProcess: string): Promise<PhaseDTO[]> => {
    const response = await apiClient.get(`/api/phases/process/${idProcess}`);
    return response.data;
  },
  
  // Crear nueva fase
  create: async (phase: PhaseDTO): Promise<PhaseDTO> => {
    const response = await apiClient.post('/api/phases', phase);
    return response.data;
  },
};

// API de respuestas
export const answersAPI = {
  // Obtener todas las respuestas
  getAll: async (): Promise<AnswerDTO[]> => {
    const response = await apiClient.get('/api/answers');
    return response.data;
  },
  
  // Obtener una respuesta por ID
  getById: async (id: string): Promise<AnswerDTO> => {
    const response = await apiClient.get(`/api/answers/${id}`);
    return response.data;
  },
  
  // Obtener respuestas por fase
  getByPhase: async (idPhase: string): Promise<AnswerDTO[]> => {
    const response = await apiClient.get(`/api/answers/phase/${idPhase}`);
    return response.data;
  },
  
  // Obtener respuestas por pregunta
  getByQuestion: async (idQuestion: number): Promise<AnswerDTO[]> => {
    const response = await apiClient.get(`/api/answers/question/${idQuestion}`);
    return response.data;
  },
  
  // Actualizar respuesta
  update: async (answer: AnswerDTO): Promise<AnswerDTO> => {
    const response = await apiClient.put(`/api/answers/${answer.idAnswer}`, answer);
    return response.data;
  },
};

// API de preguntas
export const questionsAPI = {
  // Obtener todas las preguntas
  getAll: async (): Promise<QuestionDTO[]> => {
    const response = await apiClient.get('/api/questions');
    return response.data;
  },
  
  // Obtener una pregunta por ID
  getById: async (id: number): Promise<QuestionDTO> => {
    const response = await apiClient.get(`/api/questions/${id}`);
    return response.data;
  },
  
  // Obtener preguntas por cuestionario
  getByQuestionary: async (idQuestionary: string): Promise<QuestionDTO[]> => {
    const response = await apiClient.get(`/api/questions/questionary/${idQuestionary}`);
    return response.data;
  },
};

// API de cuestionarios
export const questionariesAPI = {
  // Obtener todos los cuestionarios
  getAll: async (): Promise<QuestionaryDTO[]> => {
    const response = await apiClient.get('/api/questionaries');
    return response.data;
  },
  
  // Obtener un cuestionario por ID
  getById: async (id: string): Promise<QuestionaryDTO> => {
    const response = await apiClient.get(`/api/questionaries/${id}`);
    return response.data;
  },
  
  // Obtener cuestionarios por fase
  getByPhase: async (phase: string): Promise<QuestionaryDTO[]> => {
    const response = await apiClient.get(`/api/questionaries/phase/${phase}`);
    return response.data;
  },
};
