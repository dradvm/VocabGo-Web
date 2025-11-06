"use client";

import { authService } from "@/services/auth.service";

export default function DashboardPage() {
  const handleOnClick = () => {
    authService
      .test()
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <div>Dashboard</div>
      <button
        onClick={() => handleOnClick()}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
      >
        Test
      </button>
    </div>
  );
}
