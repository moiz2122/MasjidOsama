// "use client";
// import { useEffect, useState } from "react";
// import { useGetPrayerTimeQuery } from "@/app/clientQuery";
// import { useRouter } from "next/navigation";

// const prayerNames = {
//   fajr: "الفجر",
//   zuhr: "الظہر",
//   asr: "العصر",
//   maghrib: "المغرب",
//   isha: "العشاء",
// };

// export default function PrayerDisplay() {
//   const { data, isLoading, isError } = useGetPrayerTimeQuery("timings");
//   const [editableTimings, setEditableTimings] = useState({});
//   const [time, setTime] = useState({
//     hours: "--",
//     minutes: "--",
//     seconds: "--",
//   });
//   const [upcomingPrayer, setUpcomingPrayer] = useState("");
//   const [remainingTime, setRemainingTime] = useState("--:--");
//   const [boolForSlider, setBoolForSlide] = useState(true);
//   const [todayDate, setTodayDate] = useState("");
//   const [currentMonth, setCurrentMonth] = useState(0);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const router = useRouter();

//   const urduMonths = [
//     "جنوری",
//     "فروری",
//     "مارچ",
//     "اپریل",
//     "مئ",
//     "جون",
//     "جولائی",
//     "اگست",
//     "ستمبر",
//     "اکتوبر",
//     "نومبر",
//     "دسمبر",
//   ];

//   // Authentication check
//   useEffect(() => {
//     const checkAuth = () => {
//       if (typeof window !== "undefined") {
//         const loggedIn = localStorage.getItem("isLoggedIn");
//         if (loggedIn === "true") {
//           setIsAuthenticated(true);
//         } else {
//           router.push("/admin/login");
//         }
//       }
//     };
//     checkAuth();
//   }, [router]);

//   // Initialize editableTimings from API
//   useEffect(() => {
//     if (data && data[0]) {
//       const initial = Object.entries(data[0])
//         .filter(([key]) => key !== "_id" && key !== "ishraq")
//         .reduce((acc, [key, val]) => {
//           acc[key] = val;
//           return acc;
//         }, {});
//       setEditableTimings(initial);
//     }
//   }, [data]);

//   // Clock and upcoming prayer logic
//   useEffect(() => {
//     const now = new Date();
//     setTodayDate(now.getDate());
//     setCurrentMonth(now.getMonth());

//     const interval = setInterval(() => {
//       const now = new Date();
//       const h = now.getHours();
//       const m = now.getMinutes();
//       const s = now.getSeconds();

//       setTime({
//         hours: String(h % 12 || 12).padStart(2, "0"),
//         minutes: String(m).padStart(2, "0"),
//         seconds: String(s).padStart(2, "0"),
//       });

//       // Use editableTimings instead of data for real-time updates
//       const timingsToUse =
//         Object.keys(editableTimings).length > 0
//           ? editableTimings
//           : data && data[0]
//           ? data[0]
//           : {};

//       if (Object.keys(timingsToUse).length > 0) {
//         const prayerTimes = Object.entries(timingsToUse)
//           .filter(
//             ([key]) => key !== "_id" && key !== "ishraq" && prayerNames[key]
//           )
//           .map(([key, val]) => {
//             const timeStr = val.toString().trim();
//             const [hr, mn] = timeStr.split(":").map((num) => parseInt(num, 10));

//             return {
//               name: prayerNames[key],
//               hour: hr,
//               min: mn,
//               key,
//               totalMinutes: hr * 60 + mn,
//             };
//           })
//           .sort((a, b) => a.totalMinutes - b.totalMinutes);

//         const currentMinutes = h * 60 + m;

//         // Find next upcoming prayer
//         let upcoming = prayerTimes.find(
//           (prayer) => prayer.totalMinutes > currentMinutes
//         );

