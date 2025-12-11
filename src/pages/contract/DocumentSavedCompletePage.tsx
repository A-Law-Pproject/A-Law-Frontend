import React from "react";
import { useNavigate } from 'react-router-dom';
import '../../App.css'
import CheckboxIcon from '../../assets/icons/checkbox.png'

const styles ={
    container: {
    backgroundColor: '#F1F2F6',
    minHeight: '100vh',
    padding: '40px 24px',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  title: {
    fontSize: '34px',
    fontWeight: '530',
    width:'100%',
    textAlign: 'left',
    marginBottom: '20px',
    lineHeight: '1.3',
    color: '#1a1a1aff',
  } as const,
}

const DocumentSavedCompletePage= () => {
    const navigate = useNavigate();
  return (
    <div
      style={styles.container}
    >
      <h1 style={styles.title}>
        저장 완료!
      </h1>

      <div style={{ 
              flexGrow: 1, 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              textAlign:'center',
          }}>
        <img src={CheckboxIcon} style={{width:'30px', height:'30px', marginBottom:'10px'}}/>
        저장한 계약서는 언제든<br/>홈 화면 &gt; 마이 메뉴 &gt; 내 계약서에서<br/>확인할 수 있어요.
        </div>

      <button
        className="button-press"
        style={{
        width:"200px",
        display:"block",
        justifyContent: "center",
        alignItems:"center",
        
        margin:"0 auto",

        padding: "10px 0",
        borderRadius: "50px",
        marginBottom: "70px",
        border: "none",
        background: "white",
        color: "black",
        fontSize: "15px",
        fontWeight: 600,
        boxShadow:'0px 1px 3px rgba(0, 0, 0, 0.2)',
        }}
        onClick={() => navigate('/')}
      >
        홈 화면으로
      </button>
    </div>
  );
}

export default DocumentSavedCompletePage;