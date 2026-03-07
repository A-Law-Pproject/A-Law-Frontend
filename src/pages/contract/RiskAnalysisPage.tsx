import { useState } from "react";
import type { AnalysisRiskEvent } from "../../types/contract.js";

interface Props {
  riskData: AnalysisRiskEvent | null;
}

/** toxic_level → 등급/색상 매핑 (0=안전, 1=주의, 2=위험) */
const getLevelStyle = (toxicLevel: 0 | 1 | 2) => {
  switch (toxicLevel) {
    case 2:
      return { label: "위험", color: "#e74c3c", bg: "#fdecea", border: "#f0d0d0" };
    case 1:
      return { label: "주의", color: "#f39c12", bg: "#fef9e7", border: "#f5e6c8" };
    case 0:
      return { label: "안전", color: "#27ae60", bg: "#eafaf1", border: "#c8e6d0" };
  }
};

/** risk_score → 전체 등급 매핑 */
const getOverallStyle = (score: number) => {
  if (score >= 70) return { label: "위험", color: "#e74c3c", bg: "#fdecea" };
  if (score >= 40) return { label: "주의", color: "#f39c12", bg: "#fef9e7" };
  return { label: "안전", color: "#27ae60", bg: "#eafaf1" };
};

function RiskAnalysisPage({ riskData }: Props) {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const handleToggle = (idx: number) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (!riskData) {
    return (
      <div className="page-container">
        <h2 className="page-title">위험 요소 분석</h2>
        <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#999", fontStyle: "italic" }}>분석 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const { risk_analysis } = riskData;
  const overall = getOverallStyle(risk_analysis.risk_score);
  const dangerCount = risk_analysis.toxic_terms.filter(t => t.toxic_level > 0).length;

  return (
    <div className="page-container">
      <h2 className="page-title">위험 요소 분석</h2>
      <p className="page-caption">임대차 계약에서 분쟁 가능성이 있는 부분을 분석했습니다.</p>

      {/* 위험도 점수 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "12px",
        background: overall.bg,
        marginBottom: "16px",
      }}>
        <span style={{ fontSize: "28px", fontWeight: 700, color: overall.color }}>
          {risk_analysis.risk_score}
        </span>
        <div>
          <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            background: overall.color,
          }}>
            {overall.label}
          </span>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#555" }}>
            총 {dangerCount}개의 위험 조항이 발견되었습니다.
          </p>
        </div>
      </div>

      {/* 조항 목록 */}
      <div className="doc-box">
        {risk_analysis.toxic_terms.map((term, idx) => {
          const style = getLevelStyle(term.toxic_level);
          const isExpanded = expandedSet.has(idx);

          return (
            <div
              key={idx}
              onClick={() => handleToggle(idx)}
              style={{
                padding: "14px",
                marginBottom: idx < risk_analysis.toxic_terms.length - 1 ? "10px" : 0,
                border: `1px solid ${style.border}`,
                borderRadius: "10px",
                background: style.bg,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, flex: 1 }}>
                  {term.index}번 조항 — {term.toxic_category || "일반 조항"}
                </span>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#fff",
                  background: style.color,
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                }}>
                  {style.label}
                </span>
              </div>

              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#666" }}>
                {term.content}
              </p>

              {isExpanded && term.toxic_reason && (
                <div style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#333",
                }}>
                  <strong style={{ color: style.color }}>분석 사유</strong>
                  <p style={{ margin: "4px 0 0" }}>{term.toxic_reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RiskAnalysisPage;
