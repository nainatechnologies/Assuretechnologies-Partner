import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiInbox,
  FiTool,
  FiClock,
  FiCheckCircle,
  FiHome,
  FiBriefcase,
  FiLogOut,
  FiX,
  FiCamera,
  FiMapPin,
  FiPhone,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';
import './Dashboard.css';

type JobStatus = 'assigned' | 'inProgress' | 'awaiting' | 'completed';

export type ExtraItem = {
  id?: string;
  description: string;
  qty: number;
  status?: 'APPROVED' | 'REJECTED' | 'PENDING';
};

export type ProgressUpdate = {
  id: string;
  date: string;
  description: string;
  photos: string[];
};

type Job = {
  id: string;
  displayId: string;
  orderNumber?: string;
  title: string;
  date: string;
  timeSlot?: string;
  status: JobStatus;
  cropType?: string;
  user: {
    name: string;
    mobile: string;
  };
  location: {
    address: string;
    surveyNumber?: string;
    lat: number;
    lng: number;
  };
  progressUpdates?: ProgressUpdate[];
  extraItems?: ExtraItem[];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<JobStatus>('assigned');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [startWorkPhotos, setStartWorkPhotos] = useState<string[]>([]);
  const [startWorkFiles, setStartWorkFiles] = useState<File[]>([]);
  const [startWorkDescription, setStartWorkDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [completeWorkPhotos, setCompleteWorkPhotos] = useState<string[]>([]);
  const [completeWorkFiles, setCompleteWorkFiles] = useState<File[]>([]);

  // Daily Progress state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showExtraItemsModal, setShowExtraItemsModal] = useState(false);
  const [extraItemDesc, setExtraItemDesc] = useState('');
  const [extraItemQty, setExtraItemQty] = useState('');
  const [progressDescription, setProgressDescription] = useState('');
  const [progressPhotos, setProgressPhotos] = useState<string[]>([]);
  const [progressFiles, setProgressFiles] = useState<File[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingDuty, setTogglingDuty] = useState(false);

  // Previous Progress state
  const [showPreviousProgressModal, setShowPreviousProgressModal] = useState(false);
  const [selectedProgressUpdates, setSelectedProgressUpdates] = useState<ProgressUpdate[]>([]);

  const { data = { jobs: [], totalPages: 1 }, isLoading: loading } = useQuery({
    queryKey: ['service-bookings', page],
    queryFn: async () => {
      const res = await api.get(`/partner/service-bookings?page=${page}&limit=${limit}`);
      if (res.data && res.data.success) {
        if (res.data.is_online !== undefined) {
          setIsOnline(Boolean(res.data.is_online));
        }
        const rawJobs = res.data.data || [];
        const meta = res.data.meta || { totalPages: 1 };
        const jobs = rawJobs.map((raw: any) => {
          let mappedStatus: JobStatus = 'assigned';
          if (raw.status === 'IN_PROGRESS') mappedStatus = 'inProgress';
          else if (raw.status === 'AWAITING_APPROVAL') mappedStatus = 'awaiting';
          else if (raw.status === 'COMPLETED') mappedStatus = 'completed';

          let surveyNumber = '';
          let cropType = '';
          if (raw.metadata && typeof raw.metadata === 'object') {
            const cf = raw.metadata.custom_fields || raw.metadata;
            if (cf.fld_1) surveyNumber = cf.fld_1;
            if (cf.fld_2) cropType = cf.fld_2;
            if (cf.survey_number) surveyNumber = cf.survey_number;
            if (cf.surveyNumber) surveyNumber = cf.surveyNumber;
            if (cf.crop_type) cropType = cf.crop_type;
            if (cf.cropType) cropType = cf.cropType;
          }

          const formatAddr = (addr: any, pin?: string) => {
            if (!addr) return '';
            try {
              const parsed = typeof addr === 'string' ? JSON.parse(addr) : addr;
              if (parsed && typeof parsed === 'object') {
                const parts = [parsed.line1, parsed.line2, parsed.landmark, parsed.city, parsed.state, parsed.country].filter(Boolean);
                const postal = parsed.pincode || pin;
                if (parts.length > 0) {
                  let formatted = parts.join(', ');
                  if (postal && !formatted.includes(postal)) formatted += ` - ${postal}`;
                  return formatted;
                }
              }
              return typeof addr === 'string' ? addr : '';
            } catch {
              return typeof addr === 'string' ? addr : '';
            }
          };

          let formattedAddress = formatAddr(raw.address, raw.pincode) || formatAddr(raw.Order?.customer_address, raw.pincode);

          if (!formattedAddress && raw.metadata?.custom_fields) {
            const cf = raw.metadata.custom_fields;
            const parts = [cf.fld_5, cf.fld_4, cf.fld_3].filter(Boolean);
            if (parts.length > 0) formattedAddress = parts.join(', ');
          }

          if (!formattedAddress) {
            formattedAddress = 'Address not provided';
          }

          return {
            id: raw.id,
            displayId: raw.display_id || raw.id.substring(0, 8),
            orderNumber: raw.Order?.order_number || '',
            title: raw.Service?.name || 'Partner Service Booking',
            date: raw.scheduled_date ? new Date(raw.scheduled_date).toLocaleDateString('en-GB') : 'N/A',
            timeSlot: raw.scheduled_time_slot || raw.metadata?.scheduled_time_slot || '',
            status: mappedStatus,
            cropType,
            user: {
              name: raw.Order?.customer_name || 'Customer',
              mobile: raw.Order?.customer_contact || 'N/A'
            },
            location: {
              address: formattedAddress,
              surveyNumber: surveyNumber || undefined,
              lat: Number(raw.lat) || (raw.metadata?.geolocation ? Number(raw.metadata.geolocation.split(',')[0].trim()) : 0),
              lng: Number(raw.lng) || (raw.metadata?.geolocation ? Number(raw.metadata.geolocation.split(',')[1].trim()) : 0)
            },
            progressUpdates: (raw.progress_updates || []).map((p: any) => ({
              id: p.id,
              date: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A',
              description: p.description,
              photos: p.photos || []
            })),
            extraItems: (raw.extra_items || raw.extraItems || raw.ExtraItemsRequests || []).map((e: any) => ({
              id: String(e.id),
              description: e.description,
              qty: Number(e.qty) || 1,
              status: e.status || 'PENDING'
            }))
          };
        });
        return { jobs, totalPages: meta.totalPages };
      }
      return { jobs: [], totalPages: 1 };
    }
  });

  const jobs = data.jobs as Job[];
  const totalPages = data.totalPages;

  const handleStartWorkClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setStartWorkPhotos([]);
    setStartWorkDescription('');
    setShowStartModal(true);
  };

  const handleToggleDuty = async () => {
    try {
      setTogglingDuty(true);
      const nextStatus = !isOnline;
      const res = await api.patch('/duty-status', { is_online: nextStatus });
      if (res.data && res.data.success) {
        setIsOnline(Boolean(res.data.data.is_online));
      }
    } catch (e) {
      console.error('Duty toggle error:', e);
    } finally {
      setTogglingDuty(false);
    }
  };

  const confirmStartWork = async () => {
    if (!selectedJobId) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('action', 'START_WORK');
      if (startWorkDescription) formData.append('description', startWorkDescription);
      startWorkFiles.forEach(file => formData.append('photos', file));

      await api.patch(`/partner/service-bookings/${selectedJobId}/action`, formData);
      setIsOnline(true);
      toast.success('Job started successfully!');
      setShowStartModal(false);
      setSelectedJobId(null);
      setStartWorkPhotos([]);
      setStartWorkFiles([]);
      setStartWorkDescription('');
      await queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
      setActiveTab('inProgress');
    } catch (err: any) {
      console.error('Start work failed:', err);
      toast.error(err.response?.data?.message || 'Failed to start work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - startWorkPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      setStartWorkFiles(prev => [...prev, ...filesToProcess]);
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setStartWorkPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setStartWorkPhotos(prev => prev.filter((_, i) => i !== index));
    setStartWorkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteWorkClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setWorkDescription('');
    setCompleteWorkPhotos([]);
    setShowCompleteModal(true);
  };

  const submitCompleteWork = async () => {
    if (!selectedJobId) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('action', 'COMPLETE_WORK');
      if (workDescription) formData.append('description', workDescription);
      completeWorkFiles.forEach(file => formData.append('photos', file));

      await api.patch(`/partner/service-bookings/${selectedJobId}/action`, formData);
      toast.success('Work marked completed! Awaiting approval.');
      setShowCompleteModal(false);
      setSelectedJobId(null);
      setWorkDescription('');
      setCompleteWorkPhotos([]);
      setCompleteWorkFiles([]);
      await queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
      setActiveTab('awaiting');
    } catch (err: any) {
      console.error('Complete work failed:', err);
      toast.error(err.response?.data?.message || 'Failed to complete work');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - completeWorkPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      setCompleteWorkFiles(prev => [...prev, ...filesToProcess]);
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setCompleteWorkPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeCompletePhoto = (index: number) => {
    setCompleteWorkPhotos(prev => prev.filter((_, i) => i !== index));
    setCompleteWorkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProgressClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setProgressDescription('');
    setProgressPhotos([]);
    setShowProgressModal(true);
  };

  const submitProgressUpdate = async () => {
    if (!selectedJobId || !progressDescription) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('action', 'ADD_PROGRESS');
      formData.append('description', progressDescription);
      progressFiles.forEach(file => formData.append('photos', file));

      await api.patch(`/partner/service-bookings/${selectedJobId}/action`, formData);
      toast.success('Progress update recorded!');
      setShowProgressModal(false);
      setSelectedJobId(null);
      setProgressDescription('');
      setProgressPhotos([]);
      setProgressFiles([]);
      await queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
    } catch (err: any) {
      console.error('Add progress failed:', err);
      toast.error(err.response?.data?.message || 'Failed to add progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgressPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - progressPhotos.length;
      const filesToProcess = filesArray.slice(0, remainingSlots);

      setProgressFiles(prev => [...prev, ...filesToProcess]);
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setProgressPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeProgressPhoto = (index: number) => {
    setProgressPhotos(prev => prev.filter((_, i) => i !== index));
    setProgressFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewPreviousProgress = (updates: ProgressUpdate[]) => {
    setSelectedProgressUpdates(updates);
    setShowPreviousProgressModal(true);
  };


  const handleAddExtraItemsClick = (id: string) => {
    setSelectedJobId(id);
    setExtraItemDesc('');
    setExtraItemQty('');
    setShowExtraItemsModal(true);
  };

  const submitExtraItems = async () => {
    if (!selectedJobId || !extraItemDesc.trim() || !extraItemQty.trim()) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/partner/service-bookings/${selectedJobId}/action`, {
        action: 'REQUEST_EXTRA_ITEMS',
        description: extraItemDesc.trim(),
        extraItems: [
          {
            description: extraItemDesc.trim(),
            qty: Number(extraItemQty)
          }
        ]
      });
      toast.success('Extra items requested successfully!');
      setShowExtraItemsModal(false);
      setSelectedJobId(null);
      setExtraItemDesc('');
      setExtraItemQty('');
      await queryClient.invalidateQueries({ queryKey: ['service-bookings'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request extra items');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getJobCount = (status: JobStatus) => {
    return jobs.filter(job => job.status === status).length;
  };

  const renderJobs = () => {
    if (loading) {
      return (
        <div className="empty-state" style={{ padding: '40px 0', textAlign: 'center' }}>
          <FiRefreshCw className="animate-spin" size={28} style={{ color: '#2563eb', margin: '0 auto 12px' }} />
          <p>Loading assigned jobs...</p>
        </div>
      );
    }

    const filteredJobs = jobs.filter(job => job.status === activeTab);

    if (filteredJobs.length === 0) {
      const messages = {
        assigned: 'No new assigned jobs found',
        inProgress: 'No jobs currently in progress',
        awaiting: 'No jobs awaiting completion approval',
        completed: 'No completed jobs yet'
      };
      return <div className="empty-state">{messages[activeTab]}</div>;
    }

    return filteredJobs.map((job) => (
      <div key={job.id} className="job-card">
        <div className="job-card-header">
          <div>
            <h3 className="job-title">{job.title}</h3>
            {job.cropType && (
              <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                Crop: {job.cropType}
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="job-id" style={{ display: 'block', fontWeight: 700, color: '#1e3a8a' }}>{job.displayId}</span>
            {job.orderNumber && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.orderNumber}</span>}
          </div>
        </div>

        <div className="job-details">
          <p className="job-date">Scheduled: {job.date}{job.timeSlot ? ` • ${job.timeSlot}` : ''}</p>
          
          <div className="job-customer-section">
            <div className="job-customer-item">
              <FiUser className="customer-icon" />
              <span>{job.user.name}</span>
            </div>
            <div className="job-customer-item">
              <FiPhone className="customer-icon" />
              <a href={`tel:${job.user.mobile}`} className="contact-link">{job.user.mobile}</a>
            </div>
          </div>

          <div className="job-location-section">
            <FiMapPin className="location-icon" />
            <div className="location-content" style={{width: '100%'}}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                {job.location.surveyNumber ? (
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Survey No: {job.location.surveyNumber}</span>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Service Location</span>
                )}
                {job.location.lat && job.location.lng ? (
                  <a 
                    href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="directions-link"
                    style={{ marginTop: 0 }}
                  >
                    Get Directions
                  </a>
                ) : null}
              </div>
              <p className="address-text">{job.location.address}</p>
            </div>
          </div>
        </div>


        {job.extraItems && job.extraItems.length > 0 && (
          <div style={{ marginTop: '12px', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Requested Extra Items:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {job.extraItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{item.description} (Qty: {item.qty})</span>
                  {item.status === 'APPROVED' && (
                    <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiCheckCircle size={12} /> Approved by Customer
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiX size={12} /> Declined by Customer
                    </span>
                  )}
                  {item.status === 'PENDING' && (
                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock size={12} /> Pending Decision
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="job-actions">
          {job.progressUpdates && job.progressUpdates.length > 0 && (
            <button 
              className="btn-action btn-previous-progress" 
              onClick={() => handleViewPreviousProgress(job.progressUpdates!)}
            >
              Previous Progress ({job.progressUpdates.length})
            </button>
          )}
          {job.status === 'assigned' && (
            <button className="btn-action btn-start-work" onClick={() => handleStartWorkClick(job.id)}>
              Start Work
            </button>
          )}
          {job.status === 'inProgress' && (
            <>
              <button 
                className="btn-action btn-add-progress" 
                style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }} 
                onClick={() => handleAddExtraItemsClick(job.id)}
              >
                Add Extra Items
              </button>
              <button className="btn-action btn-add-progress" onClick={() => handleAddProgressClick(job.id)}>
                Add Progress
              </button>
              <button className="btn-action btn-complete-work" onClick={() => handleCompleteWorkClick(job.id)}>
                Complete Work
              </button>
            </>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Partner Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleToggleDuty}
            disabled={togglingDuty}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: isOnline ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.4)',
              backgroundColor: isOnline ? '#10b981' : 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: togglingDuty ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isOnline ? 'You are ON duty (Receiving new job assignments)' : 'You are OFF duty (Hidden from new job assignments)'}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#ffffff' : 'rgba(255,255,255,0.6)'
              }}
            />
            {togglingDuty ? 'Updating...' : isOnline ? 'Duty ON' : 'Duty OFF'}
          </button>
          <button className="profile-btn" onClick={() => navigate('/profile')}>
            <FiUser size={24} />
          </button>
        </div>
      </header>

      {/* Start Work Modal */}
      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Start Work</h2>
              <button className="close-btn" onClick={() => setShowStartModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body">
              <textarea
                className="work-description-input"
                placeholder="Initial observations (e.g. Arrived on site, checking field...)"
                value={startWorkDescription}
                onChange={(e) => setStartWorkDescription(e.target.value)}
                rows={4}
              ></textarea>

              <div className="photo-upload-section">
                <p className="upload-instruction">Upload initial photos (optional, up to 3):</p>
                <div className="photo-previews">
                  {startWorkPhotos.map((photo, index) => (
                    <div key={index} className="photo-thumbnail">
                      <img src={photo} alt={`Start work preview ${index + 1}`} />
                      <button className="remove-photo-btn" onClick={() => removePhoto(index)}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {startWorkPhotos.length < 3 && (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden-file-input"
                      />
                      <div className="upload-placeholder">
                        <FiCamera size={24} />
                        <span>Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowStartModal(false)}>Cancel</button>
              <button
                className="btn-modal btn-submit"
                onClick={confirmStartWork}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Starting...' : 'Confirm & Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Progress Modal */}
      {showProgressModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Add Daily Progress</h2>
              <button className="close-btn" onClick={() => setShowProgressModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body">
              <textarea
                placeholder="Describe progress made today..."
                value={progressDescription}
                onChange={(e) => setProgressDescription(e.target.value)}
                className="work-description-input"
                rows={4}
              ></textarea>

              <div className="photo-upload-section">
                <p className="upload-instruction">Upload progress photos (optional):</p>
                <div className="photo-previews">
                  {progressPhotos.map((photo, index) => (
                    <div key={index} className="photo-thumbnail">
                      <img src={photo} alt={`Progress preview ${index + 1}`} />
                      <button className="remove-photo-btn" onClick={() => removeProgressPhoto(index)}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {progressPhotos.length < 3 && (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProgressPhotoUpload}
                        className="hidden-file-input"
                      />
                      <div className="upload-placeholder">
                        <FiCamera size={24} />
                        <span>Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowProgressModal(false)}>Cancel</button>
              <button 
                className="btn-modal btn-submit"
                onClick={submitProgressUpdate}
                disabled={!progressDescription || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Progress'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Add Extra Items Modal */}
      {showExtraItemsModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal" style={{ maxWidth: '420px', width: '90%' }}>
            <div className="complete-modal-header" style={{ backgroundColor: '#f59e0b' }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Add Extra Items</h2>
              <button className="close-btn" onClick={() => setShowExtraItemsModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  Item Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra 2L fertilizer or Spare blades"
                  value={extraItemDesc}
                  onChange={(e) => setExtraItemDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={extraItemQty}
                  onChange={(e) => setExtraItemQty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div className="complete-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button"
                className="btn-modal btn-cancel" 
                onClick={() => setShowExtraItemsModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal"
                onClick={submitExtraItems}
                disabled={isSubmitting || !extraItemDesc.trim() || !extraItemQty.trim()}
                style={{ 
                  backgroundColor: '#f59e0b', 
                  color: 'white',
                  cursor: (isSubmitting || !extraItemDesc.trim() || !extraItemQty.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Work Modal */}
      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Complete Work</h2>
              <button className="close-btn" onClick={() => setShowCompleteModal(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="complete-modal-body">
              <textarea
                placeholder="Work completion summary notes..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="work-description-input"
                rows={4}
              ></textarea>

              <div className="photo-upload-section">
                <p className="upload-instruction">Upload completion photos:</p>
                <div className="photo-previews">
                  {completeWorkPhotos.map((photo, index) => (
                    <div key={index} className="photo-thumbnail">
                      <img src={photo} alt={`Complete preview ${index + 1}`} />
                      <button className="remove-photo-btn" onClick={() => removeCompletePhoto(index)}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  {completeWorkPhotos.length < 3 && (
                    <label className="photo-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleCompletePhotoUpload}
                        className="hidden-file-input"
                      />
                      <div className="upload-placeholder">
                        <FiCamera size={24} />
                        <span>Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowCompleteModal(false)}>Cancel</button>
              <button
                className="btn-modal btn-submit"
                onClick={submitCompleteWork}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Completion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Progress Modal */}
      {showPreviousProgressModal && (
        <div className="modal-overlay">
          <div className="modal-content complete-modal">
            <div className="complete-modal-header">
              <h2>Previous Progress Timeline</h2>
              <button className="close-btn" onClick={() => setShowPreviousProgressModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <div className="complete-modal-body previous-progress-body">
              {selectedProgressUpdates.length > 0 ? (
                <div className="progress-timeline">
                  {selectedProgressUpdates.map(update => (
                    <div key={update.id} className="progress-timeline-item">
                      <div className="progress-timeline-date">{update.date}</div>
                      <div className="progress-timeline-desc">{update.description}</div>
                      {update.photos && update.photos.length > 0 && (
                        <div className="progress-timeline-photos">
                          {update.photos.map((photo, index) => (
                            <img key={index} src={photo} alt={`Progress ${index + 1}`} className="progress-photo-thumb" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b' }}>No previous progress updates logged yet.</p>
              )}
            </div>
            <div className="complete-modal-footer">
              <button className="btn-modal btn-cancel" onClick={() => setShowPreviousProgressModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div
            className={`summary-card ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            <div className="icon-wrapper blue">
              <FiInbox size={20} />
            </div>
            <div className="summary-info">
              <h3>Assigned Jobs</h3>
              <p>{getJobCount('assigned')} pending</p>
            </div>
          </div>

          <div
            className={`summary-card ${activeTab === 'inProgress' ? 'active' : ''}`}
            onClick={() => setActiveTab('inProgress')}
          >
            <div className="icon-wrapper yellow">
              <FiTool size={20} />
            </div>
            <div className="summary-info">
              <h3>Work In Progress</h3>
              <p>{getJobCount('inProgress')} active</p>
            </div>
          </div>

          <div
            className={`summary-card ${activeTab === 'awaiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('awaiting')}
          >
            <div className="icon-wrapper cyan">
              <FiClock size={20} />
            </div>
            <div className="summary-info">
              <h3>Awaiting Approval</h3>
              <p>{getJobCount('awaiting')} waiting</p>
            </div>
          </div>

          <div
            className={`summary-card ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="icon-wrapper green">
              <FiCheckCircle size={20} />
            </div>
            <div className="summary-info">
              <h3>Completed Jobs</h3>
              <p>{getJobCount('completed')} done</p>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="job-list">
          {renderJobs()}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '20px 0', paddingBottom: '80px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: page === 1 ? '#f1f5f9' : '#ffffff', color: page === 1 ? '#94a3b8' : '#0f172a', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: page === totalPages ? '#f1f5f9' : '#ffffff', color: page === totalPages ? '#94a3b8' : '#0f172a', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          <FiHome size={24} />
          <span>Home</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'inProgress' ? 'active' : ''}`}
          onClick={() => setActiveTab('inProgress')}
        >
          <FiTool size={24} />
          <span>In Progress</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <FiBriefcase size={24} />
          <span>Jobs</span>
        </button>
        <button className="nav-item" onClick={handleLogout}>
          <FiLogOut size={24} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
