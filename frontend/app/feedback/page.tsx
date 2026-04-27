import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/auth";
import { FeedbackClient } from "./feedback-client";

export const metadata = {
  title: "피드백 · Word Templator",
  description: "버그 신고 / 기능 요청 / 의견을 남겨주세요.",
};

export default async function FeedbackPage() {
  const me = await fetchMe();
  if (!me) redirect("/login");
  return <FeedbackClient />;
}
