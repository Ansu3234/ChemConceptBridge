import React, { useState } from 'react';
import LoginModuleDashboard from '../components/TestResultsDashboard/LoginModuleDashboard';
import RegisterModuleDashboard from '../components/TestResultsDashboard/RegisterModuleDashboard';
import ConceptsModuleDashboard from '../components/TestResultsDashboard/ConceptsModuleDashboard';
import QuizModuleDashboard from '../components/TestResultsDashboard/QuizModuleDashboard';
import MisconceptionModuleDashboard from '../components/TestResultsDashboard/MisconceptionModuleDashboard';
import './ModuleDashboardsPage.css';

const ModuleDashboardsPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  const modules = [
    { id: 'login', name: '🔐 Login', component: LoginModuleDashboard },
    { id: 'register', name: '📚 Dashboard', component: RegisterModuleDashboard },
    { id: 'concepts', name: '🧪 Concepts', component: ConceptsModuleDashboard },
    { id: 'quiz', name: '📝 Quiz', component: QuizModuleDashboard },
    { id: 'misconception', name: '🤖 AI Detector', component: MisconceptionModuleDashboard }
  ];

  const activeModule = modules.find(m => m.id === activeTab);
  const ActiveComponent = activeModule?.component;

  return (
    <div className="module-dashboards-page">
      <div className="dashboards-header">
        <h1>🧬 ChemConcept Bridge - Test Dashboards</h1>
        <p className="dashboards-subtitle">Comprehensive testing results for all application modules</p>
      </div>

      <div className="module-tabs">
        {modules.map(module => (
          <button
            key={module.id}
            className={`module-tab ${activeTab === module.id ? 'active' : ''}`}
            onClick={() => setActiveTab(module.id)}
          >
            {module.name}
          </button>
        ))}
      </div>

      <div className="module-content">
        {ActiveComponent && <ActiveComponent />}
      </div>

      <div className="dashboards-footer">
        <p>© 2025 ChemConcept Bridge Testing Dashboard | All modules tested with real credentials</p>
      </div>
    </div>
  );
};

export default ModuleDashboardsPage;
