import Cookies from 'js-cookie';

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오 앱 키 (환경변수에서 가져오기)
const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

// API 기본 URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// 쿠키 키 상수
const COOKIE_KEYS = {
  ACCESS_TOKEN: 'kakao_access_token',
  USER_INFO: 'kakao_user',
} as const;

// 쿠키 옵션
const COOKIE_OPTIONS = {
  expires: 7, // 7일 후 만료
  secure: window.location.protocol === 'https:', // HTTPS에서만 전송
  sameSite: 'strict' as const, // CSRF 방지
  path: '/', // 모든 경로에서 접근 가능
};

/**
 * Kakao SDK 로드 대기
 */
const waitForKakaoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 즉시 반환
    if (window.Kakao) {
      resolve();
      return;
    }

    // 최대 5초 동안 100ms마다 체크
    let attempts = 0;
    const maxAttempts = 50;

    const checkKakao = setInterval(() => {
      attempts++;

      if (window.Kakao) {
        clearInterval(checkKakao);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkKakao);
        reject(new Error('Kakao SDK 로드 시간 초과'));
      }
    }, 100);
  });
};

/**
 * 카카오 SDK 초기화
 */
export const initKakao = async (): Promise<void> => {
  console.log('=== 카카오 SDK 초기화 시작 ===');

  try {
    // SDK 로드 대기
    await waitForKakaoSDK();

    console.log('✅ Kakao SDK 로드 완료');
    console.log('KAKAO_APP_KEY:', KAKAO_APP_KEY ? '설정됨 (' + KAKAO_APP_KEY.substring(0, 4) + '...)' : '설정 안 됨');

    if (!KAKAO_APP_KEY) {
      console.error('❌ VITE_KAKAO_APP_KEY 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
      console.log('✅ Kakao SDK 초기화 완료:', window.Kakao.isInitialized());
    } else {
      console.log('ℹ️ Kakao SDK는 이미 초기화되어 있습니다.');
    }
  } catch (error) {
    console.error('❌ Kakao SDK 초기화 실패:', error);
    throw error;
  }
};

/**
 * 카카오 로그인
 * @returns Promise<KakaoUserInfo>
 */
export const loginWithKakao = (): Promise<KakaoUserInfo> => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao) {
      reject(new Error('Kakao SDK not loaded'));
      return;
    }

    console.log('🔵 카카오 로그인 팝업 호출 시작...');

    window.Kakao.Auth.login({
      success: (authObj: any) => {
        console.log('✅ 카카오 로그인 성공:', authObj);

        // 사용자 정보 가져오기
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (response: any) => {
            const userInfo: KakaoUserInfo = {
              id: response.id,
              nickname: response.kakao_account?.profile?.nickname || '사용자',
              profileImage: response.kakao_account?.profile?.profile_image_url,
              email: response.kakao_account?.email,
            };

            // 쿠키에 저장
            Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(userInfo), COOKIE_OPTIONS);
            Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, authObj.access_token, COOKIE_OPTIONS);

            console.log('✅ 토큰과 사용자 정보가 쿠키에 저장되었습니다.');

            resolve(userInfo);
          },
          fail: (error: any) => {
            console.error('사용자 정보 가져오기 실패:', error);
            reject(error);
          },
        });
      },
      fail: (error: any) => {
        console.error('카카오 로그인 실패:', error);
        reject(error);
      },
    });
  });
};

/**
 * 카카오 로그아웃
 * 서버에 DELETE /api/v1/auth 요청을 보내 서버 측 쿠키를 삭제한 후 클라이언트 쿠키도 제거
 */
export const logoutKakao = async (): Promise<void> => {
  // 서버에 로그아웃 요청 (서버 측 쿠키 삭제)
  try {
    await fetch(`${BASE_URL}/auth`, {
      method: 'DELETE',
      credentials: 'include',
    });
    console.log('✅ 서버 로그아웃 완료');
  } catch (error) {
    console.error('서버 로그아웃 요청 실패:', error);
  }

  // 클라이언트 쿠키 삭제
  Cookies.remove(COOKIE_KEYS.USER_INFO, { path: '/' });
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
  console.log('✅ 클라이언트 쿠키가 삭제되었습니다.');

  // Kakao SDK 로그아웃 (SDK가 초기화되어 있는 경우)
  if (window.Kakao?.Auth?.getAccessToken()) {
    await new Promise<void>((resolve) => {
      window.Kakao.Auth.logout(() => {
        console.log('✅ 카카오 SDK 로그아웃 완료');
        resolve();
      });
    });
  }
};

/**
 * 저장된 사용자 정보 가져오기
 */
export const getKakaoUser = (): KakaoUserInfo | null => {
  const userStr = Cookies.get(COOKIE_KEYS.USER_INFO);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * 로그인 상태 확인
 */
export const isKakaoLoggedIn = (): boolean => {
  return !!Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
};

/**
 * 액세스 토큰 가져오기
 */
export const getKakaoAccessToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
};

// 타입 정의
export interface KakaoUserInfo {
  id: number;
  nickname: string;
  profileImage?: string;
  email?: string;
}

/**
 * 더미 로그인 (백엔드 구축 전 테스트용)
 */
export const dummyLogin = (): Promise<KakaoUserInfo> => {
  return new Promise((resolve) => {
    const dummyUser: KakaoUserInfo = {
      id: 12345678,
      nickname: '테스트 사용자',
      // profileImage: undefined,
      email: 'test@example.com',
    };

    // 쿠키에 저장
    Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(dummyUser), COOKIE_OPTIONS);
    Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, 'dummy_access_token_for_testing', COOKIE_OPTIONS);

    console.log('✅ 더미 로그인 완료:', dummyUser);
    resolve(dummyUser);
  });
};
