import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import './Dashboard.css'; // Reuse dashboard styles

const Profile = () => {
  const navigate = useNavigate();
  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="profile-btn" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <FiArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Profile Settings</h1>
      </header>

      <main className="dashboard-main" style={{ padding: '20px' }}>
        <div className="panel animate-fade-in" style={{ animationDelay: '0.1s', maxWidth: '800px', backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="panel-header">
          <h2 className="panel-title">Personal Information</h2>
        </div>
        <div className="panel-body">
          <div className="form-row mb-4">
            <div className="col-half">
              <div className="form-group mb-0">
                <label>First Name</label>
                <input type="text" className="form-control" defaultValue="John" />
              </div>
            </div>
            <div className="col-half">
              <div className="form-group mb-0">
                <label>Last Name</label>
                <input type="text" className="form-control" defaultValue="Doe" />
              </div>
            </div>
          </div>
          <div className="form-row mb-4">
            <div className="col-half">
              <div className="form-group mb-0">
                <label>Email Address</label>
                <input type="email" className="form-control" defaultValue="john.doe@example.com" />
              </div>
            </div>
            <div className="col-half">
              <div className="form-group mb-0">
                <label>Phone Number</label>
                <input type="tel" className="form-control" defaultValue="+91 9876543210" />
              </div>
            </div>
          </div>
          <div className="form-group mb-4">
            <label>Address</label>
            <input type="text" className="form-control" defaultValue="123 Main St, Indiranagar, Bangalore" />
          </div>
        </div>
      </div>

      <div className="panel animate-fade-in mt-4" style={{ animationDelay: '0.2s', maxWidth: '800px', backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="panel-header">
          <h2 className="panel-title">Professional Details</h2>
        </div>
        <div className="panel-body">
          <div className="form-row mb-4">
            <div className="col-half">
              <div className="form-group mb-0">
                <label>Specialization</label>
                <input type="text" className="form-control" defaultValue="AC & Refrigeration Repair" readOnly />
              </div>
            </div>
            <div className="col-half">
              <div className="form-group mb-0">
                <label>Experience (Years)</label>
                <input type="text" className="form-control" defaultValue="5" readOnly />
              </div>
            </div>
          </div>
          <div className="form-group">
             <label>Verification Status</label>
             <div>
               <span className="badge badge-success">Verified DronePartner</span>
             </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 0' }}>
        <button style={{ width: '100%', padding: '14px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600 }}>
          Save Changes
        </button>
      </div>
      </main>
    </div>
  );
};

export default Profile;
