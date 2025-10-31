import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  date: string;
  provider: string;
  type: string;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  refills: number;
}

interface DashboardData {
  appointments: Appointment[];
  prescriptions: Prescription[];
  messages: number;
}

interface DashboardProps {
  patientId: string;
}

/**
 * Dashboard component for the patient portal
 * Displays upcoming appointments, active prescriptions, and message count
 * 
 * @param {DashboardProps} props - Component props
 * @returns {JSX.Element} Dashboard component
 */
export default function Dashboard({ patientId }: DashboardProps): JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/patients/${patientId}/dashboard`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchDashboardData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Upcoming Appointments</h2>
          <p className="text-4xl font-bold text-blue-600">{data.appointments.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Active Prescriptions</h2>
          <p className="text-4xl font-bold text-green-600">{data.prescriptions.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unread Messages</h2>
          <p className="text-4xl font-bold text-purple-600">{data.messages}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
          {data.appointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <ul className="space-y-3">
              {data.appointments.map((appointment) => (
                <li key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-gray-900">{appointment.type}</p>
                  <p className="text-sm text-gray-600">{appointment.provider}</p>
                  <p className="text-sm text-gray-500">{appointment.date}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Prescriptions</h2>
          {data.prescriptions.length === 0 ? (
            <p className="text-gray-500">No active prescriptions</p>
          ) : (
            <ul className="space-y-3">
              {data.prescriptions.map((prescription) => (
                <li key={prescription.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-semibold text-gray-900">{prescription.medication}</p>
                  <p className="text-sm text-gray-600">{prescription.dosage}</p>
                  <p className="text-sm text-gray-500">{prescription.refills} refills remaining</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