//         if (upcoming) {
//           setUpcomingPrayer(upcoming.name);
//           const timeDiff = upcoming.totalMinutes - currentMinutes;
//           const remainingHours = Math.floor(timeDiff / 60);
//           const remainingMins = timeDiff % 60;
//           setRemainingTime(
//             `${String(remainingHours).padStart(2, "0")}:${String(
//               remainingMins
//             ).padStart(2, "0")}`
//           );
//         } else {
//           // If no more prayers today, show tomorrow's Fajr
//           const fajrTomorrow = prayerTimes.find(
//             (prayer) => prayer.key === "fajr"
//           );
//           if (fajrTomorrow) {
//             setUpcomingPrayer(fajrTomorrow.name);
//             const minutesUntilMidnight = 24 * 60 - currentMinutes;
//             const totalMinutesUntilFajr =
//               minutesUntilMidnight + fajrTomorrow.totalMinutes;
//             const remainingHours = Math.floor(totalMinutesUntilFajr / 60);
//             const remainingMins = totalMinutesUntilFajr % 60;
//             setRemainingTime(
//               `${String(remainingHours).padStart(2, "0")}:${String(
//                 remainingMins
//               ).padStart(2, "0")}`
//             );
//           } else {
//             setUpcomingPrayer("کوئی نماز باقی نہیں");
//             setRemainingTime("--:--");
//           }
//         }
//       }
//     }, 1000);

//     const slideInterval = setInterval(() => {
//       setBoolForSlide((prev) => !prev);
//     }, 3000);

//     return () => {
//       clearInterval(interval);
//       clearInterval(slideInterval);
//     };
//   }, [editableTimings, data]);

//   const handleChange = (key, value) => {
//     // Validate time format (basic validation)
//     const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//     if (timeRegex.test(value) || value === "") {
//       setEditableTimings({ ...editableTimings, [key]: value });
//     }
//   };

//   const handleSave = async () => {
//     try {
//       // Validate all times before saving
//       const isValid = Object.values(editableTimings).every((time) => {
//         const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//         return timeRegex.test(time);
//       });

//       if (!isValid) {
//         // Show error for invalid format
//         if (typeof window !== "undefined" && window.Swal) {
//           window.Swal.fire({
//             title: "Invalid Time Format!",
//             text: "Please use HH:MM format (e.g., 05:30)",
//             icon: "error",
//             confirmButtonText: "Got It",
//           });
//         } else {
//           alert("Please use valid time format (HH:MM)");
//         }
//         return;
//       }

//       const res = await fetch("/api/admin/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(editableTimings),
//       });

//       const result = await res.json();

//       if (result.success) {
//         if (typeof window !== "undefined" && window.Swal) {
//           window.Swal.fire({
//             title: "Good job!",
//             text: "Prayer Times Updated!",
//             icon: "success",
//           });
//         } else {
//           alert("Prayer Times Updated Successfully!");
//         }
//       } else {
//         throw new Error(result.message || "Update failed");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       if (typeof window !== "undefined" && window.Swal) {
//         window.Swal.fire({
//           title: "Operation Failed!",
//           text: "There was an issue updating prayer times. Please try again.",
//           icon: "error",
//           confirmButtonText: "Got It",
//         });
//       } else {
//         alert("Failed to update prayer times. Please try again.");
//       }
//     }
//   };

//   const handleLogout = () => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("isLoggedIn");
//       router.push("/admin/login");
//     }
//   };

//   // Show loading while checking authentication
//   if (!isAuthenticated) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="flex-col gap-4 w-full flex items-center justify-center">
//           <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-amber-400 rounded-full">
//             <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
//           </div>
//           <p className="text-gray-600 mt-4">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show loading while fetching data
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="flex-col gap-4 w-full flex items-center justify-center">
//           <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-amber-400 rounded-full">
//             <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
//           </div>
//           <p className="text-gray-600 mt-4">Loading prayer times...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (isError) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-center">
//           <p className="text-red-500 text-xl mb-4">
//             Error loading prayer times
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen">
//       <div className="bg-new text-center p-4 w-72 rounded-xl border-4 border-gray-800 shadow-xl">
//         {/* Top Text */}
//         <div className="text-glow-white text-sm font-bold mb-1">
//           لا إله إلا الله محمد رسول الله
//         </div>

//         {/* Digital Clock */}
//         <div className="flex justify-center gap-2 mb-4">
//           <span className="text-glow-red text-4xl font-bold">
//             {time.hours}:{time.minutes}
//           </span>
//           <span className="text-glow-red text-2xl font-bold">
//             {time.seconds}
//           </span>
//         </div>

