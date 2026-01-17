# API 연동 가이드

이 문서는 A-Law-Frontend 프로젝트의 API 연동을 위한 가이드입니다.

## 📁 생성된 파일 구조

```
src/
├── config/
│   └── api.config.ts          # API 설정 (키, 엔드포인트 등)
├── services/
│   ├── llmService.ts           # LLM API 서비스 (OpenAI, Claude 등)
│   └── contractService.ts      # ✅ 백엔드 계약서 API 서비스 (API 명세서 기반)
├── components/
│   └── ContractOverlay.tsx     # ✅ API 연동 완료
└── pages/
    └── contract/
        ├── ChatbotPanel.tsx           # ✅ API 연동 완료
        ├── ClauseSummaryPage.tsx      # 🔄 연동 준비 완료 (TODO 주석 참고)
        ├── RiskAnalysisPage.tsx       # 🔄 연동 준비 완료 (TODO 주석 참고)
        └── DocumentSavePage.tsx       # ✅ API 연동 완료
```

## 🔧 환경 설정

### 1. 환경변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

### 2. API 키 설정

`.env` 파일을 열어 실제 값을 입력하세요:

```env
# LLM API 설정 (선택사항 - 프론트엔드에서 직접 LLM 호출 시)
VITE_LLM_API_KEY=your-llm-api-key-here
VITE_LLM_ENDPOINT=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4

# 백엔드 API 설정 (필수)
VITE_BACKEND_URL=http://your-backend-url.com/api/v1
# 여기에 API 키 삽입 (백엔드 인증이 필요한 경우)
VITE_BACKEND_API_KEY=your-backend-api-key-here
```

## 📋 백엔드 API 명세서

### 기본 정보
- **Base URL**: `http://your-backend-url.com/api/v1`
- **인증**: `Authorization: Bearer {API_KEY}` (필요한 경우)

### API 엔드포인트

#### 1. 계약서 업로드 및 생성
```
POST /api/v1/contracts
Content-Type: multipart/form-data

Body:
- title: string (계약서 제목)
- isImportant: boolean (중요 문서 여부)
- file: File (이미지, PDF, 텍스트 파일)

Response:
{
  "id": "contract_123",
  "title": "복정동 전세계약서",
  "isImportant": true,
  "createdAt": "2024-01-17T00:00:00Z",
  "status": "processing" | "completed" | "failed"
}
```

#### 2. 계약서 목록 조회
```
GET /api/v1/contracts

Response:
[
  {
    "id": "contract_123",
    "title": "복정동 전세계약서",
    "isImportant": true,
    "createdAt": "2024-01-17T00:00:00Z",
    "status": "completed"
  }
]
```

#### 3. 분석 데이터 조회 (폴링)
```
GET /api/v1/contracts/{id}/analyses

Response:
{
  "status": "completed",
  "summary": "계약서 요약...",
  "riskAnalysis": "위험 요소 분석...",
  "easyExplanation": "쉬운 설명..."
}
```

#### 4. AI 분석 결과 조회
```
GET /api/v1/contracts/{id}/analyses

Response:
{
  "summary": "계약서 요약...",
  "riskAnalysis": "위험 요소 분석...",
  "easyExplanation": "쉬운 설명..."
}
```

#### 5. 계약서 간단 요약 생성
```
POST /api/v1/contracts/{id}/summaries

Response:
{
  "summary": "임차인은 보증금 5천만원..."
}
```

#### 6. 특정 문장 쉬운 말 요약
```
POST /api/v1/contracts/{id}/easy-explanation
Content-Type: application/json

Body:
{
  "selectedText": "월 차임 2회 연속 연체 시..."
}

Response:
{
  "explanation": "이 조항은..."
}
```

#### 7. Risk 분석 생성
```
POST /api/v1/contracts/{id}/risks

Response:
{
  "riskAnalysis": "월세 2회 연속 연체 시..."
}
```

#### 8. 이미지 → 텍스트 변환 (OCR)
```
POST /api/v1/contracts/{id}/image
Content-Type: multipart/form-data

Body:
- image: File

Response:
{
  "text": "추출된 텍스트..."
}
```

#### 9. PDF/이미지 → 텍스트 변환
```
POST /api/v1/contracts/{id}/text
Content-Type: multipart/form-data

Body:
- file: File

Response:
{
  "text": "추출된 텍스트..."
}
```

## 🎯 서비스 함수 사용 방법

### contractService.ts

모든 백엔드 API 호출은 `src/services/contractService.ts`를 통해 이루어집니다.

#### 계약서 업로드
```typescript
import { uploadContract } from '../services/contractService.js';

const handleUpload = async (file: File) => {
  const result = await uploadContract({
    title: '2024년 전세계약서',
    isImportant: true,
    file: file,
  });

  if (result.success) {
    console.log('업로드 성공:', result.data);
    // result.data.id를 사용하여 후속 작업
  } else {
    console.error('업로드 실패:', result.error);
  }
};
```

