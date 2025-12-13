"use client";

import React, { useEffect, useState } from "react";
import { Search, Edit } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authService } from "@/services/auth.service";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<any>(null);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await authService.getUsers(page, pageSize, search);
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = (userId: string) => {
    authService
      .toggleBan(userId)
      .then((res) => {
        fetchUsers();
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search]);

  // 🔹 Search handle
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPage(0);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => setSearch(value), 100));
  };

  // 🔹 Table columns
  const columns: ColumnDef<any>[] = [
    // {
    //   accessorKey: "avatar",
    //   header: "Avatar",
    //   cell: ({ row }) => (
    //     <div className="flex justify-around">
    //       <Image
    //         src={row.original.avatar || "/default-avatar.png"}
    //         alt="User Avatar"
    //         width={40}
    //         height={40}
    //         className="rounded-full object-cover border"
    //         unoptimized
    //       />
    //     </div>
    //   ),
    // },
    // { accessorKey: "name", header: "Name" },
    { accessorKey: "primary_email", header: "Email" },
    // {
    //   accessorKey: "level",
    //   header: "Level",
    //   cell: ({ row }) => (
    //     <div className="text-center">{row.original.level}</div>
    //   ),
    // },
    // {
    //   accessorKey: "xp",
    //   header: "XP",
    //   cell: ({ row }) => <div className="text-center">{row.original.xp}</div>,
    // },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.original.last_login_at).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;

        const roleStyle: any = {
          admin: "bg-red-100 text-red-700",
          user: "bg-gray-100 text-gray-700",
        };

        return (
          <div className="flex justify-around">
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${roleStyle[role]}`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        const statusStyle: any = {
          active: "bg-green-100 text-green-700",
          banned: "bg-red-100 text-red-700",
          pending: "bg-yellow-100 text-yellow-700",
        };

        return (
          <div className="flex justify-around">
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[status]}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "Ban",
      cell: ({ row }) => {
        const user = row.original;

        // Nếu là admin → không hiện switch
        if (user.role === "admin") return null;

        return (
          <div className="flex justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.status == "banned"}
                onChange={() => handleToggleBan(user.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-red-500 transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-64 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow border border-gray-200 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-2 font-semibold text-gray-700 uppercase tracking-wide text-xs text-center"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50 transition`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-2 border-t border-gray-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5 text-sm">
        <p className="text-gray-600">
          Page {page + 1} of {Math.ceil(total / pageSize) || 1}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1.5 rounded-md border text-gray-700 transition ${
              page === 0
                ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                : "bg-white hover:bg-indigo-50 border-gray-300 hover:border-indigo-400"
            }`}
          >
            Previous
          </button>

          <button
            disabled={page >= Math.ceil(total / pageSize) - 1}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1.5 rounded-md border text-gray-700 transition ${
              page >= Math.ceil(total / pageSize) - 1
                ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                : "bg-white hover:bg-indigo-50 border-gray-300 hover:border-indigo-400"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
