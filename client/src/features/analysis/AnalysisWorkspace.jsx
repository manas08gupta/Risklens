import { useEffect, useMemo, useState } from "react";
import {
  ANALYSIS_STEPS,
  BUSINESS_MODEL_OPTIONS,
  FOUNDER_CONCERN_OPTIONS,
  INDUSTRY_OPTIONS,
  INDUSTRY_SENSITIVITY_OPTIONS,
  INITIAL_ANALYSIS_FORM,
  LOADING_MESSAGES,
  STAGE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
} from "./constants";
import { requestRiskAnalysis, validateAnalysisStep } from "./engine";

function labelize(value) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toneColors(level, C) {
  if (level === "High") return { bg: C.highBg, fg: C.highFg, border: "#3a1111" };
  if (level === "Medium") return { bg: C.medBg, fg: C.medFg, border: "#2a2107" };
  return { bg: C.lowBg, fg: C.lowFg, border: "#0c241a" };
}

function InputLabel({ children, theme }) {
  return <p style={{ color: theme.C.t3, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 10 }}>{children}</p>;
}

function HelperText({ error, children, theme }) {
  return (
    <p style={{ marginTop: 8, color: error ? theme.C.highFg : theme.C.t4, fontSize: 11, lineHeight: 1.5, fontFamily: theme.MONO }}>
      {error || children}
    </p>
  );
}

function BaseField({ label, error, children, hint, theme }) {
  return (
    <label style={{ display: "block" }}>
      <InputLabel theme={theme}>{label}</InputLabel>
      {children}
      {(error || hint) && <HelperText error={error} theme={theme}>{hint}</HelperText>}
    </label>
  );
}

function fieldStyle(theme, layout, isTextarea = false) {
  return {
    width: "100%",
    minWidth: 0,
    background: "#080808",
    border: `1px solid ${theme.C.border}`,
    color: theme.C.t1,
    fontFamily: theme.MONO,
    padding: layout.isMobile ? "14px 14px" : "14px 16px",
    fontSize: 13,
    outline: "none",
    resize: isTextarea ? "vertical" : "none",
    minHeight: isTextarea ? 140 : 48,
    transition: "border-color 0.2s ease, transform 0.2s ease",
  };
}

function SelectField({ label, value, onChange, options, placeholder, error, hint, theme, layout }) {
  return (
    <BaseField label={label} error={error} hint={hint} theme={theme}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle(theme, layout)} aria-invalid={Boolean(error)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </BaseField>
  );
}

function TextField({ label, value, onChange, placeholder, error, hint, theme, layout }) {
  return (
    <BaseField label={label} error={error} hint={hint} theme={theme}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldStyle(theme, layout)} aria-invalid={Boolean(error)} />
    </BaseField>
  );
}

function TextAreaField({ label, value, onChange, placeholder, error, hint, theme, layout }) {
  return (
    <BaseField label={label} error={error} hint={hint} theme={theme}>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldStyle(theme, layout, true)} aria-invalid={Boolean(error)} />
    </BaseField>
  );
}

function ToggleField({ label, value, onChange, description, theme }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: "100%",
        background: "#080808",
        border: `1px solid ${value ? theme.C.bhi : theme.C.border}`,
        color: theme.C.t1,
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div>
        <InputLabel theme={theme}>{label}</InputLabel>
        <p style={{ color: theme.C.t2, fontSize: 13, lineHeight: 1.6 }}>{description}</p>
      </div>
      <div style={{ width: 48, height: 24, background: value ? theme.C.t1 : "#111", border: `1px solid ${value ? theme.C.t1 : theme.C.border}`, position: "relative", flexShrink: 0, transition: "all 0.2s ease" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 26 : 3, width: 16, height: 16, background: value ? "#000" : theme.C.t4, transition: "all 0.2s ease" }} />
      </div>
    </button>
  );
}

function SegmentedChoice({ label, value, onChange, options, error, hint, theme }) {
  return (
    <BaseField label={label} error={error} hint={hint} theme={theme}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 8 }}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={{
                minHeight: 48,
                padding: "0 14px",
                background: selected ? "#111" : "#080808",
                border: `1px solid ${selected ? theme.C.bhi : theme.C.border}`,
                color: selected ? theme.C.t1 : theme.C.t3,
                fontFamily: theme.MONO,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </BaseField>
  );
}

