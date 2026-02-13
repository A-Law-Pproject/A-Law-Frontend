import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
    capturedImageData?: string;
}

interface Props {
  onSelect: (text: string) => void;
}

const styles={
        imageContainer: {
        width: '100%',
        maxWidth: '600px',
        border: '3px solid #007bff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        marginTop:'20px'
    } as const,
    image: {
        width: '100%',
        align: '0 auto',
        display: 'block',
    } as const,
}

export interface OCRData {
  full_text: string;
}

export interface ContractOCRResponse {
  status: "ocr_complete" | "ocr_failed"; // 유니온 타입으로 선언
  task_id: string;
  user_id: number;
  contract_id: number;
  ocr_data: OCRData;
  message: string;
}

const mockResponse: ContractOCRResponse = {
  status: "ocr_complete",
  task_id: "JOB-20260213-001",
  user_id: 7,
  contract_id: 102,
  ocr_data: {
    full_text: `제 1조 (목적)\n임차인은 본 계약 체결과 동시에 임대인에게 보증금 50,000,000원을 지급하며...\n\n제 2조 (월 차임)\n임차인은 매월 1일에 월 차임 1,200,000원을 지급하여야 하며...`
  },
  message: "원문 추출이 완료되었습니다. 심층 분석 결과는 웹소켓으로 전송됩니다."
};

function ContractOriginalPage({ onSelect }: Props) {
  const [mode, setMode] = useState<"image" | "text">("image");
  
  const location = useLocation();
    const navigate = useNavigate();
    const capturedImageData = (location.state as LocationState)?.capturedImageData || null;

  return (
    <div className="page-container">

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px"
        }}
      >
        <button
          className="switch-btn"
          onClick={() => setMode(mode === "image" ? "text" : "image")}
        >
          {mode === "image" ? "텍스트로 보기" : "이미지로 보기"}
        </button>
      </div>

      {mode === "image" && (
    // capturedImageData가 존재하면 실제 이미지와 완료 메시지를 표시
    capturedImageData ? (
        <>
            <div style={styles.imageContainer}>
                <img
                    src={capturedImageData}
                    alt="Captured Document"
                    style={styles.image}
                />
            </div>
        </>
    ) : (
        <div
            style={{
                width: "100%",
                height: "480px",
                borderRadius: "14px",
                background: "#e1e1e1",
                border: "1px solid #ccc",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#777",
                fontSize: "15px",
                userSelect: "none"
            }}
        >
            (이미지 캡쳐 대기 또는 안내 메시지 영역)
        </div>
    )
)}

      {mode === "text" && (
        <>
          <h2 className="page-title">계약서 원문</h2>
          <p className="page-caption">OCR로 추출된 계약서 본문입니다.</p>

          <div className="doc-box">
            {mockResponse.ocr_data.full_text
              .split("\n\n")
              .map((paragraph, i) => (
                <p
                  key={i}
                  onClick={() => onSelect(paragraph)}
                  style={{ cursor: "pointer" }}
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ContractOriginalPage;
