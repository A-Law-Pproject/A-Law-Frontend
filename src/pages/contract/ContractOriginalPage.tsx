import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import type { OcrWord } from '../../types/contract.js';

interface LocationState {
    capturedImageData?: string;
    taskId?: string;
    contractId?: number;
    ocrText?: string;
    ocrWords?: OcrWord[];
}

interface Props {
  onSelect: (text: string) => void;
}

const PAGE_PADDING = 18; // matches .page-container padding

const MOCK_OCR_TEXT = `<p><strong>주거용 부동산 임대차 계약서</strong></p>
<p>임대인(갑): 홍길동 (주민등록번호: 800101-1234567)<br/>임차인(을): 김철수 (주민등록번호: 900202-2345678)</p>
<p><strong>제1조 (목적물 표시)</strong><br/>소재지: 서울특별시 강남구 역삼동 123-45 역삼아파트 101호<br/>전용면적: 84.32㎡ / 공급면적: 112.14㎡</p>
<p><strong>제2조 (계약 내용)</strong><br/>보증금: 금 삼억 원정 (₩300,000,000)<br/>계약금: 금 일천만 원정 (₩10,000,000) - 계약 시 지불<br/>잔금: 금 이억 구천만 원정 (₩290,000,000) - 2026년 6월 1일 지불</p>
<p><strong>제3조 (임대 기간)</strong><br/>2026년 6월 1일부터 2028년 5월 31일까지 (24개월)</p>
<p><strong>제4조 (관리 및 사용)</strong><br/>임차인은 임대인의 동의 없이 임차 목적물을 전대하거나 임차권을 양도할 수 없다.<br/>임차인은 계약 기간 중 애완동물을 사육할 수 없으며 건물 내 흡연을 금지한다.</p>
<p><strong>제5조 (퇴실 조건)</strong><br/>임차인은 퇴실 시 청소비 금 이십만 원정(₩200,000)을 부담한다.<br/>원상복구 의무를 이행하지 않을 경우 보증금에서 공제할 수 있다.</p>
<p><strong>제6조 (보증금 반환)</strong><br/>임대인은 임차인의 퇴실일로부터 30일 이내에 보증금을 반환하여야 한다.<br/>다만 임차인의 채무가 있을 경우 이를 공제한 후 반환할 수 있다.</p>
<p><strong>제7조 (계약 해지)</strong><br/>임차인이 2개월 이상 관리비를 연체하거나 본 계약 조항을 위반할 경우, 임대인은 계약을 즉시 해지할 수 있다.</p>
<p>본 계약서는 2부를 작성하여 임대인과 임차인이 각 1부씩 보관한다.</p>
<p>2026년 5월 18일</p>
<p>임대인(갑): 홍길동 (서명) ________________<br/>임차인(을): 김철수 (서명) ________________</p>`;

/** 백엔드 OCR 텍스트는 "| HTML content |\n| --- |\n| text |" 형식의 마크다운 파이프 테이블.
 *  파이프 래퍼와 구분선을 제거하여 내부 HTML만 추출한다. */
const stripMarkdownPipes = (text: string): string =>
  text
    .split('\n')
    .filter(line => !/^\|\s*[-:]+\s*\|/.test(line))   // "| --- |" 구분선 제거
    .map(line => line.replace(/^\|\s*/, '').replace(/\s*\|$/, ''))  // 앞뒤 파이프 제거
    .join('\n');

const styles = {
    imageContainer: {
        position: 'relative' as const,
        // bleed out of page-container's 18px padding to fill full width
        marginLeft: -PAGE_PADDING,
        marginRight: -PAGE_PADDING,
        width: `calc(100% + ${PAGE_PADDING * 2}px)`,
        overflow: 'hidden',
    } as const,
    image: {
        width: '100%',
        display: 'block',
    } as const,
}

function ContractOriginalPage({ onSelect }: Props) {
  const location = useLocation();
  const [mode, setMode] = useState<"image" | "text">(
    (location.state as LocationState | undefined)?.capturedImageData ? "image" : "text"
  );
  const [debugMode, setDebugMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const state = location.state as LocationState | undefined;
  const capturedImageData = state?.capturedImageData || null;
  const ocrText = state?.ocrText?.trim() || null;
  const ocrWords = state?.ocrWords ?? [];

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setImgSize({
        w: imgRef.current.clientWidth,
        h: imgRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (imgRef.current) {
        setImgSize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="page-container">

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px"
        }}
      >
        {mode === "image" && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#555",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            박스 표시 (디버그)
          </label>
        )}
        <button
          className="switch-btn"
          onClick={() => setMode(mode === "image" ? "text" : "image")}
        >
          {mode === "image" ? "텍스트로 보기" : "이미지로 보기"}
        </button>
      </div>

      {mode === "image" && (
        capturedImageData ? (
          <div style={styles.imageContainer}>
            <img
              ref={imgRef}
              src={capturedImageData}
              alt="Captured Document"
              style={styles.image}
              onLoad={handleImageLoad}
            />

            {/* Word overlays */}
            {ocrWords.length > 0 && imgSize.h > 0 &&
              ocrWords.map((word, i) => {
                const fontSize = Math.max((word.height / 100) * imgSize.h * 0.85, 8);
                return (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${word.x}%`,
                      top: `${word.y}%`,
                      width: `${word.width}%`,
                      height: `${word.height}%`,
                      fontSize,
                      color: "transparent",
                      cursor: "text",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      lineHeight: 1,
                      userSelect: "text",
                      ...(debugMode && {
                        border: "1px solid rgba(255, 0, 0, 0.5)",
                        background: "rgba(255, 255, 0, 0.1)",
                      }),
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
          </div>
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
            <div
              dangerouslySetInnerHTML={{ __html: ocrText ? stripMarkdownPipes(ocrText) : MOCK_OCR_TEXT }}
              style={{ fontSize: "13px", lineHeight: "1.7", overflowX: "auto" }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ContractOriginalPage;
