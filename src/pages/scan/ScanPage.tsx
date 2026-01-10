import '../../App.css'
import './scan.css'

import { useNavigate } from 'react-router-dom';
import AlbumIcon from '../../assets/icons/album.png';
import CameraIcon from '../../assets/icons/camera.png';
import { FaArrowLeft } from 'react-icons/fa';

const ScanPage = () => {
  const navigate = useNavigate();

  return (
    <div className="scan-container">
      {/* 1. 상단 문구 */}
      <h1 className="scan-title">
        안녕하세요,<br/>어떤 방법으로<br/>계약서를 가져올까요?
      </h1>

      {/* 2. 지금 바로 촬영하기 버튼 */}
      <div 
        className="btn-base btn-capture hover-scale-effect"
        onClick={() => navigate('/camera')}
      >
        <img src={CameraIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        지금 바로 촬영하기
      </div>

      {/* 3. 앨범에서 불러오기 버튼 */}
      <div 
        className="btn-base btn-album"
        onClick={() => navigate('/fail')} // (디버깅용) 앨범에서 불러오기 선택시 실패페이지로 이동합니다 - 차후 수정예정
      >
        <img src={AlbumIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        앨범에서 불러오기
      </div>

      {/* 4. 이전으로 돌아가기 링크 */}
      <div 
        className="back-link"
        onClick={() => navigate('/')}
      >
        <FaArrowLeft size={10} />
        이전으로 돌아가기
      </div>
    </div>
  );
};

export default ScanPage;