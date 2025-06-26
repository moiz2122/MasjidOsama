"use client";
import { useEffect, useState } from "react";
import { useGetPrayerTimeQuery } from "../clientQuery";
import "../globals.css";

const prayerNames = {
  fajr: "الفجر",
  zuhr: "الظہر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

export default function PrayerDisplay() {
  const { data, isLoading, isError, refetch } =
    useGetPrayerTimeQuery("timings");

  const [time, setTime] = useState({
    hours: "--",
    minutes: "--",
    seconds: "--",
  });
  const [upcomingPrayer, setUpcomingPrayer] = useState("");
  const [remainingTime, setRemainingTime] = useState("--:--");
  const [boolForSlider, setBoolForSlide] = useState(true);
  const [todayDate, setTodayDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(0);

  const urduMonths = [
    "جنوری",
    "فروری",
    "مارچ",
    "اپریل",
    "مئ",
    "جون",
    "جولائی",
    "اگست",
    "ستمبر",
    "اکتوبر",
    "نومبر",
    "دسمبر",
  ];

  useEffect(() => {
    const now = new Date();
    setTodayDate(now.getDate());
    setCurrentMonth(now.getMonth());

    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      setTime({
        hours: String(h % 12 || 12).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });

      if (data) {
        // Fix: Handle both array and object data structures
        const timings = Array.isArray(data) ? data[0] : data;

        if (timings) {
          // Create array of prayer times with proper parsing
          const prayerTimes = Object.entries(timings)
            .filter(
              ([key]) => key !== "_id" && key !== "ishraq" && prayerNames[key]
            )
            .map(([key, val]) => {
              // Better time parsing to handle different formats
              const timeStr = val.toString().trim();
              const [hour, minute] = timeStr
                .split(":")
                .map((num) => parseInt(num, 10));

              return {
                name: prayerNames[key],
                hour: hour,
                min: minute,
                key,
                totalMinutes: hour * 60 + minute,
              };
            })
            .sort((a, b) => a.totalMinutes - b.totalMinutes); // Sort by time

          const currentMinutes = h * 60 + m;

          // Find the next upcoming prayer
          let upcoming = prayerTimes.find(
            (prayer) => prayer.totalMinutes > currentMinutes
          );

          if (upcoming) {
            setUpcomingPrayer(upcoming.name);
            const timeDiff = upcoming.totalMinutes - currentMinutes;
            const remainingHours = Math.floor(timeDiff / 60);
            const remainingMins = timeDiff % 60;
            setRemainingTime(
              `${String(remainingHours).padStart(2, "0")}:${String(
                remainingMins
              ).padStart(2, "0")}`
            );
          } else {
            // If no more prayers today, show tomorrow's Fajr
            const fajrTomorrow = prayerTimes.find(
              (prayer) => prayer.key === "fajr"
            );
            if (fajrTomorrow) {
              setUpcomingPrayer(fajrTomorrow.name);
              // Calculate time until tomorrow's Fajr
              const minutesUntilMidnight = 24 * 60 - currentMinutes;
              const totalMinutesUntilFajr =
                minutesUntilMidnight + fajrTomorrow.totalMinutes;
              const remainingHours = Math.floor(totalMinutesUntilFajr / 60);
              const remainingMins = totalMinutesUntilFajr % 60;
              setRemainingTime(
                `${String(remainingHours).padStart(2, "0")}:${String(
                  remainingMins
                ).padStart(2, "0")}`
              );
            } else {
              setUpcomingPrayer("کوئی نماز باقی نہیں");
              setRemainingTime("--:--");
            }
          }
        }
      }
    }, 1000);

    const slideInterval = setInterval(() => {
      setBoolForSlide((prev) => !prev);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(slideInterval);
    };
  }, [data]); // Add data as dependency

  useEffect(() => {
    const interval = setInterval(() => {
      refetch(); // this will re-fetch timings every x seconds (not ideal, but okay for dev)
    }, 5000); // optional

    return () => clearInterval(interval);
  }, []);
  if (isLoading)
    return (
      <div class="flex-col gap-4 w-full flex items-center justify-center">
        <div class="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-amber-400 rounded-full">
          <div class="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
        </div>
      </div>
    );
  if (isError)
    return <p className="text-red-500">Error loading prayer times.</p>;

  const timings = Array.isArray(data) ? data[0] : data;

  const timelist = timings
    ? Object.entries(timings)
        .filter(
          ([key]) => key !== "_id" && key !== "ishraq" && prayerNames[key]
        )
        .map(([key, val]) => ({
          name: prayerNames[key],
          time: val,
          key: key,
        }))
    : [];
  return (
    <div className="bg-new flex flex-col justify-around p-4 w-72 h-[500px] rounded-xl shadow-xl">
      {/* Top Text */}
      <div className="text-white text-sm font-bold mb-1 self-center">
        لا إله إلا الله محمد رسول الله
      </div>

      {/* Digital Clock */}
      <div className="flex justify-center gap-2 mb-4 ">
        <span className="text-glow-red text-4xl font-bold">
          {time.hours}:{time.minutes}
        </span>
        <span className="text-glow-red text-2xl font-bold">{time.seconds}</span>
      </div>

      {/* Remaining Time */}
      <div className="flex justify-end items-center bg-gray-600/20 rounded-sm py-1 pr-1 mb-4">
        <div className="flex gap-x-2 mr-4 animate-pulse text-green-400 text-xl">
          {remainingTime}
        </div>
        <p className="text-glow-white text-sm w-24">بقیہ وقت برائے جماعت</p>
      </div>

      {/* Prayer Timings */}
      <div className="space-y-6 text-lg font-semibold text-right px-2 ">
        {timelist.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span
              className={`tracking-widest bg-gray-400/10 rounded-sm w-24 flex justify-center items-center text-glow-red ${
                item.name == upcomingPrayer
                  ? "text-glow-green"
                  : ".text-glow-red"
              }`}
            >
              {item.time}
            </span>
            <span
              className={`bg-gray-400/10 rounded-sm w-20 pb-1 flex justify-center items-center text-glow-white ${
                item.name == upcomingPrayer ? "text-green-400" : "text-white"
              }`}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Info (Ishraq or Date) */}
      <div className="bg-gray-400/10 mt-4 h-11 rounded-sm flex items-center justify-center gap-6 text-green-400">
        <div
          className={`flex items-center gap-6 transition-transform duration-500 ${
            boolForSlider ? "animate-slide-in-left" : "animate-slide-in-right"
          }`}
        >
          <p className="text-2xl mb-2">
            {boolForSlider ? urduMonths[currentMonth] : "اشراق"}
          </p>
          <p className="text-2xl">
            {boolForSlider ? todayDate : data?.ishraq || "5 : 21"}
          </p>
        </div>
      </div>
    </div>
  );
}


// useEffect(() => {
//   const now = new Date();
//   setTodayDate(now.getDate());
//   setCurrentMonth(now.getMonth());

//   const interval = setInterval(() => {
//     const now = new Date();
//     const h = now.getHours();
//     const m = now.getMinutes();
//     const s = now.getSeconds();

//     setTime({
//       hours: String(h % 12 || 12).padStart(2, "0"),
//       minutes: String(m).padStart(2, "0"),
//       seconds: String(s).padStart(2, "0"),
//     });

//     if (data) {
//       const timings = Object.entries(data)
//         .filter(([key]) => key !== "ishraq")
//         .map(([key, val]) => {
//           const [h, m] = val.split(":").map(Number);
//           return { name: prayerNames[key], hour: h, min: m, key };
//         });

//       const nowMinutes = h * 60 + m;

//       const upcoming = timings.find((t) => t.hour * 60 + t.min >= nowMinutes);

//       if (upcoming) {
//         setUpcomingPrayer(upcoming.name);
//         const diff = upcoming.hour * 60 + upcoming.min - nowMinutes;
//         const remH = Math.floor(diff / 60);
//         const remM = diff % 60;
//         setRemainingTime(
//           `${String(remH).padStart(2, "0")}:${String(remM).padStart(2, "0")}`
//         );
//       } else {
//         setUpcomingPrayer("کوئی نماز باقی نہیں");
//         setRemainingTime("--:--");
//       }
//     }
//   }, 1000);

//   const slideInterval = setInterval(() => {
//     setBoolForSlide((prev) => !prev);
//   }, 2000);
//   return () => {
//     clearInterval(interval);
//     clearInterval(slideInterval);
//   };
// }, []);