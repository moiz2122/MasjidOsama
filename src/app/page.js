"use client";
import "./globals.css";
import PrayerDisplay from "./components/PrayerDisplay";
import { useGetPrayerTimeQuery } from "./clientQuery";

export default function Home() {
  const { data, isLoading, isError, refetch } =
      useGetPrayerTimeQuery("timings");
  return (
    <main className="flex flex-col-reverse items-center justify-evenly min-h-[100svh]">
      <PrayerDisplay />
      {isLoading ? null : (
        <h1 className="text-glow-white text-4xl">مسجد حضرت اسامہ</h1>
      )}
    </main>
  );
}
// sm:justify-center items-center justify-evenly