#### 분석 결과 조회 (폴링)
```typescript
import { getContractAnalysis } from '../services/contractService.js';

const checkAnalysisStatus = async (contractId: string) => {
  const result = await getContractAnalysis(contractId);

  if (result.success && result.data) {
    if (result.data.status === 'completed') {
      console.log('분석 완료:', result.data);
      // 요약, 위험 분석 등 표시
    } else if (result.data.status === 'processing') {
      // 3초 후 다시 확인
      setTimeout(() => checkAnalysisStatus(contractId), 3000);
    }
  }
};
```

#### 특정 문구 설명 생성
```typescript
import { generateEasyExplanation } from '../services/contractService.js';

const handleExplain = async (contractId: string, selectedText: string) => {
  const result = await generateEasyExplanation(contractId, selectedText);

  if (result.success && result.data) {
    console.log('설명:', result.data.explanation);
  }
};
```

## 🔑 API 키 삽입 위치

### 모든 API 호출 함수에서 API 키 삽입 위치를 주석으로 표시했습니다:

```typescript
// 여기에 API 키 삽입
const apiKey = API_CONFIG.BACKEND.apiKey;

const response = await fetch(url, {
  method: 'POST',
  headers: {
    // 여기에 API 키 삽입 (필요한 경우)
    'Authorization': `Bearer ${apiKey}`,
  },
});
```

### API 키가 필요한 모든 위치:
1. [src/config/api.config.ts](src/config/api.config.ts) - 환경변수에서 API 키 가져오기
2. [src/services/contractService.ts](src/services/contractService.ts) - 모든 API 함수에서 사용

## 🚀 실제 API 연동 방법

### 1단계: 더미 응답 확인

현재 모든 API는 더미 응답을 반환합니다. 먼저 더미 데이터로 UI 플로우를 테스트하세요.

```bash
npm run dev
```

### 2단계: 실제 API 활성화

각 서비스 파일에서 주석 처리된 실제 API 호출 코드를 활성화하세요:

```typescript
// contractService.ts의 각 함수에서

// 1. 더미 응답 부분을 주석 처리
/*
// 더미 응답 (개발용)
return {
  success: true,
  data: { ... }
};
*/

// 2. 실제 API 호출 부분의 주석 해제
// 기존:
/*
const response = await fetch(...);
*/

// 수정 후:
const response = await fetch(...);
```

### 3단계: API 키 설정

`.env` 파일에 실제 백엔드 API 키를 입력하세요:

```env
VITE_BACKEND_API_KEY=actual-api-key-from-backend-team
```

## 📊 API 응답 형식

모든 서비스 함수는 일관된 응답 형식을 사용합니다:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 사용 예시

```typescript
const result = await uploadContract({...});

if (result.success && result.data) {
  console.log("성공:", result.data);
} else {
  console.error("오류:", result.error);
}
```

## 🔄 폴링 구현 예시

계약서 분석은 시간이 걸리므로 폴링으로 상태를 확인해야 합니다:

```typescript
const pollAnalysisStatus = async (contractId: string) => {
  const maxAttempts = 20; // 최대 20번 (1분)
  let attempts = 0;

  const poll = async () => {
    const result = await getContractAnalysis(contractId);

    if (result.success && result.data) {
      if (result.data.status === 'completed') {
        console.log('분석 완료:', result.data);
        return result.data;
      } else if (result.data.status === 'failed') {
        console.error('분석 실패');
        return null;
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(poll, 3000); // 3초 후 재시도
      }
    }
  };

  poll();
};
```

## 📝 컴포넌트별 API 연동 상태

### ✅ 완료된 컴포넌트

1. **ContractOverlay** - LLM 설명 생성 (현재 llmService 사용, 백엔드로 변경 가능)
2. **ChatbotPanel** - 챗봇 대화 (현재 llmService 사용, 백엔드로 변경 가능)
3. **DocumentSavePage** - 계약서 업로드 (`uploadContract` 사용)

### 🔄 연동 필요 (TODO 주석 참고)

1. **ClauseSummaryPage** - `generateSummary()` 사용
2. **RiskAnalysisPage** - `generateRiskAnalysis()` 사용

## ❓ 문제 해결

### API 키 오류
```
API 키가 설정되지 않았습니다.
```
→ `.env` 파일 확인 및 `VITE_BACKEND_API_KEY` 설정

### CORS 오류
```
Access to fetch has been blocked by CORS policy
```
→ 백엔드에서 CORS 설정 추가 필요

### 파일 업로드 오류
```
파일 형식이 지원되지 않습니다.
```
→ 지원하는 파일 형식: 이미지(jpg, png), PDF, 텍스트

## 📚 다음 단계

1. **OCR 페이지 연동**
   - [src/pages/scan/ScanPage.tsx](src/pages/scan/ScanPage.tsx)에서 `convertImageToText()` 또는 `convertFileToText()` 사용

2. **분석 결과 페이지 연동**
   - 계약서 업로드 후 받은 `contractId` 사용
   - 폴링으로 분석 상태 확인
   - 완료 시 요약 및 위험 분석 표시

3. **로딩 UI 개선**
   - 업로드 중, 분석 중 상태 표시
   - 프로그레스 바 추가

4. **에러 처리 강화**
   - 네트워크 오류 처리
   - 재시도 로직 추가

---

**작성일**: 2026-01-17
**작성자**: Claude Code
**기반 API 명세서**: /api/v1/contracts
