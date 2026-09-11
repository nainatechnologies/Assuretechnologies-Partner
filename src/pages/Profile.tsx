import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiShield } from 'react-icons/fi';
import './Dashboard.css';

const Profile = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  let user: any = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  const coverageAreas = Array.isArray(user?.coverage_areas) ? user.coverage_areas.join(', ') : (user?.coverage_areas || 'N/A');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="profile-btn" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <FiArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Partner Profile</h1>
      </header>

      <main className="dashboard-main" style={{ padding: '20px' }}>
        <div className="panel animate-fade-in" style={{ maxWidth: '800px', backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
          <div className="panel-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="panel-title" style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Account Information</h2>
            <span className="badge badge-success" style={{ background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiShield size={14} /> {user?.display_id || 'PRT-Partner'}
            </span>
          </div>
          
          <div className="panel-body">
            <div className="form-row mb-4" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="col-half" style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                  <FiUser color="#64748b" /> {user?.full_name || 'Partner'}
                </div>
              </div>
              <div className="col-half" style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Contact Mobile</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                  <FiPhone color="#64748b" /> {user?.mobile || 'N/A'}
                </div>
              </div>
            </div>

            <div className="form-row mb-4" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="col-half" style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                  <FiMail color="#64748b" /> {user?.email || 'N/A'}
                </div>
              </div>
              <div className="col-half" style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Coverage Pincodes</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                  <FiMapPin color="#64748b" /> {coverageAreas}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Operating Base Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                <FiMapPin color="#64748b" /> {user?.address || 'N/A'}
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.85rem' }}>
              ?? <strong>Admin Managed:</strong> Partner profile details and coverage areas are managed by the administrator. Contact your administrator if you need to update any information.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
