import '../../App.css'
import './scan.css'

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingIcon from '../../assets/icons/loading.png'

const ScanLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImageData = location.state?.capturedImageData;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/contract/view', { state: { capturedImageData }, replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, capturedImageData]);

  return (
    <div className="scan-container">
      {/* 1. 상단 문구 */}
      <h1 className="scan-title">
        계약서를<br/>읽고 있습니다.
      </h1>

      <div className="loading-area">
        <img src={LoadingIcon} className="spinner-img" alt="loading" />
        <p className="loading-text">
            선거와 국민투표의 공정한 관리 및 정당에 관한 사무를 처리하기 위하여 선거관리위원회를 둔다. 누구든지 체포 또는 구속을 당한 때에는 적부의 심사를 법원에 청구할 권리를 가진다.
        </p>
      </div>

      {/* 이전으로 돌아가기 링크 */}
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

export default ScanLoading;
