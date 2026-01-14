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

// ============================================================
// TIPOS PARA FASES EGSI ESTÁNDAR (v3)
// ============================================================

export interface TableColumnConfig {
  key: string;
  header: string;
  width?: string;
  type?: 'text' | 'date'; // Tipo de input: texto o fecha
}

export interface TableConfig {
  columns: TableColumnConfig[];
  minRows?: number;
  maxRows?: number;
}

export interface EgsiQuestionDTO {
  idQuestion: string;
  title: string;
  description?: string;
  inputType: 'TEXTO' | 'DATE' | 'TABLA';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  tableConfig?: TableConfig;
  order: number;
}

export interface EgsiSectionDTO {
  idSection: string;
  title: string;
  description?: string;
  order: number;
  questions: EgsiQuestionDTO[];
}

export interface EgsiPhaseDTO {
  idPhase: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  sections: EgsiSectionDTO[];
}

export interface EgsiPhasesResponseDTO {
  totalPhases: number;
  activePhases: number;
  totalSections: number;
  totalQuestions: number;
  egsiPhases: EgsiPhaseDTO[];
}

export interface CreateQuestionRequestDTO {
  title: string;
  description?: string;
  inputType: 'TEXTO' | 'DATE' | 'TABLA';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  tableConfig?: string;
  order: number;
}

export interface CreateSectionRequestDTO {
  title: string;
  description?: string;
  order: number;
  questions?: CreateQuestionRequestDTO[];
}

export interface CreatePhaseRequestDTO {
  title: string;
  description?: string;
  order: number;
  isActive?: boolean;
  sections?: CreateSectionRequestDTO[];
}

export interface SaveAllPhasesRequestDTO {
  phases: CreatePhaseRequestDTO[];
}

// ============================================================
// API DE FASES EGSI ESTÁNDAR (v3)
// ============================================================

export const egsiPhasesAPI = {
  // Obtener todas las fases con secciones y preguntas
  getAll: async (): Promise<EgsiPhasesResponseDTO> => {
    const response = await apiClient.get('/api/v3/egsi/phases');
    return response.data;
  },

  // Obtener solo las fases activas
  getActive: async (): Promise<EgsiPhasesResponseDTO> => {
    const response = await apiClient.get('/api/v3/egsi/phases/active');
    return response.data;
  },

  // Obtener una fase por ID
  getById: async (idPhase: string): Promise<EgsiPhaseDTO> => {
    const response = await apiClient.get(`/api/v3/egsi/phases/${idPhase}`);
    return response.data;
  },

  // Obtener estadísticas
  getStatistics: async (): Promise<EgsiPhasesResponseDTO> => {
    const response = await apiClient.get('/api/v3/egsi/phases/statistics');
    return response.data;
  },

  // Crear nueva fase
  create: async (phase: CreatePhaseRequestDTO): Promise<EgsiPhaseDTO> => {
    const response = await apiClient.post('/api/v3/egsi/phases', phase);
    return response.data;
  },

  // Guardar todas las fases (reemplaza las existentes)
  saveAll: async (request: SaveAllPhasesRequestDTO): Promise<EgsiPhasesResponseDTO> => {
    const response = await apiClient.post('/api/v3/egsi/phases/save-all', request);
    return response.data;
  },

  // Actualizar fase
  update: async (idPhase: string, phase: CreatePhaseRequestDTO): Promise<EgsiPhaseDTO> => {
    const response = await apiClient.put(`/api/v3/egsi/phases/${idPhase}`, phase);
    return response.data;
  },

  // Activar/Desactivar fase
  toggleActive: async (idPhase: string): Promise<EgsiPhaseDTO> => {
    const response = await apiClient.patch(`/api/v3/egsi/phases/${idPhase}/toggle-active`);
    return response.data;
  },

  // Eliminar fase
  delete: async (idPhase: string): Promise<void> => {
    await apiClient.delete(`/api/v3/egsi/phases/${idPhase}`);
  },

  // Agregar sección a una fase
  addSection: async (idPhase: string, section: CreateSectionRequestDTO): Promise<EgsiSectionDTO> => {
    const response = await apiClient.post(`/api/v3/egsi/phases/${idPhase}/sections`, section);
    return response.data;
  },

  // Agregar pregunta a una sección
  addQuestion: async (idSection: string, question: CreateQuestionRequestDTO): Promise<EgsiQuestionDTO> => {
    const response = await apiClient.post(`/api/v3/egsi/phases/sections/${idSection}/questions`, question);
    return response.data;
  },

  // Eliminar sección
  deleteSection: async (idSection: string): Promise<void> => {
    await apiClient.delete(`/api/v3/egsi/phases/sections/${idSection}`);
  },

  // Eliminar pregunta
  deleteQuestion: async (idQuestion: string): Promise<void> => {
    await apiClient.delete(`/api/v3/egsi/phases/questions/${idQuestion}`);
  },
};

// ============================================================
// TIPOS PARA RESPUESTAS EGSI
// ============================================================

export interface EgsiAnswerDTO {
  idAnswer: string;
  idProcess: string;
  idQuestion: string;
  idPhase: string;
  answerValue: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SaveAnswersRequestDTO {
  idProcess: string;
  idPhase: string;
  answers: {
    idQuestion: string;
    answerValue: string;
  }[];
}

export interface SaveAnswersResponseDTO {
  message: string;
  savedCount: number;
  answers: EgsiAnswerDTO[];
}

// ============================================================
// API DE RESPUESTAS EGSI
// ============================================================

export const egsiAnswersAPI = {
  // Guardar múltiples respuestas
  save: async (request: SaveAnswersRequestDTO): Promise<SaveAnswersResponseDTO> => {
    const response = await apiClient.post('/api/v3/egsi/answers', request);
    return response.data;
  },

  // Obtener respuestas por proceso
  getByProcess: async (idProcess: string): Promise<EgsiAnswerDTO[]> => {
    const response = await apiClient.get(`/api/v3/egsi/answers/process/${idProcess}`);
    return response.data;
  },

  // Obtener respuestas por proceso y fase
  getByProcessAndPhase: async (idProcess: string, idPhase: string): Promise<EgsiAnswerDTO[]> => {
    const response = await apiClient.get(`/api/v3/egsi/answers/process/${idProcess}/phase/${idPhase}`);
    return response.data;
  },

  // Obtener respuestas como mapa (idQuestion -> answerValue)
  getAnswersMap: async (idProcess: string, idPhase: string): Promise<Record<string, string>> => {
    const response = await apiClient.get(`/api/v3/egsi/answers/process/${idProcess}/phase/${idPhase}/map`);
    return response.data;
  },

  // Obtener progreso de una fase
  getProgress: async (idProcess: string, idPhase: string): Promise<{ progress: number }> => {
    const response = await apiClient.get(`/api/v3/egsi/answers/process/${idProcess}/phase/${idPhase}/progress`);
    return response.data;
  },

  // Eliminar respuesta
  delete: async (idAnswer: string): Promise<void> => {
    await apiClient.delete(`/api/v3/egsi/answers/${idAnswer}`);
  },
};
