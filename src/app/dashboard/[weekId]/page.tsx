import WeekDetail from "@/components/WeekDetail";

export default function WeekPage({ params }: { params: { weekId: string } }) {
  return <WeekDetail weekId={params.weekId} />;
}
