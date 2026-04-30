"use client";

import React, { useState } from 'react';
import { useJira } from '../context/JiraContext';
import styles from './ConfigurationModal.module.css';

export default function ConfigurationModal() {
  const { config, updateConfig, isLoaded } = useJira();
  
  const [formData, setFormData] = useState({
    domain: config.domain || '',
    email: config.email || '',
    apiToken: config.apiToken || '',
    storyPointField: config.storyPointField || 'customfield_10016'
  });

  if (!isLoaded || config.isConfigured) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic formatting
    let cleanDomain = formData.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    updateConfig({
      ...formData,
      domain: cleanDomain
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.overlay}>
      <div className={`glass-panel ${styles.modal}`}>
        <h2 className={`title-gradient ${styles.title}`}>Jira Setup</h2>
        <p className={styles.subtitle}>Please configure your Jira connection to view the dashboard.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Jira Domain (e.g. yourcompany.atlassian.net)</label>
            <input 
              type="text" 
              name="domain" 
              value={formData.domain} 
              onChange={handleChange} 
              required 
              placeholder="company.atlassian.net"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Jira Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="you@company.com"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>API Token</label>
            <input 
              type="password" 
              name="apiToken" 
              value={formData.apiToken} 
              onChange={handleChange} 
              required 
              placeholder="Your Jira API Token"
            />
            <small className={styles.helperText}>You can generate this in your Atlassian account security settings.</small>
          </div>

          <div className={styles.formGroup}>
            <label>Story Point Field ID</label>
            <input 
              type="text" 
              name="storyPointField" 
              value={formData.storyPointField} 
              onChange={handleChange} 
              required 
              placeholder="customfield_10016"
            />
            <small className={styles.helperText}>Default is often customfield_10016 or customfield_10004.</small>
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}
