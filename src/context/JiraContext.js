"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const JiraContext = createContext();

export function JiraProvider({ children }) {
  const [config, setConfig] = useState({
    domain: '',
    email: '',
    apiToken: '',
    storyPointField: 'customfield_10016', // Default usually
    isConfigured: false,
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('jira_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.domain && parsed.email && parsed.apiToken) {
          setConfig({ ...parsed, isConfigured: true });
        } else {
          setConfig(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (newConfig) => {
    const updated = { ...config, ...newConfig, isConfigured: true };
    setConfig(updated);
    localStorage.setItem('jira_config', JSON.stringify(updated));
  };

  const clearConfig = () => {
    const cleared = {
      domain: '',
      email: '',
      apiToken: '',
      storyPointField: 'customfield_10016',
      isConfigured: false
    };
    setConfig(cleared);
    localStorage.removeItem('jira_config');
  };

  return (
    <JiraContext.Provider value={{ config, updateConfig, clearConfig, isLoaded }}>
      {children}
    </JiraContext.Provider>
  );
}

export function useJira() {
  return useContext(JiraContext);
}
