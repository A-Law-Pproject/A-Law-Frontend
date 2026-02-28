import type { AnalysisSummaryEvent } from "../../types/contract.js";

interface Props {
  onSelect: (text: string) => void;
  summaryData: AnalysisSummaryEvent | null;
}

function ClauseSummaryPage({ onSelect: _onSelect, summaryData }: Props) {
  if (!summaryData) {
    return (
      <div className="page-container">
        <h2 className="page-title">임대차 계약 요약</h2>
        <p className="page-caption">AI가 임대차 계약 내용을 이해하기 쉽게 요약했습니다.</p>
        <div className="doc-box ai-content-fadein">
          <p style={{ color: "#999", fontStyle: "italic" }}>분석 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const { contract_data } = summaryData;

  return (
    <div className="page-container">
      <h2 className="page-title">임대차 계약 요약</h2>
      <p className="page-caption">AI가 임대차 계약 내용을 이해하기 쉽게 요약했습니다.</p>

      <div className="doc-box ai-content-fadein">
        {/* 계약 유형 */}
        <p style={{ fontWeight: 600, marginBottom: "12px" }}>
          계약 유형: {contract_data.contract_type}
        </p>

        {/* 임대인 / 임차인 */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: "13px", color: "#555", marginBottom: "4px" }}>임대인</p>
            <p style={{ fontSize: "13px" }}>{contract_data.lessor.name}</p>
            <p style={{ fontSize: "12px", color: "#777" }}>{contract_data.lessor.address}</p>
            <p style={{ fontSize: "12px", color: "#777" }}>{contract_data.lessor.phone}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: "13px", color: "#555", marginBottom: "4px" }}>임차인</p>
            <p style={{ fontSize: "13px" }}>{contract_data.lessee.name}</p>
            <p style={{ fontSize: "12px", color: "#777" }}>{contract_data.lessee.address}</p>
            <p style={{ fontSize: "12px", color: "#777" }}>{contract_data.lessee.phone}</p>
          </div>
        </div>

        {/* 특약 사항 */}
        {contract_data.special_terms.length > 0 && (
          <>
            <p style={{ fontWeight: 600, fontSize: "13px", color: "#555", marginBottom: "8px" }}>특약 사항</p>
            {contract_data.special_terms.map((term) => (
              <div key={term.index} style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#f8f8f8",
                marginBottom: "8px",
                fontSize: "13px",
                lineHeight: "1.6",
              }}>
                <span style={{ fontWeight: 600, marginRight: "6px" }}>{term.index}.</span>
                {term.content}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default ClauseSummaryPage;
