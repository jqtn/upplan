import { getSettings } from "@/app/actions/setting";
import { SettingsForm } from "./components/settings-form";
import { LoadError } from "@/components/load";

export default async function Settings() {
  const { ok, data } = await getSettings();
  if (ok && data) {
    return <SettingsForm settings={data} />;
  } else {
    return <LoadError />;
  }
}