//         {/* Remaining Time */}
//         <div className="flex justify-end items-center bg-gray-600/20 rounded-sm py-1 pr-1 mb-4">
//           <div className="flex gap-x-2 mr-4 animate-pulse text-green-400 text-xl">
//             {remainingTime}
//           </div>
//           <p className="text-glow-white text-sm w-24">بقیہ وقت برائے جماعت</p>
//         </div>

//         {/* Editable Prayer Timings */}
//         <div className="space-y-6 text-lg font-semibold text-right px-2">
//           {Object.entries(editableTimings).map(([key, timeVal], index) => (
//             <div key={index} className="flex justify-between">
//               <input
//                 type="text"
//                 value={timeVal}
//                 onChange={(e) => handleChange(key, e.target.value)}
//                 placeholder="HH:MM"
//                 className={`tracking-widest bg-gray-400/10 rounded-sm w-24 text-center focus:outline-none focus:border-blue-400 transition-colors ${
//                   prayerNames[key] === upcomingPrayer
//                     ? "text-glow-green animate-pulse font-bold"
//                     : "text-glow-red border-transparent"
//                 }`}
//               />
//               <span
//                 className={`bg-gray-400/10 rounded-sm w-20 text-center pb-1 flex items-center justify-center text-glow-white`}
//               >
//                 {prayerNames[key]}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Save and Logout Buttons */}
//         <div className="update-logout-btn flex justify-between gap-2">
//           <button
//             onClick={handleSave}
//             disabled={Object.keys(editableTimings).length === 0}
//             className="mt-6 px-4 py-1 bg-green-700 text-glow-white text-sm rounded hover:bg-[#012322] transition-colors duration-200 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Update Timing
//           </button>
//           <button
//             className="mt-6 px-4 py-1 bg-red-700 text-glow-white text-sm rounded hover:bg-red-800 transition-colors duration-200 ease-in-out cursor-pointer"
//             onClick={handleLogout}
//           >
//             Log out
//           </button>
//         </div>

//         {/* Bottom Info (Ishraq or Date) */}
//         <div className="bg-gray-400/10 mt-4 h-11 rounded-sm flex items-center justify-center gap-6 text-green-400">
//           <div
//             className={`flex items-center gap-6 transition-transform duration-500 ${
//               boolForSlider ? "animate-slide-in-left" : "animate-slide-in-right"
//             }`}
//           >
//             <p className="text-2xl mb-2">
//               {boolForSlider ? urduMonths[currentMonth] : "اشراق"}
//             </p>
//             <p className="text-2xl">
//               {boolForSlider ? todayDate : data?.[0]?.ishraq || "--:--"}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






"use client";
import { useEffect, useState } from "react";
import { useGetPrayerTimeQuery } from "@/app/clientQuery";
import { useRouter } from "next/navigation";
import { Hamburger } from "lucide-react";

