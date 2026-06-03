import DashboardSection from "../../components/DashboardSection";
import InputField from "../../components/InputField";
import Panel from "../../components/Panel";
import { API_BASE_URL, getApiModeLabel } from "../../config/api";

export default function SettingsPage() {
  return (
    <DashboardSection eyebrow="Settings" title="Keep deployment assumptions visible." description="This MVP avoids unsupported account or permission claims. Configuration is explicit so local and hosted deployments behave predictably.">
      <div className="two-col">
        <Panel eyebrow="API configuration" title="Backend connection">
          <div className="stack">
            <InputField label="Resolved API mode" value={getApiModeLabel()} readOnly />
            <InputField label="Vite env variable" value={API_BASE_URL ? "VITE_API_BASE_URL / VITE_APP_BASE_URL" : "same-origin fallback"} readOnly />
            <p style={{ color: "var(--t3)", lineHeight: 1.8 }}>
              For Vercel frontend plus separate backend, set <code>VITE_API_BASE_URL</code> to the deployed Express service. For Docker full-stack, same-origin requests work.
            </p>
          </div>
        </Panel>
        <Panel eyebrow="Workspace behavior" title="Honest MVP limits">
          <div className="stack">
            {[
              "No JWT or role management is claimed until auth exists.",
              "Reports are saved in local browser storage for this MVP.",
              "Fallback AI reports are labeled when Gemini is unavailable.",
              "Dashboard metrics are derived from saved reports.",
            ].map((item) => (
              <div className="list-row" key={item}>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardSection>
  );
}
