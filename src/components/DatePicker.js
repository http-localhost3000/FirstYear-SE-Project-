'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import './DatePicker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d} ${MONTH_SHORT[parseInt(m, 10) - 1]} ${y}`;
}

export default function DatePicker({ value, onChange, max, error, id }) {
  const today = new Date();
  const maxDate = max ? new Date(max + 'T00:00:00') : today;

  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  // 'days' | 'year' | 'month'
  const [view, setView] = useState('days');
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor(initialDate.getFullYear() / 12) * 12);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setView('days');
    }, 150);
  }, []);

  const handleOpen = () => {
    if (open) { handleClose(); return; }
    const d = value ? new Date(value + 'T00:00:00') : today;
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setYearRangeStart(Math.floor(d.getFullYear() / 12) * 12);
    setView('days');
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (day) => {
    const selected = new Date(viewYear, viewMonth, day);
    if (selected > maxDate) return;
    onChange(formatDate(selected));
    handleClose();
  };

  const selectYear = (yr) => {
    setViewYear(yr);
    setView('month');
  };

  const selectMonth = (mo) => {
    setViewMonth(mo);
    setView('days');
  };

  const goToday = () => {
    if (today <= maxDate) {
      onChange(formatDate(today));
      handleClose();
    }
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    cells.push({
      day: d, type: 'current',
      isDisabled: date > maxDate,
      isToday: d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear(),
      isSelected: value && d === parseInt(value.split('-')[2], 10) &&
        viewMonth === parseInt(value.split('-')[1], 10) - 1 &&
        viewYear === parseInt(value.split('-')[0], 10),
    });
  }
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, type: 'next' });

  // Year grid: 12 years per page
  const yearCells = [];
  for (let i = 0; i < 12; i++) yearCells.push(yearRangeStart + i);

  return (
    <div className="custom-datepicker" ref={containerRef}>
      <button
        type="button"
        className={`datepicker-trigger input-field ${error ? 'input-error' : ''} ${value ? 'has-value' : ''}`}
        onClick={handleOpen}
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="datepicker-trigger-text">
          {value ? formatDisplay(value) : 'Select date of birth'}
        </span>
        <svg className="datepicker-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="14" height="14" rx="2" />
          <path d="M3 8h14" />
          <path d="M7 2v4" />
          <path d="M13 2v4" />
        </svg>
      </button>

      {open && (
        <div className={`datepicker-dropdown ${closing ? 'closing' : ''}`} role="dialog" aria-label="Choose date">

          {/* ===== DAYS VIEW ===== */}
          {view === 'days' && (
            <>
              <div className="datepicker-header">
                <button type="button" className="datepicker-nav-btn" onClick={prevMonth} aria-label="Previous month">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4l-5 5 5 5" /></svg>
                </button>
                <button type="button" className="datepicker-title-btn" onClick={() => { setYearRangeStart(Math.floor(viewYear / 12) * 12); setView('year'); }}>
                  {MONTH_SHORT[viewMonth]} {viewYear}
                </button>
                <button type="button" className="datepicker-nav-btn" onClick={nextMonth} aria-label="Next month">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 4l5 5-5 5" /></svg>
                </button>
              </div>

              <div className="datepicker-weekdays">
                {DAY_LABELS.map(d => <span key={d} className="datepicker-weekday">{d}</span>)}
              </div>

              <div className="datepicker-grid">
                {cells.map((cell, i) => {
                  if (cell.type !== 'current') {
                    return <span key={`o-${i}`} className="datepicker-day other-month">{cell.day}</span>;
                  }
                  const cls = ['datepicker-day'];
                  if (cell.isSelected) cls.push('selected');
                  if (cell.isToday && !cell.isSelected) cls.push('today');
                  if (cell.isDisabled) cls.push('disabled');
                  return (
                    <button key={`d-${cell.day}`} type="button" className={cls.join(' ')}
                      onClick={() => !cell.isDisabled && selectDate(cell.day)}
                      disabled={cell.isDisabled}>{cell.day}</button>
                  );
                })}
              </div>

              <div className="datepicker-footer">
                <button type="button" className="datepicker-footer-btn clear" onClick={() => { onChange(''); handleClose(); }}>Clear</button>
                <button type="button" className="datepicker-footer-btn today-btn" onClick={goToday}>Today</button>
              </div>
            </>
          )}

          {/* ===== YEAR VIEW ===== */}
          {view === 'year' && (
            <>
              <div className="datepicker-header">
                <button type="button" className="datepicker-nav-btn" onClick={() => setYearRangeStart(y => y - 12)} aria-label="Previous years">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4l-5 5 5 5" /></svg>
                </button>
                <span className="datepicker-title-label">{yearRangeStart} – {yearRangeStart + 11}</span>
                <button type="button" className="datepicker-nav-btn" onClick={() => setYearRangeStart(y => y + 12)} aria-label="Next years">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 4l5 5-5 5" /></svg>
                </button>
              </div>

              <div className="datepicker-year-grid">
                {yearCells.map(yr => {
                  const isCurrent = yr === viewYear;
                  const isThisYear = yr === today.getFullYear();
                  return (
                    <button key={yr} type="button"
                      className={`datepicker-year-cell ${isCurrent ? 'selected' : ''} ${isThisYear && !isCurrent ? 'today' : ''}`}
                      onClick={() => selectYear(yr)}>{yr}</button>
                  );
                })}
              </div>
            </>
          )}

          {/* ===== MONTH VIEW ===== */}
          {view === 'month' && (
            <>
              <div className="datepicker-header">
                <button type="button" className="datepicker-nav-btn" onClick={() => setViewYear(y => y - 1)} aria-label="Previous year">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4l-5 5 5 5" /></svg>
                </button>
                <button type="button" className="datepicker-title-btn" onClick={() => { setYearRangeStart(Math.floor(viewYear / 12) * 12); setView('year'); }}>
                  {viewYear}
                </button>
                <button type="button" className="datepicker-nav-btn" onClick={() => setViewYear(y => y + 1)} aria-label="Next year">
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 4l5 5-5 5" /></svg>
                </button>
              </div>

              <div className="datepicker-month-grid">
                {MONTH_SHORT.map((m, i) => {
                  const isCurrent = i === viewMonth && viewYear === (value ? parseInt(value.split('-')[0], 10) : -1);
                  const isThisMonth = i === today.getMonth() && viewYear === today.getFullYear();
                  return (
                    <button key={m} type="button"
                      className={`datepicker-month-cell ${isCurrent ? 'selected' : ''} ${isThisMonth && !isCurrent ? 'today' : ''}`}
                      onClick={() => selectMonth(i)}>{m}</button>
                  );
                })}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