const prayerNames = {
  fajr: "الفجر",
  zuhr: "الظہر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

export default function PrayerDisplay() {
  const { data, isLoading, isError } = useGetPrayerTimeQuery("timings");
  const [editableTimings, setEditableTimings] = useState({});
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

  // Initialize editableTimings from API
  useEffect(() => {
    {
      if (localStorage.getItem("isLoggedIn")) {
        localStorage.setItem("isLoggedIn", true);
      } else {
        router.push("/admin/login");
      }
    }
    if (data && data[0]) {
      const initial = Object.entries(data[0])
        .filter(([key]) => key !== "_id" && key !== "ishraq")
        .reduce((acc, [key, val]) => {
          acc[key] = val;
          return acc;
        }, {});
      setEditableTimings(initial);
    }
  }, [data]);

  // Clock and logic
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
        const timings = Object.entries(data[0])
          .filter(([key]) => key !== "_id" && key !== "ishraq")
          .map(([key, val]) => {
            const [hr, mn] = val.split(":").map(Number);
            return { name: prayerNames[key], hour: hr, min: mn, key };
          });

        const nowMinutes = h * 60 + m;
        const upcoming = timings.find((t) => t.hour * 60 + t.min >= nowMinutes);

        if (upcoming) {
          setUpcomingPrayer(upcoming.name);
          const diff = upcoming.hour * 60 + upcoming.min - nowMinutes;
          const remH = Math.floor(diff / 60);
          const remM = diff % 60;
          setRemainingTime(
            `${String(remH).padStart(2, "0")}:${String(remM).padStart(2, "0")}`
          );
        } else {
          setUpcomingPrayer("کوئی نماز باقی نہیں");
          setRemainingTime("--:--");
        }
      }
    }, 1000);

    const slideInterval = setInterval(() => {
      setBoolForSlide((prev) => !prev);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(slideInterval);
    };
  }, [data]);

  const handleChange = (key, value) => {
    setEditableTimings({ ...editableTimings, [key]: value });
  };

  const handleSave = async () => {
    const res = await fetch("/api/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editableTimings),
    });

    const result = await res.json();
    if (result.success) {
      Swal.fire({
        title: "Good job!",
        text: "Prayers Times Updated!",
        icon: "success",
      });
    } else {
      Swal.fire({
        title: "Operation Failed!",
        text: "There was an issue in Updating prayer Times. Please try again.",
        icon: "error", // Use 'error' icon for failed operations
        confirmButtonText: "Got It",
      });
    }
  };
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Clear login state
    router.push("/admin/login"); // Redirect to login
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      {isLoading ? (
        <div class="flex-col gap-4 w-full flex items-center justify-center">
          <div class="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-amber-400 rounded-full">
            <div class="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="bg-new text-center p-4 w-72 rounded-xl border-4 border-gray-800 shadow-xl">
          {/* Top Text */}
          <div className="text-glow-white text-sm font-bold mb-1">
            لا إله إلا الله محمد رسول الله
          </div>

          {/* Digital Clock */}
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-glow-red text-4xl font-bold">
              {time.hours}:{time.minutes}
            </span>
            <span className="text-glow-red text-2xl font-bold">
              {time.seconds}
            </span>
          </div>

          {/* Remaining Time */}
          <div className="flex justify-end items-center bg-gray-600/20 rounded-sm py-1 pr-1 mb-4">
            <div className="flex gap-x-2 mr-4 animate-pulse text-green-400 text-xl">
              {remainingTime}
            </div>
            <p className="text-glow-white text-sm w-24">بقیہ وقت برائے جماعت</p>
          </div>

          {/* Editable Prayer Timings */}
          <div className="space-y-6 text-lg font-semibold text-right px-2">
            {Object.entries(editableTimings).map(([key, timeVal], index) => (
              <div key={index} className="flex justify-between">
                <input
                  type="text"
                  value={timeVal}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`tracking-widest bg-gray-400/10 rounded-sm w-24 text-center ${
                    prayerNames[key] === upcomingPrayer
                      ? "text-glow-green"
                      : "text-glow-red"
                  }`}
                />
                <span
                  className={`bg-gray-400/10 rounded-sm w-20 text-center pb-1 ${
                    prayerNames[key] === upcomingPrayer
                      ? "text-glow-green"
                      : "text-glow-white"
                  }`}
                >
                  {prayerNames[key]}
                </span>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="update-logout-btn flex justify-between">
            <button
              onClick={() => {
                handleSave();
              }}
              className="mt-6 px-4 py-1 bg-green-700 text-glow-white text-sm rounded hover:bg-[#012322] transition-colors duration-200 ease-in-out cursor-pointer"
            >
              Update Timing
            </button>
            <button
              className="mt-6 px-4 py-1 bg-green-700 text-glow-white text-sm rounded hover:bg-[#012322] transition-colors duration-200 ease-in-out cursor-pointer"
              onClick={() => handleLogout()}
            >
              Log out
            </button>
          </div>

          {/* Bottom Info (Ishraq or Date) */}
          <div className="bg-gray-400/10 mt-4 h-11 rounded-sm flex items-center justify-center gap-6 text-green-400">
            <div
              className={`flex items-center gap-6 transition-transform duration-500 ${
                boolForSlider
                  ? "animate-slide-in-left"
                  : "animate-slide-in-right"
              }`}
            >
              <p className="text-2xl mb-2">
                {boolForSlider ? urduMonths[currentMonth] : "اشراق"}
              </p>
              <p className="text-2xl">
                {boolForSlider ? todayDate : data?.[0]?.ishraq || "--:--"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}