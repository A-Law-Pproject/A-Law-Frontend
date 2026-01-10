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
        계약서 분석에<br/>실패했습니다.
      </h1>

      {/* 2. 지금 바로 촬영하기 버튼 */}
      <div 
        className="btn-base btn-capture hover-scale-effect"
        onClick={() => { alert('카메라 실행') }}
      >
        <img src={CameraIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        다시 촬영하기
      </div>

      {/* 3. 앨범에서 불러오기 버튼 */}
      <div 
        className="btn-base btn-album"
        onClick={() => { alert('앨범 열기') }}
      >
        <img src={AlbumIcon} style={{width:'30px', height:'30px', filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'}}/>
        앨범에서 불러오기
      </div>

      {/* 4. 이전으로 돌아가기 링크 */}
      <div 
        className="back-link"
        onClick={() => navigate('/scan')}
      >
        <FaArrowLeft size={10} />
        이전으로 돌아가기
      </div>
    </div>
  );
};

export default ScanPage;