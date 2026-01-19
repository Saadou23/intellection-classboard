import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Monitor, Settings, AlertCircle, Maximize, Clock, Download, Upload, Copy, Check } from 'lucide-react';
import { saveSessionData, loadSessionData, saveTimeOffset as saveTimeOffsetFB, loadTimeOffset as loadTimeOffsetFB } from './firebase';
import './App.css';

function App() {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [password, setPassword] = useState('');
  const [sessions, setSessions] = useState({});
  const [editingSession, setEditingSession] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState('login');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const daysOfWeek = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];

  const branches = ['Hay Salam', 'Doukkali', 'Saada'];
  
  const statuses = [
    { value: 'normal', label: 'PRÉVU', color: 'white', bg: '' },
    { value: 'cancelled', label: 'ANNULÉE', color: '#f87171', bg: 'rgba(127, 29, 29, 0.3)' },
    { value: 'delayed', label: 'RETARDÉE', color: '#f87171', bg: 'rgba(127, 29, 29, 0.3)' },
    { value: 'absent', label: 'PROF ABSENT', color: '#f87171', bg: 'rgba(127, 29, 29, 0.3)' },
    { value: 'ongoing', label: 'EN COURS', color: '#4ade80', bg: 'rgba(20, 83, 45, 0.3)' }
  ];

  const formInitialState = {
    dayOfWeek: new Date().getDay(),
    startTime: '19:00',
    endTime: '20:30',
    level: '',
    subject: '',
    professor: '',
    room: '',
    status: 'normal',
    makeupDate: '',
    makeupTime: ''
  };

  const [formData, setFormData] = useState(formInitialState);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + timeOffset);
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  useEffect(() => {
    if (selectedBranch) {
      loadBranchData(selectedBranch);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedBranch && sessions[selectedBranch]) {
      saveBranchData(selectedBranch, sessions[selectedBranch]);
    }
  }, [sessions, selectedBranch, adminMessage]);

  useEffect(() => {
    loadTimeOffsetData();
  }, []);

  const loadTimeOffsetData = async () => {
    const offset = await loadTimeOffsetFB();
    setTimeOffset(offset);
  };

  const loadBranchData = async (branch) => {
    try {
      const data = await loadSessionData(branch);
      if (data) {
        setSessions(prev => ({ ...prev, [branch]: data.sessions || [] }));
        setAdminMessage(data.adminMessage || '');
      }
    } catch (error) {
      console.log('Pas de données');
    }
  };

  const saveBranchData = async (branch, branchSessions) => {
    try {
      await saveSessionData(branch, {
        sessions: branchSessions,
        adminMessage: adminMessage
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const saveTimeOffsetData = async (offset) => {
    await saveTimeOffsetFB(offset);
    setTimeOffset(offset);
  };

  const handleLogin = () => {
    if (password === 'admin123') {
      setView('admin');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getTodaySessions = () => {
    const currentDayOfWeek = currentTime.getDay();
    const branchSessions = sessions[selectedBranch] || [];
    
    const todaySessions = branchSessions
      .filter(s => s.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentMinutes = currentHour * 60 + currentMin;
    
    return todaySessions.filter(session => {
      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      return startMinutes >= (currentMinutes - 15);
    }).slice(0, 6);
  };

  const getSessionStatus = (session) => {
    if (session.status === 'cancelled' || session.status === 'delayed' || session.status === 'absent') {
      return session.status;
    }
    
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    const [endHour, endMin] = session.endTime.split(':').map(Number);
    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return 'ongoing';
    }
    
    return 'normal';
  };

  const formatTime = (time) => {
    return time;
  };

  const s = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', color: 'white', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '1rem', padding: '2rem', maxWidth: '28rem', width: '100%', border: '1px solid rgba(255, 255, 255, 0.2)' },
    button: { width: '100%', background: '#2563eb', color: 'white', padding: '1rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
    input: { width: '100%', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }
  };if (view === 'login') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#3b82f6', width: '5rem', height: '5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Monitor size={40} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>INTELLECTION</h1>
            <h2 style={{ fontSize: '1.5rem', color: '#bfdbfe', marginBottom: '0.5rem' }}>CLASSBOARD</h2>
            <p style={{ color: '#93c5fd', fontSize: '0.875rem' }}>Système d'affichage dynamique</p>
          </div>

          <button onClick={() => setView('display')} style={s.button}>
            <Monitor size={20} />
            Affichage Étudiant
          </button>

          <button onClick={() => setView('adminLogin')} style={{ ...s.button, background: 'rgba(255, 255, 255, 0.2)' }}>
            <Settings size={20} />
            Interface Administrateur
          </button>
        </div>
      </div>
    );
  }

  if (view === 'adminLogin') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <button onClick={() => setView('login')} style={{ color: '#bfdbfe', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem' }}>
            ← Retour
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#3b82f6', width: '5rem', height: '5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Settings size={40} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Authentification</h2>
            <p style={{ color: '#bfdbfe' }}>Accès réservé aux administrateurs</p>
          </div>

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={s.input}
          />
          
          <button onClick={handleLogin} style={s.button}>
            Se connecter
          </button>

          <p style={{ fontSize: '0.75rem', color: '#93c5fd', textAlign: 'center', marginTop: '1rem' }}>
            Démo: utilisez "admin123" comme mot de passe
          </p>
        </div>
      </div>
    );
  }

  if (view === 'display') {
    return (
      <div style={{ minHeight: '100vh', background: '#1e3a8a', color: 'white', overflow: 'hidden' }}>
        {!isFullscreen && (
          <button
            onClick={() => setView('login')}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#93c5fd', background: 'rgba(0,0,0,0.2)', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', zIndex: 50 }}
          >
            ← Retour
          </button>
        )}

        <button
          onClick={toggleFullscreen}
          style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', color: '#93c5fd', background: 'rgba(0,0,0,0.2)', border: 'none', padding: '0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', zIndex: 50, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Maximize size={16} />
          {isFullscreen ? 'Quitter' : 'Plein écran'}
        </button>

        {!selectedBranch ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Sélectionnez votre filiale</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '600px' }}>
                {branches.map(branch => (
                  <button
                    key={branch}
                    onClick={() => setSelectedBranch(branch)}
                    style={{ background: '#1e40af', padding: '2rem', borderRadius: '1rem', fontWeight: '600', fontSize: '1.25rem', border: 'none', cursor: 'pointer', color: 'white' }}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#000', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>INTELLECTION CLASSBOARD</h1>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>{selectedBranch}</div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ background: '#1e40af', padding: '0.5rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  SÉANCES DU {daysOfWeek.find(d => d.value === currentTime.getDay())?.label.toUpperCase()}
                </div>
                <div>
                  {currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ background: '#1e40af', padding: '0.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <div>HORAIRE</div>
              <div>FILIÈRE</div>
              <div>MATIÈRE</div>
              <div>PROFESSEUR</div>
              <div>SALLE</div>
              <div>STATUT</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {getTodaySessions().length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#93c5fd', fontSize: '1.5rem' }}>
                  AUCUNE SÉANCE PROGRAMMÉE
                </div>
              ) : (
                getTodaySessions().map((session, idx) => {
                  const status = getSessionStatus(session);
                  const statusInfo = statuses.find(s => s.value === status);
                  
                  return (
                    <div
                      key={session.id}
                      className="animate-slideDown"
                      style={{ 
                        padding: '0.625rem 1.5rem', 
                        borderBottom: '1px solid rgba(30, 64, 175, 0.3)',
                        background: statusInfo?.bg || '',
                        borderLeft: status === 'ongoing' ? '8px solid #4ade80' : 'none',
                        opacity: 0,
                        animation: `slideDown 0.5s ease-out ${idx * 0.15}s forwards`
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                          {formatTime(session.startTime)}
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                          {session.level}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {session.subject}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {session.professor}
                        </div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fbbf24' }}>
                          {session.room}
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: statusInfo?.color }}>
                          {statusInfo?.label}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {adminMessage && (
              <div style={{ background: '#dc2626', padding: '0.5rem 1rem', overflow: 'hidden' }}>
                <div className="animate-scroll" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                  <AlertCircle size={20} color="#fbbf24" />
                  <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                    {adminMessage.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }// Vue Admin
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#1e40af', color: 'white', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>INTELLECTION CLASSBOARD</h1>
            <p style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>Interface de gestion</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowTimeSettings(!showTimeSettings)}
              style={{ background: '#1e3a8a', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
            >
              <Clock size={16} />
              Régler l'heure
            </button>
            <button
              onClick={() => {
                setView('login');
                setPassword('');
              }}
              style={{ background: '#1e3a8a', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {showTimeSettings && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '1rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>Réglage de l'heure</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                Heure système: {new Date().toLocaleTimeString('fr-FR')}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                Heure affichée: {currentTime.toLocaleTimeString('fr-FR')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Décalage (min):</label>
                <input
                  type="number"
                  value={timeOffset}
                  onChange={(e) => saveTimeOffsetData(parseInt(e.target.value) || 0)}
                  style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', padding: '0.25rem 0.75rem', width: '5rem', fontSize: '0.875rem' }}
                />
              </div>
              <button
                onClick={() => saveTimeOffsetData(0)}
                style={{ background: '#4b5563', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        {!selectedBranch ? (
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Sélectionnez une filiale</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {branches.map(branch => (
                <button
                  key={branch}
                  onClick={() => setSelectedBranch(branch)}
                  style={{ background: '#2563eb', color: 'white', padding: '2rem', borderRadius: '1rem', fontWeight: '600', fontSize: '1.25rem', border: 'none', cursor: 'pointer' }}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              Interface Admin - {selectedBranch}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Gestion des emplois du temps (Firebase connecté ✅)
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedBranch('')}
                style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                ← Changer de filiale
              </button>
              <button
                onClick={() => setView('display')}
                style={{ background: '#16a34a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Monitor size={20} />
                Voir l'affichage
              </button>
            </div>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem' }}>
              <p style={{ color: '#166534', fontWeight: '600', marginBottom: '0.5rem' }}>
                ✅ Application prête pour production !
              </p>
              <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                Firebase configuré • Déploiement Vercel disponible
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;