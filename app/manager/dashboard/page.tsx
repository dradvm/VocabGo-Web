"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from "chart.js";

import { Activity, Book, CheckCircle, User } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/user.service";
import { progressService } from "@/services/progress.service";
import { vocabularyService } from "@/services/vocabulary.service";
import { questService } from "@/services/quest.service";

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [userGrowth, setUserGrowth] = useState(0.0);
  const [totalVocab, setTotalVocab] = useState(0);
  const [practiceToday, setPractiveToday] = useState(0);
  const [missionPercent, setMissionPercent] = useState(0.0);
  const [missionChange, setMissionChange] = useState(0.0);
  const [activityFilter, setActivityFilter] = useState("day");
  const [newUserFilter, setNewUserFilter] = useState("day");
  const [questFilter, setQuestFilter] = useState("day");

  const generateLabels = (filter: string) => {
    if (filter === "day") {
      const now = new Date();
      const labels: string[] = [];

      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });
        labels.push(dayLabel);
      }

      return labels;
    }
    if (filter === "month")
      return [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    return ["2021", "2022", "2023", "2024", "2025"];
  };

  const [newUserData, setNewUserData] = useState({
    labels: generateLabels(newUserFilter),
    datasets: [
      {
        label: "New Users",
        data: [],
        borderWidth: 2,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.4)",
        tension: 0,
      },
    ],
  });
  const [activityData, setActivityData] = useState({
    labels: generateLabels(activityFilter),
    datasets: [
      {
        label: "Active Users Over Time",
        data: [],
        borderWidth: 2,
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.4)",
        tension: 0,
      },
    ],
  });
  const [questData, setQuestData] = useState({
    labels: generateLabels(questFilter),
    datasets: [
      {
        label: "Quest Completion Rate Over Time",
        data: [],
        borderWidth: 2,
        borderColor: "rgba(249, 115, 22, 1)",
        backgroundColor: "rgba(249, 115, 22, 0.4)",
        tension: 0,
      },
    ],
  });

  const getUserGrowthColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getActivityColor = (value: number) => {
    if (value >= 50) return "text-green-600";
    if (value <= 50) return "text-red-600";
    return "text-gray-500";
  };

  const getMissionColor = (change: number) => {
    if (change > 0) return "text-green-600 font-semibold";
    if (change < 0) return "text-red-600 font-semibold";
    return "text-gray-500";
  };

  useEffect(() => {
    userService
      .getUserStatsByPeriod(newUserFilter)
      .then((res) => {
        setNewUserData({
          labels: generateLabels(newUserFilter),
          datasets: [
            {
              label: "New Users",
              data: res.data,
              borderWidth: 2,
              borderColor: "rgba(16, 185, 129, 1)",
              backgroundColor: "rgba(16, 185, 129, 0.4)",
              tension: 0,
            },
          ],
        });
      })
      .catch((err) => console.log(err));
  }, [newUserFilter]);

  useEffect(() => {
    progressService
      .getActivityStatsByPeriod(activityFilter)
      .then((res) => {
        setActivityData({
          labels: generateLabels(activityFilter),
          datasets: [
            {
              label: "Active Users Over Time",
              data: res.data,
              borderWidth: 2,
              borderColor: "rgba(99, 102, 241, 1)",
              backgroundColor: "rgba(99, 102, 241, 0.4)",
              tension: 0,
            },
          ],
        });
      })
      .catch((err) => console.log(err));
  }, [activityFilter]);

  useEffect(() => {
    questService
      .getQuestStatsByPeriod(questFilter)
      .then((res) => {
        setQuestData({
          labels: generateLabels(questFilter),
          datasets: [
            {
              label: "Quest Completion Rate Over Time",
              data: res.data,
              borderWidth: 2,
              borderColor: "rgba(249, 115, 22, 1)",
              backgroundColor: "rgba(249, 115, 22, 0.4)",
              tension: 0,
            },
          ],
        });
      })
      .catch((err) => console.log(err));
  }, [questFilter]);
  useEffect(() => {
    userService
      .getUserOverview()
      .then((res) => {
        setTotalUsers(res.data.currentUsers);
        setUserGrowth(
          Number(
            (
              ((res.data.currentUsers - res.data.oneWeekAgoUsers) /
                res.data.oneWeekAgoUsers) *
              100
            ).toFixed(1)
          )
        );
      })
      .catch((err) => console.log(err));
    progressService
      .getActivityOverview()
      .then((res) => {
        setPractiveToday(res.data);
      })
      .catch((err) => console.log(err));
    vocabularyService
      .getWordOverview()
      .then((res) => setTotalVocab(res.data))
      .catch((err) => console.log(err));

    questService
      .getQuestOverview()
      .then((res) => {
        setMissionPercent(res.data.thisMonthRate);
        setMissionChange(res.data.thisMonthRate - res.data.lastMonthRate);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="space-y-6 w-full max-w-[1500px] mx-auto px-4 pb-4">
      {/* TOP 4 CARDS (GIỮ NGUYÊN) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-xl font-semibold">{totalUsers}</div>
          <div
            className={`text-xs mt-1 font-semibold ${getUserGrowthColor(
              userGrowth
            )}`}
          >
            {userGrowth > 0 ? "+" : ""}
            {userGrowth}% vs last week
          </div>
        </div>

        {/* Total Vocabulary */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">
              Total Vocabulary
            </span>
            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center">
              <Book className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-xl font-semibold">{totalVocab}</div>
          <div className="text-xs text-gray-500 mt-1 font-semibold">
            Total words
          </div>
        </div>

        {/* Practice Today */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">
              Practice Today
            </span>
            <div className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-xl font-semibold">{practiceToday}</div>
          <div
            className={`text-xs mt-1 ${getActivityColor(
              (practiceToday / totalUsers) * 100
            )} font-semibold`}
          >
            {((practiceToday / totalUsers) * 100).toFixed(1)}% of users active
            today
          </div>
        </div>

        {/* Mission Completion */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">
              Mission Completion
            </span>
            <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-xl font-semibold">
            {missionPercent.toFixed(1)}%
          </div>
          <div className={`text-xs mt-1 ${getMissionColor(missionChange)}`}>
            {missionChange > 0 ? "+" : ""}
            {missionChange.toFixed(1)}% vs last month
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Users Chart */}
        <div className="bg-white border rounded-lg p-5 shadow-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">New Users</h3>

            {/* Filter Select */}
            <Select value={newUserFilter} onValueChange={setNewUserFilter}>
              <SelectTrigger className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">This Week</SelectItem>
                <SelectItem value="month">This Year</SelectItem>
                <SelectItem value="year">Last 5 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Line data={newUserData} height={140} />
        </div>

        {/* User Activity Chart */}
        <div className="bg-white border rounded-lg p-5 shadow-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Active Users Over Time
            </h3>

            {/* Filter Select */}
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">This Week</SelectItem>
                <SelectItem value="month">This Year</SelectItem>
                <SelectItem value="year">Last 5 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Line data={activityData} height={140} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* User Activity Chart */}
        <div className="col-span-1"></div>
        <div className="col-span-2 bg-white border rounded-lg p-5 shadow-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Quest Completion Rate Over Time
            </h3>

            {/* Filter Select */}
            <Select value={questFilter} onValueChange={setQuestFilter}>
              <SelectTrigger className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">This Week</SelectItem>
                <SelectItem value="month">This Year</SelectItem>
                <SelectItem value="year">Last 5 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Line data={questData} height={140} />
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
}
