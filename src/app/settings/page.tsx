import type { Metadata } from "next";
import SettingsForm from "../../components/SettingsForm";

export const metadata: Metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>
      <SettingsForm />
    </div>
  );
}
