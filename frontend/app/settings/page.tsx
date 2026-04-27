import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/auth";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "설정 · Word Templator",
  description: "계정과 화면 환경설정을 변경합니다.",
};

export default async function SettingsPage() {
  const me = await fetchMe();
  if (!me) redirect("/login");
  return <SettingsClient email={me.email} />;
}
