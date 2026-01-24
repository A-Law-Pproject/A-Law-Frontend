// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오 앱 키 (환경변수에서 가져오기)
const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

/**
 * 카카오 SDK 초기화
 */
export const initKakao = () => {
  console.log('=== 카카오 SDK 초기화 시작 ===');
  console.log('window.Kakao 존재 여부:', !!window.Kakao);
  console.log('KAKAO_APP_KEY:', KAKAO_APP_KEY ? '설정됨 (' + KAKAO_APP_KEY.substring(0, 4) + '...)' : '설정 안 됨');

  if (!window.Kakao) {
    console.error('❌ Kakao SDK가 로드되지 않았습니다. index.html을 확인하세요.');
    return;
  }

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

    window.Kakao.Auth.login({
      success: (authObj: any) => {
        console.log('카카오 로그인 성공:', authObj);

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

            // 로컬 스토리지에 저장
            localStorage.setItem('kakao_user', JSON.stringify(userInfo));
            localStorage.setItem('kakao_access_token', authObj.access_token);

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
 */
export const logoutKakao = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao || !window.Kakao.Auth.getAccessToken()) {
      // 이미 로그아웃 상태
      localStorage.removeItem('kakao_user');
      localStorage.removeItem('kakao_access_token');
      resolve();
      return;
    }

    window.Kakao.Auth.logout(() => {
      console.log('카카오 로그아웃 성공');
      localStorage.removeItem('kakao_user');
      localStorage.removeItem('kakao_access_token');
      resolve();
    });
  });
};

/**
 * 저장된 사용자 정보 가져오기
 */
export const getKakaoUser = (): KakaoUserInfo | null => {
  const userStr = localStorage.getItem('kakao_user');
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
  return !!localStorage.getItem('kakao_access_token');
};

// 타입 정의
export interface KakaoUserInfo {
  id: number;
  nickname: string;
  profileImage?: string;
  email?: string;
}
