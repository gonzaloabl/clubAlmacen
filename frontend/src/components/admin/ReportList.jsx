import { useState, useEffect } from 'react';
import { postAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function ReportList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await postAPI.getReportedPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error cargando reportes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  // 👇 VERSIÓN DIRECTA: Sin window.confirm para evitar bloqueo del navegador
  const handleDismiss = async (id) => {
    console.log("🚀 Iniciando perdonazo directo...");
    try {
      await postAPI.dismissReports(id);
      console.log("✅ API respondió OK");
      // Usamos un pequeño truco: cambiar el título en vez de alert si alert está bloqueado
      document.title = "✅ ¡Post Perdonado!"; 
      setTimeout(() => document.title = "Admin Panel", 2000);
      
      loadReports(); // Recargar lista
    } catch (error) {
      console.error("💀 Error:", error);
    }
  };

  const handleDelete = async (id) => {
    console.log("🚀 Iniciando borrado directo...");
    try {
      await postAPI.delete(id);
      console.log("✅ API respondió OK");
      document.title = "🗑️ ¡Post Borrado!";
      setTimeout(() => document.title = "Admin Panel", 2000);

      loadReports(); // Recargar lista
    } catch (error) {
      console.error("💀 Error:", error);
    }
  };

  if (loading) return <div style={{padding:'20px'}}>Cargando...</div>;

  return (
    <div style={{padding: '20px'}}>
      <h3>🚩 Reportes Pendientes ({posts.length})</h3>
      {posts.length === 0 ? <p>No hay reportes.</p> : (
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {posts.map(post => (
            <div key={post._id} style={{border:'1px solid #ccc', padding:'15px', borderRadius:'8px', background:'white'}}>
              <h4 style={{margin:'0 0 5px 0'}}>🚨 {post.title}</h4>
              <p style={{fontSize:'0.9rem', color:'#666'}}>Reportado {post.reportCount} veces. Razón: {post.reports[0]?.reason}</p>
              
              <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                <button onClick={() => navigate(`/forum/post/${post._id}`)}>Ver</button>
                
                {/* Botones de Acción Directa */}
                <button 
                    onClick={() => handleDismiss(post._id)} 
                    style={{background:'#2ecc71', color:'white', border:'none', padding:'5px 10px', cursor:'pointer'}}
                >
                    ✅ Perdonar (Directo)
                </button>
                
                <button 
                    onClick={() => handleDelete(post._id)} 
                    style={{background:'#e74c3c', color:'white', border:'none', padding:'5px 10px', cursor:'pointer'}}
                >
                    🗑️ Borrar (Directo)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}