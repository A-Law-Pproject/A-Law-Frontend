import axios from 'axios';

// API Base URL - 환경변수로 관리하는 것을 권장
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰이 필요한 경우
apiClient.interceptors.request.use(
  (config) => {
    // 여기에 토큰을 추가할 수 있습니다
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// API 함수들
// ============================================

/**
 * 1. 계약서 업로드 및 분석 요청
 * POST /api/v1/contracts
 */
export const uploadContract = async (file: File): Promise<{ jobId: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/contracts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 2. 분석 상태 조회 (폴링용)
 * GET /api/v1/contracts/{id}/analyses
 */
export const getAnalysisStatus = async (
  contractId: string
): Promise<{ status: 'PENDING' | 'SUCCESS' }> => {
  const response = await apiClient.get(`/contracts/${contractId}/analyses`);
  return response.data;
};

/**
 * 3. AI 분석 결과 조회
 * GET /api/v1/contracts/{id}/analyses
 */
export interface ContractAnalysisResult {
  contractResult: any; // JSON 형태의 분석 결과
  metadata?: any;
}

export const getAnalysisResult = async (
  contractId: string
): Promise<ContractAnalysisResult> => {
  const response = await apiClient.get(`/contracts/${contractId}/analyses`);
  return response.data;
};

/**
 * 4. 계약서 간단 요약 생성
 * POST /api/v1/contracts/{id}/summaries
 */
export const generateSummary = async (
  contractId: string
): Promise<{ contextSummary: string }> => {
  const response = await apiClient.post(`/contracts/${contractId}/summaries`);
  return response.data;
};

/**
 * 5. 특정 문장 쉬운 말로 설명
 * POST /api/v1/contracts/{id}/easy-explanation
 */
export const generateEasyExplanation = async (
  contractId: string,
  originalSentence: string
): Promise<{ easyTranslation: string }> => {
  const response = await apiClient.post(`/contracts/${contractId}/easy-explanation`, {
    originalSentence,
  });
  return response.data;
};

/**
 * 6. 텍스트 → 이미지 변환
 * POST /api/v1/contracts/{id}/image
 */
export const convertTextToImage = async (
  contractId: string,
  textContent: string
): Promise<{ uploadedFile: string }> => {
  const response = await apiClient.post(`/contracts/${contractId}/image`, {
    textContent,
  });
  return response.data;
};

/**
 * 7. PDF/이미지 → 텍스트 변환
 * POST /api/v1/contracts/{id}/text
 */
export const convertFileToText = async (
  contractId: string,
  uploadedFile: File
): Promise<{ textContent: string }> => {
  const formData = new FormData();
  formData.append('uploadedFile', uploadedFile);

  const response = await apiClient.post(`/contracts/${contractId}/text`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 8. 위험 요소 분석
 * POST /api/v1/contracts/{id}/risks
 */
export interface RiskItem {
  level: string;
  items: string[];
}

export const generateRiskAnalysis = async (
  contractId: string
): Promise<{ risks: RiskItem[] }> => {
  const response = await apiClient.post(`/contracts/${contractId}/risks`);
  return response.data;
};

/**
 * 9. 챗봇 질문하기
 * POST /api/chat/{contractId}
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
}

export const sendChatMessage = async (
  contractId: string,
  message: string,
  history?: ChatMessage[]
): Promise<ChatResponse> => {
  const response = await apiClient.post(`/chat/${contractId}`, {
    message,
    history,
  });
  return response.data;
};

/**
 * 10. 챗봇 대화 내역 조회
 * GET /api/chat/{contractId}
 */
export interface ChatHistory {
  messages: ChatMessage[];
  conversationId?: string;
}

export const getChatHistory = async (
  contractId: string
): Promise<ChatHistory> => {
  const response = await apiClient.get(`/chat/${contractId}`);
  return response.data;
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 폴링 헬퍼 함수 - 분석 완료까지 대기
 */
export const waitForAnalysisComplete = async (
  contractId: string,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<void> => {
  for (let i = 0; i < maxAttempts; i++) {
    const { status } = await getAnalysisStatus(contractId);

    if (status === 'SUCCESS') {
      return;
    }

    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('분석 시간이 초과되었습니다.');
};