function ConcernPillGroup({ value, onChange, error, theme }) {
  const toggleConcern = (option) => {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option]
    );
  };

  return (
    <BaseField label="What concerns you most right now?" error={error} hint="Select every pressure point that matters right now." theme={theme}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {FOUNDER_CONCERN_OPTIONS.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleConcern(option)}
              style={{
                padding: "12px 16px",
                minHeight: 44,
                background: selected ? "#111" : "#080808",
                border: `1px solid ${selected ? theme.C.bhi : theme.C.border}`,
                color: selected ? theme.C.t1 : theme.C.t3,
                fontFamily: theme.SYNE,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {labelize(option)}
            </button>
          );
        })}
      </div>
    </BaseField>
  );
}

function StepMarker({ step, active, complete, theme, layout }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", opacity: active || complete ? 1 : 0.52 }}>
      <div
        style={{
          width: layout.isMobile ? 34 : 38,
          height: layout.isMobile ? 34 : 38,
          border: `1px solid ${active ? theme.C.t1 : complete ? theme.C.bhi : theme.C.border}`,
          background: active ? "#111" : complete ? "#090909" : "transparent",
          color: active ? theme.C.t1 : complete ? theme.C.t2 : theme.C.t4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.MONO,
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {complete ? "OK" : step.number}
      </div>
      <div>
        <p style={{ color: theme.C.t3, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 5 }}>{step.eyebrow}</p>
        <p style={{ color: active ? theme.C.t1 : theme.C.t2, fontFamily: theme.SYNE, fontSize: 14, lineHeight: 1.4 }}>{step.title}</p>
      </div>
    </div>
  );
}

function LoadingPanel({ theme, layout, progress, messageIndex }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.C.border}`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
        minHeight: layout.isMobile ? 420 : 520,
        display: "grid",
        placeItems: "center",
        padding: layout.isMobile ? "28px 18px" : "40px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 780, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1px solid ${theme.C.border}`, background: "#080808", marginBottom: 26 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.C.lowFg, boxShadow: `0 0 24px ${theme.C.lowFg}` }} />
          <span style={{ color: theme.C.t2, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: theme.SYNE }}>RiskLens Analysis Engine</span>
        </div>

        <h2 style={{ fontFamily: theme.SYNE, fontSize: layout.isMobile ? "clamp(30px, 10vw, 42px)" : "clamp(38px, 5vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 14 }}>
          Building your
          <br />
          investor-grade risk readout
        </h2>

        <p style={{ color: theme.C.t3, fontSize: layout.isMobile ? 13 : 15, lineHeight: 1.8, maxWidth: 620, margin: "0 auto 34px" }}>
          The platform is synthesizing business context, product posture, competitive pressure, and AI governance signals into a structured assessment.
        </p>

        <div style={{ border: `1px solid ${theme.C.border}`, background: "#080808", padding: layout.isMobile ? "18px" : "24px", marginBottom: 24 }}>
          <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 10 }}>
            Current pass
          </p>
          <p style={{ color: theme.C.t1, fontFamily: theme.MONO, fontSize: layout.isMobile ? 15 : 18, minHeight: 28 }}>
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        <div style={{ width: "100%", height: 8, background: "#0a0a0a", border: `1px solid ${theme.C.border}`, marginBottom: 14 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #ffffff 0%, #868686 100%)", transition: "width 0.6s ease" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexDirection: layout.isMobile ? "column" : "row" }}>
          {LOADING_MESSAGES.map((message, index) => (
            <div key={message} style={{ flex: 1, textAlign: "left", borderTop: `1px solid ${index <= messageIndex ? theme.C.bhi : theme.C.border}`, paddingTop: 10 }}>
              <p style={{ color: index <= messageIndex ? theme.C.t2 : theme.C.t4, fontSize: 11, lineHeight: 1.6, fontFamily: theme.MONO }}>
                {message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportMetric({ label, value, sublabel, theme, layout }) {
  return (
    <div style={{ border: `1px solid ${theme.C.border}`, background: "#080808", padding: layout.isMobile ? "16px" : "18px" }}>
      <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 12 }}>{label}</p>
      <p style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: layout.isMobile ? 28 : 32, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
      <p style={{ color: theme.C.t3, fontSize: 11, marginTop: 10, lineHeight: 1.6, fontFamily: theme.MONO }}>{sublabel}</p>
    </div>
  );
}

function RiskPillarCard({ pillar, theme, layout }) {
  const tone = toneColors(pillar.level, theme.C);
  return (
    <div style={{ border: `1px solid ${theme.C.border}`, background: "#080808", padding: layout.isMobile ? "18px 16px" : "20px", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <div>
          <p style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: 15, marginBottom: 4 }}>{pillar.title}</p>
          <p style={{ color: theme.C.t4, fontSize: 10, fontFamily: theme.MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}>{pillar.level} priority band</p>
        </div>
        <span style={{ padding: "5px 10px", background: tone.bg, color: tone.fg, border: `1px solid ${tone.border}`, fontFamily: theme.SYNE, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {pillar.score}/100
        </span>
      </div>
      <div style={{ width: "100%", height: 7, background: "#111", marginBottom: 14 }}>
        <div style={{ width: `${pillar.score}%`, height: "100%", background: pillar.level === "High" ? theme.C.highFg : pillar.level === "Medium" ? theme.C.medFg : theme.C.lowFg }} />
      </div>
      <p style={{ color: theme.C.t3, fontSize: 13, lineHeight: 1.7 }}>{pillar.description}</p>
    </div>
  );
}

function SignalList({ title, items, theme, layout }) {
  return (
    <div style={{ border: `1px solid ${theme.C.border}`, background: "#080808", padding: layout.isMobile ? "18px 16px" : "22px" }}>
      <p style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 14 }}>{title}</p>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item, index) => (
          <div key={`${title}-${index}`} style={{ paddingBottom: 12, borderBottom: index === items.length - 1 ? "none" : `1px solid ${theme.C.border}` }}>
            {typeof item === "string" ? (
              <p style={{ color: theme.C.t2, fontSize: 13, lineHeight: 1.7 }}>{item}</p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ color: theme.C.t1, fontSize: 13, fontFamily: theme.SYNE }}>{item.title}</p>
                  <span style={{ color: theme.C.t4, fontSize: 10, fontFamily: theme.MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.priority}</span>
                </div>
                <p style={{ color: theme.C.t3, fontSize: 12, lineHeight: 1.7 }}>{item.summary}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContent({ stepIndex, form, errors, setField, theme, layout }) {
  switch (stepIndex) {
    case 0:
      return (
        <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <TextField label="Startup Name" value={form.startupName} onChange={(value) => setField("startupName", value)} placeholder="RiskLens AI" error={errors.startupName} theme={theme} layout={layout} />
          <SelectField label="Industry" value={form.industry} onChange={(value) => setField("industry", value)} options={INDUSTRY_OPTIONS} placeholder="Select an industry" error={errors.industry} theme={theme} layout={layout} />
          <SelectField label="Startup Stage" value={form.startupStage} onChange={(value) => setField("startupStage", value)} options={STAGE_OPTIONS} placeholder="Select startup stage" error={errors.startupStage} theme={theme} layout={layout} />
          <SelectField label="Business Model" value={form.businessModel} onChange={(value) => setField("businessModel", value)} options={BUSINESS_MODEL_OPTIONS} placeholder="Select business model" error={errors.businessModel} theme={theme} layout={layout} />
          <div style={{ gridColumn: layout.isMobile ? "auto" : "span 2" }}>
            <SelectField label="Target Audience" value={form.targetAudience} onChange={(value) => setField("targetAudience", value)} options={TARGET_AUDIENCE_OPTIONS} placeholder="Select target audience" error={errors.targetAudience} theme={theme} layout={layout} />
          </div>
        </div>
      );
    case 1:
      return (
        <div style={{ display: "grid", gap: 16 }}>
          <TextAreaField label="Product Description" value={form.productDescription} onChange={(value) => setField("productDescription", value)} placeholder="Describe what the startup is building, how it works, and what users experience." error={errors.productDescription} theme={theme} layout={layout} />
          <TextAreaField label="Problem Being Solved" value={form.problemSolved} onChange={(value) => setField("problemSolved", value)} placeholder="What painful or expensive problem does the company solve?" error={errors.problemSolved} theme={theme} layout={layout} />
          <TextAreaField label="Main Users" value={form.mainUsers} onChange={(value) => setField("mainUsers", value)} placeholder="Who uses the product most often, and in what context?" error={errors.mainUsers} theme={theme} layout={layout} />
          <TextAreaField label="Competitors (optional)" value={form.competitors} onChange={(value) => setField("competitors", value)} placeholder="Mention direct competitors, substitutes, or incumbent solutions." theme={theme} layout={layout} />
          <TextAreaField label="Unique Advantage (optional)" value={form.uniqueAdvantage} onChange={(value) => setField("uniqueAdvantage", value)} placeholder="What gives the company an edge that is difficult to copy?" theme={theme} layout={layout} />
        </div>
      );
    case 2:
      return (
        <div style={{ display: "grid", gap: 16 }}>
          <ToggleField label="Does your product use AI?" value={form.usesAI} onChange={(value) => setField("usesAI", value)} description="Turn this on only if AI is part of the customer-facing product, decisioning, workflow automation, or core internal engine." theme={theme} />

          {form.usesAI && (
            <div style={{ display: "grid", gap: 16, animation: "fadeSlide 0.35s ease" }}>
              <TextAreaField label="What does the AI do?" value={form.aiPurpose} onChange={(value) => setField("aiPurpose", value)} placeholder="Explain the AI function clearly: recommendation, generation, scoring, workflow automation, decision support, etc." error={errors.aiPurpose} hint="Describe the actual production behavior, not the marketing headline." theme={theme} layout={layout} />
              <SegmentedChoice label="Does it process sensitive data?" value={form.sensitiveData} onChange={(value) => setField("sensitiveData", value)} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} error={errors.sensitiveData} theme={theme} />
              <SegmentedChoice label="Does it automate decisions?" value={form.automatesDecisions} onChange={(value) => setField("automatesDecisions", value)} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} error={errors.automatesDecisions} theme={theme} />
              <BaseField label="Industry Sensitivity" error={errors.industrySensitivity} hint="Pick the most regulated context the AI touches." theme={theme}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {INDUSTRY_SENSITIVITY_OPTIONS.map((option) => {
                    const selected = form.industrySensitivity === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setField("industrySensitivity", option.value)}
                        style={{
                          padding: "12px 16px",
                          minHeight: 44,
                          background: selected ? "#111" : "#080808",
                          border: `1px solid ${selected ? theme.C.bhi : theme.C.border}`,
                          color: selected ? theme.C.t1 : theme.C.t3,
                          fontFamily: theme.SYNE,
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </BaseField>
            </div>
          )}
        </div>
      );
    case 3:
      return <ConcernPillGroup value={form.founderConcerns} onChange={(value) => setField("founderConcerns", value)} error={errors.founderConcerns} theme={theme} />;
    case 4:
      return (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ border: `1px solid ${theme.C.border}`, background: "#080808", padding: layout.isMobile ? "20px 18px" : "26px 24px" }}>
            <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 12 }}>Ready to synthesize</p>
            <h3 style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: layout.isMobile ? 24 : 30, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 12 }}>
              Generate a premium risk analysis for {form.startupName || "your startup"}
            </h3>
            <p style={{ color: theme.C.t3, fontSize: 14, lineHeight: 1.8 }}>
              We’ll produce a structured risk dashboard covering commercial pressure, regulatory surface, AI governance, operational resilience, and next-step recommendations.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <ReportMetric label="Industry" value={form.industry || "-"} sublabel={form.startupStage || "Stage pending"} theme={theme} layout={layout} />
            <ReportMetric label="AI Mode" value={form.usesAI ? "AI Active" : "AI Off"} sublabel={form.usesAI ? (form.industrySensitivity || "Sensitivity pending") : "No AI risk surface"} theme={theme} layout={layout} />
            <ReportMetric label="Founder Focus" value={form.founderConcerns.length ? form.founderConcerns.length : 0} sublabel="Priority concern signals selected" theme={theme} layout={layout} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function AnalysisWorkspace({ layout, theme }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(INITIAL_ANALYSIS_FORM);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStep = ANALYSIS_STEPS[stepIndex];
  const completedSteps = useMemo(() => stepIndex, [stepIndex]);

  useEffect(() => {
    if (!isGenerating) return undefined;

    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(96, Math.round((elapsed / 5200) * 100));
      setProgress(nextProgress);
    }, 120);

    const messageTimer = window.setInterval(() => {
      setMessageIndex((value) => (value + 1) % LOADING_MESSAGES.length);
    }, 1100);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
    };
  }, [isGenerating]);

  const setField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "usesAI" && !value) {
        next.aiPurpose = "";
        next.sensitiveData = "";
        next.automatesDecisions = "";
        next.industrySensitivity = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
    setErrorMessage("");
  };

  const goNext = () => {
    const nextErrors = validateAnalysisStep(stepIndex, form);
    const hasErrors = Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    if (hasErrors) return;
    setStepIndex((value) => Math.min(value + 1, ANALYSIS_STEPS.length - 1));
  };

  const goBack = () => setStepIndex((value) => Math.max(value - 1, 0));

  const resetFlow = () => {
    setForm(INITIAL_ANALYSIS_FORM);
    setErrors({});
    setStepIndex(0);
    setAnalysis(null);
    setErrorMessage("");
    setIsGenerating(false);
    setMessageIndex(0);
    setProgress(0);
  };

  const startGeneration = async () => {
    setErrors({});
    setErrorMessage("");
    setIsGenerating(true);
    setMessageIndex(0);
    setProgress(4);

    const minimumLoading = new Promise((resolve) => window.setTimeout(resolve, 5600));

    try {
      const [nextAnalysis] = await Promise.all([requestRiskAnalysis(form), minimumLoading]);
      setProgress(100);
      setAnalysis(nextAnalysis);
    } catch {
      await minimumLoading;
      setErrorMessage("RiskLens could not complete the AI analysis right now. Check that the backend is running and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <LoadingPanel theme={theme} layout={layout} progress={progress} messageIndex={messageIndex} />;
  }

  if (analysis) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ border: `1px solid ${theme.C.border}`, background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))", padding: layout.isMobile ? "22px 18px" : "30px", display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: layout.isMobile ? "flex-start" : "center", flexDirection: layout.isMobile ? "column" : "row" }}>
            <div>
              <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 10 }}>Generated Analysis</p>
              <h2 style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: layout.isMobile ? "clamp(28px, 9vw, 40px)" : "clamp(34px, 4vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 12 }}>
                {analysis.company}
              </h2>
              <p style={{ color: theme.C.t3, fontSize: 14, lineHeight: 1.8, maxWidth: 780 }}>{analysis.narrative}</p>
            </div>
            <div style={{ display: "grid", gap: 10, width: layout.isMobile ? "100%" : "auto" }}>
              <span style={{ justifySelf: layout.isMobile ? "stretch" : "end", padding: "8px 12px", background: toneColors(analysis.overallLevel, theme.C).bg, color: toneColors(analysis.overallLevel, theme.C).fg, border: `1px solid ${toneColors(analysis.overallLevel, theme.C).border}`, fontFamily: theme.SYNE, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center" }}>
                {analysis.overallLevel} Risk Priority
              </span>
              <button onClick={resetFlow} style={{ minHeight: 44, padding: "0 16px", background: "transparent", border: `1px solid ${theme.C.border}`, color: theme.C.t2, fontFamily: theme.SYNE, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                New Analysis
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            <ReportMetric label="Overall Risk Index" value={`${analysis.overallScore}/100`} sublabel="Weighted by market, compliance, AI, operations, and growth." theme={theme} layout={layout} />
            <ReportMetric label="Primary Pressure" value={analysis.topRisks[0]?.title || "-"} sublabel={analysis.topRisks[0]?.level || "N/A"} theme={theme} layout={layout} />
            <ReportMetric label="AI Governance" value={`${analysis.pillars.find((item) => item.key === "ai")?.score || 0}/100`} sublabel={form.usesAI ? "Active product AI surface" : "Limited current AI exposure"} theme={theme} layout={layout} />
            <ReportMetric label="Founder Focus" value={form.founderConcerns.map(labelize).join(", ") || "None"} sublabel="Priority concerns included in the scoring model." theme={theme} layout={layout} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }}>
          {analysis.benchmarks.map((item) => (
            <div key={item.label} style={{ border: `1px solid ${theme.C.border}`, background: "#080808", padding: "18px" }}>
              <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 10 }}>{item.label}</p>
              <p style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: 18, lineHeight: 1.3 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 12 }}>Risk pillars</p>
            <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              {analysis.pillars.map((pillar) => (
                <RiskPillarCard key={pillar.key} pillar={pillar} theme={theme} layout={layout} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: layout.isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: 14 }}>
          <SignalList title="Priority watchlist" items={analysis.topRisks} theme={theme} layout={layout} />
          <SignalList title="Strategic recommendations" items={analysis.recommendations} theme={theme} layout={layout} />
          <SignalList title="Strengths and open signals" items={[...analysis.strengths, ...analysis.watchlist]} theme={theme} layout={layout} />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ border: `1px solid ${theme.C.border}`, background: "#050505", padding: layout.isMobile ? "22px 18px" : "30px", display: "grid", gap: 14 }}>
          <p style={{ color: theme.C.highFg, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE }}>Analysis Interrupted</p>
          <h2 style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: layout.isMobile ? 28 : 40, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
            The intelligence engine needs another pass.
          </h2>
          <p style={{ color: theme.C.t3, fontSize: 14, lineHeight: 1.8, maxWidth: 720 }}>{errorMessage}</p>
          <div style={{ display: "flex", gap: 10, flexDirection: layout.isMobile ? "column" : "row" }}>
            <button onClick={() => setErrorMessage("")} style={{ minHeight: 46, padding: "0 16px", background: "transparent", border: `1px solid ${theme.C.border}`, color: theme.C.t2, fontFamily: theme.SYNE, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              Review Inputs
            </button>
            <button onClick={startGeneration} style={{ minHeight: 46, padding: "0 18px", background: theme.C.t1, color: "#000", border: "none", fontFamily: theme.SYNE, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: layout.isTablet ? "1fr" : "320px minmax(0, 1fr)", gap: 18 }}>
      <div style={{ border: `1px solid ${theme.C.border}`, background: "#050505", padding: layout.isMobile ? "18px 16px" : "22px", alignSelf: "start" }}>
        <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 12 }}>Analysis Workflow</p>
        <div style={{ display: "grid", gap: 18 }}>
          {ANALYSIS_STEPS.map((step, index) => (
            <StepMarker key={step.id} step={step} active={index === stepIndex} complete={index < completedSteps} theme={theme} layout={layout} />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ border: `1px solid ${theme.C.border}`, background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))", padding: layout.isMobile ? "20px 16px" : "28px" }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: theme.C.t4, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: theme.SYNE, marginBottom: 10 }}>{currentStep.eyebrow}</p>
            <h2 style={{ color: theme.C.t1, fontFamily: theme.SYNE, fontSize: layout.isMobile ? "clamp(28px, 8vw, 36px)" : "clamp(34px, 4vw, 46px)", lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 12 }}>
              {currentStep.title}
            </h2>
            <p style={{ color: theme.C.t3, fontSize: 14, lineHeight: 1.8, maxWidth: 720 }}>{currentStep.description}</p>
          </div>

          <div key={currentStep.id} style={{ animation: "fadeSlide 0.35s ease" }}>
            <StepContent stepIndex={stepIndex} form={form} errors={errors} setField={setField} theme={theme} layout={layout} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexDirection: layout.isMobile ? "column-reverse" : "row" }}>
          <div style={{ color: theme.C.t4, fontSize: 11, lineHeight: 1.6, fontFamily: theme.MONO, width: layout.isMobile ? "100%" : "auto" }}>
            Step {stepIndex + 1} of {ANALYSIS_STEPS.length}
          </div>
          <div style={{ display: "flex", gap: 10, width: layout.isMobile ? "100%" : "auto" }}>
            {stepIndex > 0 && (
              <button onClick={goBack} style={{ flex: layout.isMobile ? 1 : "none", minHeight: 46, padding: "0 16px", background: "transparent", border: `1px solid ${theme.C.border}`, color: theme.C.t2, fontFamily: theme.SYNE, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                Back
              </button>
            )}
            {stepIndex < ANALYSIS_STEPS.length - 1 ? (
              <button onClick={goNext} style={{ flex: 1, minHeight: 46, padding: "0 18px", background: theme.C.t1, color: "#000", border: "none", fontFamily: theme.SYNE, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                Continue
              </button>
            ) : (
              <button onClick={startGeneration} style={{ flex: 1, minHeight: 52, padding: "0 20px", background: theme.C.t1, color: "#000", border: "none", fontFamily: theme.SYNE, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 18px 80px rgba(255,255,255,0.06)" }}>
                Generate Risk Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
