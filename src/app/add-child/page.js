'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/data/store';
import EarthyBackground from '@/components/EarthyBackground';
import DatePicker from '@/components/DatePicker';
import './add-child.css';

export default function AddChildPage() {
  const router = useRouter();
  const { addChild, children } = useApp();
  const [form, setForm] = useState({
    childName: '',
    dob: '',
    gender: '',
    bloodGroup: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.childName.trim()) errs.childName = 'Child\'s name is required';
    if (!form.dob) errs.dob = 'Date of birth is required';
    else {
      const dob = new Date(form.dob);
      const today = new Date();
      if (dob > today) errs.dob = 'Date cannot be in the future';
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 6);
      if (dob < fiveYearsAgo) errs.dob = 'App supports children 0–5 years only';
    }
    if (!form.gender) errs.gender = 'Please select gender';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    addChild({
      childName: form.childName,
      dob: form.dob,
      gender: form.gender,
      bloodGroup: form.bloodGroup || null
    });

    router.push('/dashboard');
  };

  const hasExistingChildren = children.length > 0;

  return (
    <div className="add-child-page" data-theme={form.gender === 'female' ? 'pink' : form.gender === 'male' ? 'blue' : 'default'}>
      {/* Premium canvas fluid waves background with dynamic parenting theme */}
      <EarthyBackground theme={form.gender === 'female' ? 'pink' : form.gender === 'male' ? 'blue' : 'default'} />

      <div className="add-child-container animate-fade-in-up">
        {/* Header */}
        <div className="add-child-header">
          {hasExistingChildren && (
            <button className="auth-back" onClick={() => router.back()} id="add-child-back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 10H5M5 10l4-4M5 10l4 4"/>
              </svg>
            </button>
          )}
          <div>
            <div className="add-child-icon-wrap">
              <div 
                key={form.gender} 
                className={`add-child-icon ${form.gender === 'female' ? 'girl' : form.gender === 'male' ? 'boy' : ''}`}
              >
                {form.gender === 'female' ? '👧' : form.gender === 'male' ? '👦' : '👶'}
              </div>
            </div>
            <h1 className="auth-title">
              {hasExistingChildren ? 'Add Another Child' : 'Register Your Child'}
            </h1>
            <p className="auth-subtitle">
              {hasExistingChildren
                ? 'Add a sibling to your account'
                : 'Let\'s set up your child\'s vaccination journey'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" id="add-child-form">
          <div className="input-group">
            <label className="input-label" htmlFor="child-name">Child&apos;s Name</label>
            <input
              id="child-name"
              className={`input-field ${errors.childName ? 'input-error' : ''}`}
              type="text"
              placeholder="Enter child's full name"
              value={form.childName}
              onChange={e => handleChange('childName', e.target.value)}
            />
            {errors.childName && <span className="field-error">{errors.childName}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="child-dob">Date of Birth</label>
            <DatePicker
              id="child-dob"
              value={form.dob}
              onChange={(val) => handleChange('dob', val)}
              max={new Date().toISOString().split('T')[0]}
              error={!!errors.dob}
            />
            {errors.dob && <span className="field-error">{errors.dob}</span>}
          </div>

          {/* Gender selector */}
          <div className="input-group">
            <label className="input-label">Gender</label>
            <div className="gender-selector">
              <button
                type="button"
                className={`gender-option gender-boy ${form.gender === 'male' ? 'selected' : ''}`}
                onClick={() => handleChange('gender', 'male')}
                id="gender-boy"
              >
                <span className="gender-emoji">👦</span>
                <span className="gender-label">Boy</span>
              </button>
              <button
                type="button"
                className={`gender-option gender-girl ${form.gender === 'female' ? 'selected' : ''}`}
                onClick={() => handleChange('gender', 'female')}
                id="gender-girl"
              >
                <span className="gender-emoji">👧</span>
                <span className="gender-label">Girl</span>
              </button>
            </div>
            {errors.gender && <span className="field-error">{errors.gender}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="child-blood">Blood Group <span className="optional-tag">(Optional)</span></label>
            <select
              id="child-blood"
              className="input-field"
              value={form.bloodGroup}
              onChange={e => handleChange('bloodGroup', e.target.value)}
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A−</option>
              <option value="B+">B+</option>
              <option value="B-">B−</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB−</option>
              <option value="O+">O+</option>
              <option value="O-">O−</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
            id="add-child-submit"
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Setting Up...
              </span>
            ) : (
              <>
                Start Vaccination Journey
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 10h12M12 6l4 4-4 4"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
