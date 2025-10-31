import React, { useState, useEffect } from 'react';

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await fetch('/api/patients');
    const data = await response.json();
    setPatients(data);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
        Patient List
      </h2>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {patients.map((patient) => (
          <div 
            key={patient.id}
            style={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                {patient.name}
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Age: {patient.age} | Condition: {patient.condition}
              </p>
              <p style={{ color: '#999', fontSize: '12px' }}>
                Last Visit: {patient.lastVisit}
              </p>
            </div>
            <button
              onClick={() => handleDelete(patient.id)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientList;
