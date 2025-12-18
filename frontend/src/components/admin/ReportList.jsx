import { useState, useEffect } from 'react';
import { postAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

  const executeDismiss = async (id) => {
    try {
      await postAPI.dismissReports(id);
      toast.success("✅ Reportes desestimados");
      loadReports();
    } catch (error) {
      toast.error("Error al procesar");
      console.error(error);
    }
  };

  const confirmDismiss = (id) => {
    toast((t) => (
      <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
        <span style={{fontSize:'0.9rem'}}>🛡️ ¿Mantener el post y limpiar reportes?</span>
        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
          <button onClick={() => { toast.dismiss(t.id); executeDismiss(id); }} style={{background:'#2ecc71', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Confirmar</button>
          <button onClick={() => toast.dismiss(t.id)} style={{background:'#ecf0f1', color:'#333', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Cancelar</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const executeDelete = async (id) => {
    try {
      await postAPI.delete(id);
      toast.success("🗑️ Post eliminado");
      loadReports();
    } catch (error) {
      toast.error("Error al eliminar");
      console.error(error);
    }
  };

  const confirmDelete = (id) => {
    toast((t) => (
      <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
        <span style={{fontSize:'0.9rem'}}>⚠️ ¿Eliminar post permanentemente?</span>
        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
          <button onClick={() => { toast.dismiss(t.id); executeDelete(id); }} style={{background:'#e74c3c', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Eliminar</button>
          <button onClick={() => toast.dismiss(t.id)} style={{background:'#ecf0f1', color:'#333', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Cancelar</button>
        </div>
      </div>
    ), { duration: 5000, icon: '🚨' });
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
                    onClick={() => confirmDismiss(post._id)} 
                    style={{background:'#2ecc71', color:'white', border:'none', padding:'5px 10px', cursor:'pointer'}}
                >
                    ✅ Perdonar
                </button>
                
                <button 
                    onClick={() => confirmDelete(post._id)} 
                    style={{background:'#e74c3c', color:'white', border:'none', padding:'5px 10px', cursor:'pointer'}}
                >
                    🗑️ Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}