import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/auth";
import { AdminFeedbackClient } from "./admin-feedback-client";

export const metadata = {
  title: "피드백 관리 · Word Templator",
  description: "관리자 — 사용자 피드백 조회 및 응답.",
};

export default async function AdminFeedbackPage() {
  const me = await fetchMe();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/");
  return <AdminFeedbackClient />;
}
