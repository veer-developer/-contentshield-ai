import React, { useState, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ── Agent definitions ────────────────────────────────────────────────────────
const STAGES = [
  { icon: '📚', name: 'Knowledge Extractor',   idleDesc: 'Awaiting documents' },
  { icon: '✍️', name: 'Content Generator',     idleDesc: 'Waiting for brief' },
  { icon: '🔍', name: 'Authenticity Agent ⚡', idleDesc: 'Verification pending' },
  { icon: '⚖️', name: 'Compliance Agent',       idleDesc: 'Compliance checks pending' },
  { icon: '🌐', name: 'Localization Agent',     idleDesc: '3 locales queued: hi-IN · de-DE · ja-JP' },
  { icon: '📡', name: 'Distribution Agent',     idleDesc: 'Publish targets: LinkedIn · Email · Blog' },
  { icon: '🛡️', name: 'Swarm Detection ⚡',    idleDesc: 'Monitoring starts after publish' },
  { icon: '🧠', name: 'Intelligence Agent',     idleDesc: 'Feedback loop inactive' },
];

const IDLE_STATES = STAGES.map(s => ({ status: 'idle', desc: s.idleDesc }));

// ── Chip styles ───────────────────────────────────────────────────────────────
function chipStyle(status) {
  const base = {
    padding: '2px 10px', borderRadius: 20, fontSize: 11,
    fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap',
  };
  const map = {
    idle:    { background: '#F1EFE8', color: '#888780', border: '0.5px solid #D3D1C7' },
    running: { background: '#E6F1FB', color: '#185FA5', border: '0.5px solid #B5D4F4' },
    ok:      { background: '#E6F4ED', color: '#1A7A4A', border: '0.5px solid #9FE1CB' },
    warn:    { background: '#FFF8E1', color: '#7A5200', border: '0.5px solid #FAC775' },
    error:   { background: '#FDEAEA', color: '#A32D2D', border: '0.5px solid #F7C1C1' },
  };
  return { ...base, ...(map[status] || map.idle) };
}

function rowBorderColor(status) {
  return { idle: '#e0e0e0', running: '#185FA5', ok: '#9FE1CB', warn: '#FAC775', error: '#F7C1C1' }[status] || '#e0e0e0';
}

const CHIP_LABEL = {
  0: { ok: 'DONE' },
  1: { ok: 'DONE' },
  2: { warn: '85/100 ✓', ok: '85/100 ✓' },
  3: { warn: '1 FLAG' },
  4: { ok: '2/3 AUTO' },
  5: { ok: 'LIVE ✓' },
  6: { error: '⚑ ALERT' },
  7: { ok: 'DONE' },
};

function getChipLabel(i, status) {
  return CHIP_LABEL[i]?.[status] || status.toUpperCase();
}

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main Component ────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState('pipeline');
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const [progress, setProgress]   = useState(0);
  const [agents, setAgents]       = useState(IDLE_STATES);
  const [checkpoint, setCheckpoint] = useState(false);
  const [authReport, setAuthReport] = useState(null);
  const [swarmReport, setSwarmReport] = useState(null);
  const [locDone, setLocDone]     = useState(false);

  const cpResolve = useRef(null);

  function updateAgent(i, status, desc) {
    setAgents(prev => {
      const next = [...prev];
      next[i] = { status, desc };
      return next;
    });
  }

  function waitForCheckpoint() {
    return new Promise(r => { cpResolve.current = r; });
  }

  function approveCheckpoint() {
    if (cpResolve.current) {
      cpResolve.current();
      cpResolve.current = null;
    }
    setCheckpoint(false);
  }

  async function startPipeline() {
    if (running) return;
    setRunning(true); setDone(false); setCheckpoint(false);
    setProgress(0); setAuthReport(null); setSwarmReport(null);
    setLocDone(false); setAgents(IDLE_STATES);

    // ── Stage 0: Knowledge ────────────────────────────────
    updateAgent(0, 'running', 'Extracting facts from earnings PDF + brand guidelines…');
    setProgress(5);
    await sleep(1400);
    updateAgent(0, 'ok', '12 facts extracted · 3 compliance constraints loaded · Brief ready');
    setProgress(14);
    await sleep(150);

    // ── Stage 1: Content Generation ───────────────────────
    updateAgent(1, 'running', 'Generating 280-word LinkedIn post with source citations…');
    await sleep(1600);
    updateAgent(1, 'ok', 'Draft ready · 6 claims tagged with [source] references');
    setProgress(28);
    await sleep(150);

    // ── Stage 2: Authenticity ─────────────────────────────
    updateAgent(2, 'running', 'Verifying 6 claims against source documents…');
    await sleep(2000);
    updateAgent(2, 'warn', '1 claim corrected (340% → 34%) · Score 85/100 · Approved');
    setProgress(42);

    // Attempt real API call; fall back to demo data
    try {
      const wfRes = await axios.post(`${API}/api/workflow/start`, {
        topic: 'Q3 Product Launch',
        channel: 'LINKEDIN',
        targetLocales: ['hi-IN', 'de-DE', 'ja-JP'],
        briefDocumentIds: ['q3-earnings', 'brand-guidelines'],
      });
      const arRes = await axios.get(
        `${API}/api/workflow/${wfRes.data.workflowId}/authenticity-report`
      );
      setAuthReport(arRes.data);
    } catch {
      setAuthReport({
        score: 85,
        overallRecommendation: 'APPROVE',
        processingTimeMs: 4200,
        claimResults: [
          { claim: 'Revenue grew 340%', sourceId: 'q3-earnings-p4',
            verdict: 'CONTRADICTED', correctedValue: '34%',
            explanation: 'Source document states 34%, not 340%', confidence: 0.99 },
          { claim: '12 days reduced cycle time', sourceId: 'case-study-bank-2024',
            verdict: 'VERIFIED', explanation: 'Confirmed in case study', confidence: 0.96 },
          { claim: 'Strongest quarter yet', sourceId: 'q3-earnings-p1',
            verdict: 'VERIFIED', explanation: 'Validated within company history', confidence: 0.91 },
          { claim: 'Zero hallucination risk', sourceId: null,
            verdict: 'IMPLAUSIBLE', correctedValue: 'near-zero hallucination risk',
            explanation: 'Absolute claim — auto-softened to defensible form', confidence: 0.82 },
          { claim: 'Image assets clean', sourceId: null,
            verdict: 'VERIFIED', explanation: 'No C2PA flags · EXIF origin: internal S3', confidence: 0.99 },
          { claim: 'All data sources current', sourceId: null,
            verdict: 'VERIFIED', explanation: 'All sources within 60 days of threshold', confidence: 0.97 },
        ],
        metadataFlags: {
          imageOrigin: 'INTERNAL_S3',
          c2paSignal: 'CLEAN',
          generativeWatermark: 'NOT_DETECTED',
        },
      });
    }
    await sleep(150);

    // ── Stage 3: Compliance ───────────────────────────────
    updateAgent(3, 'running', 'Checking brand voice, legal flags, PII, accessibility…');
    await sleep(1400);
    updateAgent(3, 'warn', '1 brand flag: competitor disclaimer added · Checkpoint raised');
    setProgress(52);
    await sleep(200);

    // ── Human Checkpoint ──────────────────────────────────
    setCheckpoint(true);
    await waitForCheckpoint();

    // ── Stage 4: Localization ─────────────────────────────
    updateAgent(4, 'running', 'Generating hi-IN · de-DE · ja-JP variants + drift checks…');
    await sleep(1800);
    updateAgent(4, 'ok', 'hi-IN 91% ✓ · ja-JP 95% ✓ · de-DE 78% flagged for review');
    setProgress(66);
    setLocDone(true);
    await sleep(150);

    // ── Stage 5: Distribution ─────────────────────────────
    updateAgent(5, 'running', 'Publishing to LinkedIn · email newsletter · blog CMS…');
    await sleep(1000);
    updateAgent(5, 'ok', '3 channels · 3 locales published · 14:32 UTC');
    setProgress(80);
    await sleep(150);

    // ── Stage 6: Swarm Detection ──────────────────────────
    updateAgent(6, 'running', 'Monitoring post-publish engagement velocity…');
    await sleep(2000);
    updateAgent(6, 'error', '⚑ Swarm detected · 847 suspicious reposts · Probability 0.79');
    setProgress(92);

    try {
      const sr = await axios.get(`${API}/api/alerts/swarm`);
      setSwarmReport(sr.data.alerts[0]);
    } catch {
      setSwarmReport({
        swarmProbability: 0.79,
        action: 'ESCALATE',
        signals: {
          suspiciousReposts: 847,
          accountAgePct: 0.94,
          geographicConcentration: 0.91,
          botSignatureMatch: 0.72,
          contentMutationPct: 0.38,
          velocityMultiplier: 8.4,
        },
        autoActions: [
          'Platform abuse report filed: LinkedIn ref CS-2024-0847',
          'Security team notified via Slack #brand-alerts',
          'Legal hold initiated on engagement evidence snapshot',
          'Content flagged for 5-min interval monitoring',
        ],
      });
    }
    await sleep(150);

    // ── Stage 7: Intelligence ─────────────────────────────
    updateAgent(7, 'running', 'Logging cycle outcomes and updating agent thresholds…');
    await sleep(900);
    updateAgent(7, 'ok', 'Cycle logged · Authenticity threshold updated · Swarm model retrained');
    setProgress(100);

    setDone(true);
    setRunning(false);
  }

  function reset() {
    setRunning(false); setDone(false); setCheckpoint(false);
    setProgress(0); setAuthReport(null); setSwarmReport(null);
    setLocDone(false); setAgents(IDLE_STATES);
    cpResolve.current = null;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const sysColor = done ? '#1A7A4A' : running ? '#185FA5' : '#888';
  const sysBg    = done ? '#E6F4ED' : running ? '#E6F1FB' : '#F1EFE8';
  const sysBdr   = done ? '#9FE1CB' : running ? '#B5D4F4' : '#D3D1C7';
  const sysLabel = done ? '● SWARM ALERT' : running ? '● RUNNING' : '● IDLE';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto', padding: '20px 16px', background: '#fff', minHeight: '100vh' }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#185FA5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 14, height: 14, border: '2px solid #fff', borderRadius: '50%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 2, left: 2, width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0D3D6E' }}>ContentShield AI</div>
            <div style={{ fontSize: 11, color: '#888' }}>Multi-Agent Content Lifecycle Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace', background: sysBg, color: sysColor, border: `0.5px solid ${sysBdr}` }}>
            {sysLabel}
          </span>
          <button onClick={startPipeline} disabled={running}
            style={{ background: '#185FA5', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.45 : 1 }}>
            ▶ Run Pipeline
          </button>
          <button onClick={reset}
            style={{ background: 'transparent', border: '0.5px solid #ccc', padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#555' }}>
            Reset
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid #ddd', marginBottom: 20, overflowX: 'auto' }}>
        {['pipeline', 'authenticity', 'localization', 'swarm', 'impact'].map(t => (
          <div key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
              color: tab === t ? '#111' : '#888',
              borderBottom: tab === t ? '2px solid #111' : '2px solid transparent' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: PIPELINE
      ══════════════════════════════════════════════════════ */}
      {tab === 'pipeline' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Live Workflow — Q3 Launch · LinkedIn
            </span>
            <span style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{progress}%</span>
          </div>
          <div style={{ height: 3, background: '#eee', borderRadius: 2, marginBottom: 18, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#185FA5', width: `${progress}%`, transition: 'width .4s ease', borderRadius: 2 }} />
          </div>

          {/* Agent rows */}
          {STAGES.map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'stretch', border: `0.5px solid ${rowBorderColor(agents[i].status)}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                <div style={{ width: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', fontSize: 15, borderRight: '0.5px solid #eee' }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1, padding: '10px 13px', minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agents[i].desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
                  <span style={chipStyle(agents[i].status)}>
                    {getChipLabel(i, agents[i].status)}
                  </span>
                </div>
              </div>
              {i < 7 && <div style={{ width: 1, height: 12, background: '#ddd', margin: '0 auto' }} />}
            </div>
          ))}

          {/* Human Checkpoint */}
          {checkpoint && (
            <div style={{ border: '1.5px dashed #FAC775', borderRadius: 10, padding: 14, background: '#FFF8E1', marginTop: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#7A5200', marginBottom: 6 }}>
                ⚑ Human Checkpoint — Compliance Review Required
              </div>
              <div style={{ fontSize: 12, color: '#7A5200', marginBottom: 12, lineHeight: 1.6 }}>
                Compliance Agent flagged: competitor name used without disclaimer (Brand Rule §4.2).
                Auto-fix applied — "unlike legacy tools" substituted. Review and approve to continue.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={approveCheckpoint}
                  style={{ background: '#E6F4ED', color: '#1A7A4A', border: '0.5px solid #9FE1CB', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Approve & Continue
                </button>
                <button onClick={() => alert('Returned for edit. Re-run compliance check.')}
                  style={{ background: '#FDEAEA', color: '#A32D2D', border: '0.5px solid #F7C1C1', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  ✗ Return for Edit
                </button>
              </div>
            </div>
          )}

          {/* Final result banner */}
          {done && (
            <div style={{ marginTop: 14, padding: '11px 14px', borderRadius: 10, background: '#FDEAEA', border: '0.5px solid #F7C1C1', fontSize: 13, color: '#A32D2D', fontWeight: 600 }}>
              ⚑ Pipeline complete — 3 locales published, 0 violations. <strong>Swarm alert active.</strong> See Swarm Watch tab.
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: AUTHENTICITY
      ══════════════════════════════════════════════════════ */}
      {tab === 'authenticity' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16 }}>
            Authenticity Report — Q3 Launch Post
          </div>

          {!authReport ? (
            <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', padding: '24px 0', textAlign: 'center' }}>
              Run the pipeline to generate the authenticity report…
            </div>
          ) : (
            <>
              {/* Score ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#eee" strokeWidth="6" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#1D9E75" strokeWidth="6"
                    strokeDasharray="175.9"
                    strokeDashoffset={175.9 * (1 - authReport.score / 100)}
                    strokeLinecap="round" transform="rotate(-90 36 36)"
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                  <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700"
                    fill="#1a1a1a" fontFamily="monospace">{authReport.score}</text>
                </svg>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1A7A4A' }}>Score: {authReport.score} / 100</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
                    Recommendation: <strong>{authReport.overallRecommendation}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    {authReport.processingTimeMs}ms · {authReport.claimResults?.length || 0} claims checked
                  </div>
                </div>
              </div>

              {/* Claim results */}
              <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                Claim Verification Results
              </div>
              <div style={{ border: '0.5px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
                {(authReport.claimResults || []).map((c, i) => {
                  const dotColor = c.verdict === 'VERIFIED' ? '#1D9E75' : c.verdict === 'CONTRADICTED' ? '#E24B4A' : '#BA7517';
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: i < authReport.claimResults.length - 1 ? '0.5px solid #e0e0e0' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 5 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.5 }}>
                          <strong style={{ color: dotColor }}>{c.verdict}</strong> — {c.claim}
                          {c.correctedValue && (
                            <span style={{ background: '#FAECE7', color: '#993C1D', padding: '0 5px', borderRadius: 3, fontSize: 11, marginLeft: 6 }}>
                              → {c.correctedValue}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2, fontFamily: 'monospace' }}>
                          {c.sourceId ? `src: ${c.sourceId} · ` : 'unsourced · '}{c.explanation}
                          {c.confidence ? ` · confidence: ${c.confidence}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Metadata flags */}
              {authReport.metadataFlags && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', margin: '16px 0 10px' }}>
                    Media Metadata Check
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      ['Image Origin', authReport.metadataFlags.imageOrigin],
                      ['C2PA Signal', authReport.metadataFlags.c2paSignal],
                      ['AI Watermark', authReport.metadataFlags.generativeWatermark],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: '#f8f8f8', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1D9E75', fontFamily: 'monospace' }}>{val}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: LOCALIZATION
      ══════════════════════════════════════════════════════ */}
      {tab === 'localization' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16 }}>
            Localization Results — 3 Locales
          </div>

          {!locDone ? (
            <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', padding: '24px 0', textAlign: 'center' }}>
              Results will appear after the pipeline runs…
            </div>
          ) : (
            <>
              <div style={{ border: '0.5px solid #e0e0e0', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                {[
                  { flag: '🇮🇳', name: 'Hindi (hi-IN)', match: 91, status: 'ok', note: 'Drift 9% · Grade level 8.2 · Auto-approved' },
                  { flag: '🇩🇪', name: 'German (de-DE)', match: 78, status: 'warn', note: 'Drift 22% · Legal idiom mismatch → needs human review' },
                  { flag: '🇯🇵', name: 'Japanese (ja-JP)', match: 95, status: 'ok', note: 'Drift 5% · Keigo honorific register applied · Auto-approved' },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < 2 ? '0.5px solid #e0e0e0' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{l.note}</div>
                    </div>
                    <span style={chipStyle(l.status)}>{l.match}% match</span>
                  </div>
                ))}
              </div>

              {/* German drift detail */}
              <div style={{ background: '#FFF8E1', border: '0.5px solid #FAC775', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7A5200', marginBottom: 8 }}>
                  ⚑ German Semantic Drift — 22% Exceeds 20% Threshold
                </div>
                <div style={{ fontSize: 12, color: '#1a1a1a', marginBottom: 4 }}>
                  <strong>EN original:</strong> "our authenticity layer ensures near-zero hallucination risk before publishing"
                </div>
                <div style={{ fontSize: 12, color: '#1a1a1a', marginBottom: 4 }}>
                  <strong>DE draft:</strong> "unsere Authentizitätsebene garantiert null Fehler" <span style={{ color: '#888' }}>(back-trans: "…guarantees zero errors")</span>
                </div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
                  Issue: "garantiert" = "guarantees" carries stronger legal liability than "ensures". "Fehler" (errors) is too broad vs "hallucination risk".<br />
                  Fix: "minimiert Halluzinationsrisiken vor der Veröffentlichung"
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['3/3', '#1A7A4A', 'Locales published'],
                  ['1', '#7A5200', 'Pending human review'],
                  ['4.7s', '#1a1a1a', 'Avg time / locale'],
                  ['0', '#1A7A4A', 'Compliance violations'],
                ].map(([v, c, l]) => (
                  <div key={l} style={{ background: '#f8f8f8', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: SWARM WATCH
      ══════════════════════════════════════════════════════ */}
      {tab === 'swarm' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>
            Post-Publish Swarm Monitor
          </div>

          {!swarmReport ? (
            <div style={{ border: '0.5px solid #e0e0e0', borderRadius: 10, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#888' }}>Swarm monitoring activates after content is published.</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Run the pipeline to see live detection signals.</div>
            </div>
          ) : (
            <div style={{ border: '0.5px solid #F7C1C1', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: '#FDEAEA', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#A32D2D', flex: 1 }}>
                  SWARM ALERT — Coordinated Amplification Detected
                </div>
                <span style={chipStyle('error')}>ESCALATE</span>
              </div>
              <div style={{ padding: 14 }}>
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {[
                    [swarmReport.swarmProbability?.toFixed(2), '#A32D2D', 'Swarm probability'],
                    [swarmReport.signals?.suspiciousReposts, '#1a1a1a', 'Suspicious reposts'],
                    [`${Math.round((swarmReport.signals?.geographicConcentration || 0) * 100)}%`, '#7A5200', 'Single region'],
                    ['11 min', '#1a1a1a', 'Since publish'],
                  ].map(([v, c, l]) => (
                    <div key={l} style={{ background: '#f8f8f8', borderRadius: 8, padding: '10px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Detection bars */}
                <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                  Detection Signals
                </div>
                {[
                  ['Account age < 14 days', Math.round((swarmReport.signals?.accountAgePct || 0) * 100), '#E24B4A'],
                  ['Geographic concentration', Math.round((swarmReport.signals?.geographicConcentration || 0) * 100), '#E24B4A'],
                  ['Bot signature match', Math.round((swarmReport.signals?.botSignatureMatch || 0) * 100), '#BA7517'],
                  ['Content mutation detected', Math.round((swarmReport.signals?.contentMutationPct || 0) * 100), '#BA7517'],
                  ['Velocity anomaly (8.4× expected)', 84, '#E24B4A'],
                ].map(([label, pct, color]) => (
                  <div key={label} style={{ marginBottom: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: '#1a1a1a' }}>{label}</span>
                      <span style={{ fontFamily: 'monospace', color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: color, borderRadius: 4, width: `${pct}%`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}

                {/* Auto actions */}
                <div style={{ background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 8, padding: '11px 13px', marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Auto-Generated Response Actions</div>
                  {(swarmReport.autoActions || []).map((a, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#555', marginBottom: 5, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ color: '#1A7A4A', flexShrink: 0 }}>{i + 1}.</span> {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: IMPACT
      ══════════════════════════════════════════════════════ */}
      {tab === 'impact' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16 }}>
            Business Impact — This Cycle
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              ['4.8h', '↓ 85% vs 5–7 days', 'Total cycle time'],
              ['~$68', '↓ 91% vs ~$800', 'Cost per piece'],
              ['0', '↓ from 1.2 avg violations', 'Compliance violations'],
              ['85/100', '↑ from 62 pre-correction', 'Authenticity score'],
            ].map(([v, c, l]) => (
              <div key={l} style={{ background: '#f8f8f8', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#1a1a1a' }}>{v}</div>
                <div style={{ fontSize: 11, color: '#1A7A4A', fontWeight: 600, marginTop: 2 }}>{c}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
            Quarterly Projection (200 Pieces / Month)
          </div>
          <div style={{ border: '0.5px solid #e0e0e0', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 14px', background: '#0D3D6E', fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              <span>Metric</span><span style={{ textAlign: 'right' }}>Before</span><span style={{ textAlign: 'right' }}>After</span><span style={{ textAlign: 'right' }}>Delta</span>
            </div>
            {[
              ['Cycle time / piece', '5–7 days', '4–6 hrs', '↓ 85%'],
              ['Compliance violations', '8–12%', '< 1%', '↓ 90%'],
              ['Hallucination incidents', '~14/qtr', '~1/qtr', '↓ 93%'],
              ['Localization time / locale', '3–5 days', '< 40 min', '↓ 95%'],
              ['Swarm response time', 'Days–weeks', '< 30 min', '↓ 98%'],
              ['Cost per content piece', '~$800', '~$60–80', '↓ 90%'],
            ].map(([m, b, a, d], i) => (
              <div key={m} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '9px 14px', fontSize: 12, borderTop: '0.5px solid #e0e0e0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <span style={{ color: '#1a1a1a' }}>{m}</span>
                <span style={{ textAlign: 'right', color: '#888' }}>{b}</span>
                <span style={{ textAlign: 'right', color: '#1a1a1a' }}>{a}</span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#1A7A4A' }}>{d}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#f8f8f8', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Annualised ROI Estimate</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1A7A4A', fontFamily: 'monospace' }}>15 – 20×</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 5, lineHeight: 1.6 }}>
              $1.7M/yr team cost savings + $2M–$5M risk avoidance per prevented brand incident = ROI within 12 months
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
