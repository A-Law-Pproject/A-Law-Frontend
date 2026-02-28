import axios from 'axios';
import { getKakaoAccessToken } from '../services/kakaoAuth.js';
import type {
  ContractOCRResponse,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  AnalysisSSECallbacks,
} from '../types/contract.js';

// Re-export types for external use
export type {
  ContractOCRResponse,
  OCRResultResponse,
  ExportImageRequest,
  ExportImageResponse,
  EasyExplanationRequest,
  EasyExplanationResponse,
  AnalysisSSECallbacks,
};

// API Base URL - 환경변수로 관리하는 것을 권장
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.a-law.site/api/v1';

// SSE 엔드포인트용 origin (ex: https://api.a-law.site)
const SSE_ORIGIN = BASE_URL.replace(/\/api\/v1$/, '');

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송
});

// 요청 인터셉터 - 쿠키에서 토큰을 가져와 Authorization 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getKakaoAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 API 요청에 토큰 추가:', token.substring(0, 10) + '...');
    }
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
// 유틸리티
// ============================================

/** data URL (canvas.toDataURL) → Blob 변환 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(',');
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(parts[1] ?? '');
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
};

// ============================================
// API 함수들
// ============================================

/**
 * 1번. 카메라 촬영 이미지 → OCR 업로드
 * POST /api/v1/contracts  (multipart/form-data)
 * 동기 응답: OCR 결과 + s3_key (이후 비동기 분석은 SSE 수신)
 */
export const uploadContractImage = async (
  capturedImageData: string,
): Promise<ContractOCRResponse> => {
  const blob = dataURLtoBlob(capturedImageData);
  const formData = new FormData();
  formData.append('file', blob, 'contract_capture.png');

  const response = await apiClient.post<ContractOCRResponse>('/contracts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * 2번. 텍스트 → 이미지 전환
 * POST /api/v1/contracts/{id}/image
 */
export const getOCRResult = async (
  contractId: string
): Promise<OCRResultResponse> => {
  const response = await apiClient.post(`/contracts/${contractId}/image`);
  return response.data;
};

/**
 * 3번. 이미지 → 텍스트 전환 (내보내기)
 * POST /api/v1/contracts/{id}/text
 */
export const exportToImage = async (
  contractId: string,
  request: ExportImageRequest
): Promise<ExportImageResponse> => {
  const response = await apiClient.post(`/contracts/${contractId}/text`, request);
  return response.data;
};

/**
 * 5번. 특정 문장 쉬운 말로 설명
 * POST /api/v1/contracts/{id}/easy-explanation
 */
export const generateEasyExplanation = async (
  contractId: string,
  originalSentence: string,
  selectionRange?: { start: number; end: number }
): Promise<EasyExplanationResponse> => {
  const requestBody: EasyExplanationRequest = {
    original_sentence: originalSentence,
    ...(selectionRange && { selection_range: selectionRange }),
  };

  const response = await apiClient.post(`/contracts/${contractId}/easy-explanation`, requestBody);
  return response.data;
};

/**
 * 4번. 계약서 분석 SSE 구독 (인증 불필요)
 * GET /api/analysis/subscribe?s3Key={s3Key}
 *
 * 이벤트 종류:
 *   summary_complete  - 요약 분석 완료
 *   risk_complete     - 리스크 분석 완료
 *   analysis_complete - 전체 분석 완료 → 자동으로 구독 종료
 *   analysis_failed   - 분석 실패 → 자동으로 구독 종료
 *
 * @returns EventSource — 호출측에서 .close()로 구독을 직접 종료할 수 있음
 */
export const subscribeAnalysisSSE = (
  s3Key: string,
  callbacks: AnalysisSSECallbacks,
): EventSource => {
  const url = `${SSE_ORIGIN}/api/analysis/subscribe?s3Key=${encodeURIComponent(s3Key)}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener('summary_complete', (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    callbacks.onSummaryComplete(data);
  });

  eventSource.addEventListener('risk_complete', (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    callbacks.onRiskComplete(data);
  });

  eventSource.addEventListener('analysis_complete', () => {
    callbacks.onComplete();
    eventSource.close();
  });

  eventSource.addEventListener('analysis_failed', (e) => {
    const data = JSON.parse((e as MessageEvent).data);
    callbacks.onFailed(data);
    eventSource.close();
  });

  eventSource.onerror = (error) => {
    callbacks.onError(error);
    eventSource.close();
  };

  return eventSource;
};
