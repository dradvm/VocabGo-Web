"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Edit, Trash2, Search, Upload, Loader2, Download } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { vocabularyService } from "@/services/vocabulary.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VocabularyPage() {
  const [words, setWords] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null); // ✅ ID đang chờ xác nhận xoá
  const [deleting, setDeleting] = useState(false); // ✅ trạng thái đang xoá

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // ✅ Fetch data
  const fetchWords = async () => {
    try {
      const res = await vocabularyService.getWords(page, pageSize, search);
      setWords(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [page, pageSize, search]);

  // ✅ Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPage(0);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        setSearch(value);
      }, 100)
    );
  };

  // ✅ Handle CSV import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    vocabularyService
      .importCSV(formData)
      .then((res) => {
        console.log("✅ Import success:", res.data);
        fetchWords();
      })
      .catch((err) => {
        console.error("❌ Import failed:", err);
      })
      .finally(() => {
        setLoading(false);
        e.target.value = "";
      });
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  // ✅ Handle delete confirm
  const handleDeleteWord = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await vocabularyService.deleteWord(confirmDeleteId);
      setConfirmDeleteId(null);
      fetchWords();
      toast.success("Successfully deleted", { position: "top-right" });
    } catch (err) {
      console.error("❌ Delete failed:", err);
      toast.success("Delete failed! Please try again", {
        position: "top-right",
      });
    } finally {
      setDeleting(false);
    }
  };
  const handleDownloadCsv = async () => {
    vocabularyService
      .downloadCsv()
      .then((res) => {
        const url = window.URL.createObjectURL(res.data);

        const a = document.createElement("a");
        a.href = url;
        a.download = "vocabulary.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.log(err));
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: "word", header: "Word" },
    { accessorKey: "phonetic", header: "Phonetic" },
    { accessorKey: "meaning_vi", header: "Meaning" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => router.push(`./vocabulary/${row.original.word_id}`)}
            className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition cursor-pointer"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => setConfirmDeleteId(row.original.word_id)} // ✅ mở popup
            className="p-2 rounded-md text-red-600 hover:bg-red-50 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: words,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  });
  useEffect(() => {
    const handleBack = () => {
      fetchWords();
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  return (
    <div className="p-4 relative">
      {/* 🔹 Loading Modal */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center gap-3 min-w-[240px]">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-gray-700 font-medium mt-1">Processing CSV...</p>
          </div>
        </div>
      )}

      {/* 🔹 Confirm Delete Popup */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl w-[340px] text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this word? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWord}
                disabled={deleting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition cursor-pointer ${
                  deleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search word..."
            value={search}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={triggerImport}>
            <Upload size={16} className="me-2" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button variant="primary" size="sm" onClick={handleDownloadCsv}>
            <Download size={16} className="me-2" />
            Download CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("./vocabulary/addword")}
          >
            Add Word
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow border border-gray-200 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={`px-5 py-2 font-semibold text-gray-700 uppercase tracking-wide text-xs ${
                      idx === columns.length - 1 ? "text-center" : "text-left"
                    }`}
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
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={`px-5 py-2 border-t border-gray-100 ${
                        idx === columns.length - 1 ? "text-center" : ""
                      }`}
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
                  No data found
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
