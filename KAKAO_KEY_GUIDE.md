# 카카오 JavaScript 키 찾기 가이드

## 빠른 찾기

1. https://developers.kakao.com/ 접속
2. 로그인
3. **내 애플리케이션** 클릭
4. 앱 선택 (없으면 생성)
5. 왼쪽 메뉴: **앱 설정** > **요약 정보**
6. **JavaScript 키** 복사

## 상세 가이드

### 1. 카카오 개발자 사이트 접속
- URL: https://developers.kakao.com/
- 카카오 계정으로 로그인

### 2. 애플리케이션 생성 (처음인 경우)

**2-1. 내 애플리케이션 메뉴 이동**
- 우측 상단 또는 상단 메뉴에서 **내 애플리케이션** 클릭

**2-2. 애플리케이션 추가**
- **애플리케이션 추가하기** 버튼 클릭
- 앱 이름 입력: 예) A-Law, 법률계약서앱 등
- 사업자명 입력: 개인 이름 또는 회사명
- **저장** 버튼 클릭

### 3. JavaScript 키 확인

**3-1. 앱 선택**
- 내 애플리케이션 목록에서 방금 만든 앱 클릭

**3-2. 앱 키 확인**
- 왼쪽 사이드바: **앱 설정** 섹션 확장
- **요약 정보** 클릭
- 페이지 중간쯤 **앱 키** 섹션 확인

**3-3. JavaScript 키 복사**
```
앱 키
├─ REST API 키: 1234567890abcdef1234567890abcdef
├─ JavaScript 키: 1234567890abcdef1234567890abcdef  ← 이것!
├─ Admin 키: 1234567890abcdef1234567890abcdef
└─ Native 앱 키: 1234567890abcdef1234567890abcdef
```

### 4. .env 파일에 입력

**4-1. .env 파일 열기**
- 프로젝트 루트의 `.env` 파일 열기

**4-2. JavaScript 키 입력**
```env
VITE_KAKAO_APP_KEY=복사한_JavaScript_키를_여기에_붙여넣기
```

예시:
```env
VITE_KAKAO_APP_KEY=1234567890abcdef1234567890abcdef
```

### 5. 플랫폼 등록 (추가 설정)

**5-1. Web 플랫폼 등록**
- 왼쪽 메뉴: **앱 설정** > **플랫폼**
- **Web 플랫폼 등록** 버튼 클릭
- 사이트 도메인: `http://localhost:5173` 입력
- **저장** 클릭

**5-2. 카카오 로그인 활성화**
- 왼쪽 메뉴: **제품 설정** > **카카오 로그인**
- **활성화 설정** 토글을 **ON**으로 변경

**5-3. Redirect URI 등록**
- 같은 페이지에서 아래로 스크롤
- **Redirect URI** 섹션에서 **Redirect URI 등록** 클릭
- `http://localhost:5173` 입력
- **저장** 클릭

### 6. 개발 서버 재시작

```bash
# 서버 종료 (Ctrl + C)
# 서버 재시작
npm run dev
```

## 문제 해결

### Q: "내 애플리케이션" 메뉴가 안 보여요
A: 우측 상단의 프로필 아이콘을 클릭하거나, https://developers.kakao.com/console/app 로 직접 이동하세요.

### Q: JavaScript 키가 안 보여요
A:
1. 앱 설정 > 요약 정보로 이동했는지 확인
2. 페이지를 새로고침해보세요
3. 다른 브라우저로 시도해보세요

### Q: 키를 복사했는데 작동 안 해요
A:
1. .env 파일 저장했는지 확인
2. 개발 서버 재시작 (Ctrl + C 후 npm run dev)
3. 키 앞뒤 공백이 없는지 확인
4. 따옴표 없이 입력했는지 확인

### Q: 플랫폼이 등록 안 돼요
A:
- URL은 http:// 또는 https://로 시작해야 합니다
- localhost 앞에 http://를 꼭 붙이세요
- 포트 번호까지 정확히 입력하세요 (5173)

## 참고 링크

- 카카오 개발자 사이트: https://developers.kakao.com/
- 카카오 로그인 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/common
