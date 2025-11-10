"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Typography, Box, Switch } from "@mui/material";
import {
  Button,
  DeleteIconButton,
  EditIconButton,
  ViewIconButton,
} from "@/components/Button";
import toast from "react-hot-toast";
import { gameService } from "@/services/game.service";
import { useParams, useRouter } from "next/navigation";
import { vocabularyService } from "@/services/vocabulary.service";
import { Word, WordPos } from "@/types/word";

interface Stage {
  stage_id: string;
  stage_name: string;
  stage_order: number;
  is_active: boolean;
  stage_word: { word_pos_id: string }[];
}

export default function StagesPage() {
  const router = useRouter();
  const { gameLevelId } = useParams();
  const [stages, setStages] = useState<Stage[]>([]);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [stageName, setStageName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedWordPos, setSelectedWordPos] = useState<WordPos[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchData = () => {
    if (gameLevelId) {
      gameService
        .getAllStages(gameLevelId.toString() ?? "")
        .then((res) => setStages(res.data))
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseModal = () => {
    setOpen(false);
    setSearchTerm("");
    setWords([]);
    setSelectedWord(null);
    setSelectedWordPos([]);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.word_id === over.word_id) return;

    const oldIndex = stages.findIndex(
      (item) => item.stage_id === active.word_id
    );
    const newIndex = stages.findIndex((item) => item.stage_id === over.word_id);
    const newStages = arrayMove(stages, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        stage_order: index + 1,
      })
    );

    setStages(newStages);
    gameService
      .updateStageOrder(
        gameLevelId ? gameLevelId.toString() : "",
        newStages.map((s) => s.stage_id)
      )
      .then(() => fetchData())
      .catch((err) => console.log(err));
  };

  const handleOpenAdd = () => {
    setSearchTerm("");
    setWords([]);
    setSelectedWord(null);
    setSelectedWordPos([]);
    setEditingStage(null);
    setStageName("");
    setOpen(true);
  };

  const handleEdit = (stage: Stage) => {
    setSearchTerm("");
    setWords([]);
    setSelectedWord(null);
    setEditingStage(stage);
    setStageName(stage.stage_name);
    setOpen(true);
  };

  const handleSave = () => {
    if (!stageName) {
      toast.error("Please enter the stage name.", { position: "top-right" });
      return;
    }
    if (selectedWordPos.length < 5) {
      toast.error(
        "Please select at least one part of speech from the 5 words.",
        { position: "top-right" }
      );
      return;
    }
    setIsSaving(true);
    if (editingStage) {
      gameService
        .updateStage(
          gameLevelId ? gameLevelId.toString() : "",
          editingStage.stage_id,
          { stageName },
          selectedWordPos.map((ws) => ws.word_pos_id)
        )
        .then(() => {
          setOpen(false);
          setIsSaving(false);
          fetchData();
        })
        .catch((err) => console.log(err));
    } else {
      gameService
        .addStage(
          gameLevelId ? gameLevelId.toString() : "",
          { stageName },
          selectedWordPos.map((ws) => ws.word_pos_id)
        )
        .then(() => {
          setOpen(false);
          setIsSaving(false);
          fetchData();
        })
        .catch((err) => console.log(err));
    }
  };

  const handleDeleteStage = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    gameService
      .deleteStage(gameLevelId ? gameLevelId.toString() : "", confirmDeleteId)
      .then(() => {
        setConfirmDeleteId(null);
        setDeleting(false);
        fetchData();
      })
      .catch((err) => console.log(err));
  };

  const toggleActive = (stage: Stage) => {
    stage.is_active = !stage.is_active;
    gameService
      .updateStageActive(
        gameLevelId ? gameLevelId.toString() : "",
        stage.stage_id,
        stage.is_active
      )
      .then(() => fetchData())
      .catch((err) => console.log(err));
  };

  const handleSelectWord = (word: Word) => {
    setSelectedWord(word);
  };
  const handleSelectWordPos = (word: string, wordPos: WordPos) => {
    wordPos.word = word;
    if (selectedWordPos.some((ws) => ws.word_pos_id == wordPos.word_pos_id)) {
      setSelectedWordPos(
        selectedWordPos.filter((ws) => ws.word_pos_id != wordPos.word_pos_id)
      );
    } else {
      setSelectedWordPos((prev) => [...prev, wordPos]);
    }
  };
  const handleRemoveWordPos = (wordPos: WordPos) => {
    setSelectedWordPos(selectedWordPos.filter((ws) => ws != wordPos));
  };
  useEffect(() => {
    if (searchTerm.trim()) {
      vocabularyService
        .getWords(0, 100, searchTerm)
        .then((res) => {
          console.log(res.data.data);
          setWords(res.data.data);
        })
        .catch((err) => console.log(err));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWords([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (editingStage) {
      vocabularyService
        .getWordsByWordPosIds(
          editingStage.stage_word.map((sw) => sw.word_pos_id)
        )
        .then((res) => {
          setSelectedWordPos(
            res.data
              .flatMap((word: Word) => {
                word.word_pos.forEach((wp: WordPos) => (wp.word = word.word));
                return word.word_pos;
              })
              .filter((ws: WordPos) =>
                editingStage.stage_word.some(
                  (sw) => sw.word_pos_id === ws.word_pos_id
                )
              )
          );
          console.log(
            res.data
              .flatMap((word: Word) => {
                word.word_pos.forEach((wp: WordPos) => (wp.word = word.word));
                return word.word_pos;
              })
              .filter((ws: WordPos) =>
                editingStage.stage_word.some(
                  (sw) => sw.word_pos_id === ws.word_pos_id
                )
              )
          );
        })
        .catch((err) => console.log(err));
    }
  }, [editingStage]);
  return (
    <div className="p-8 relative">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h5" fontWeight="bold">
          Stage Management
        </Typography>
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          Add Stage
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map((s) => s.stage_id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-3 gap-3">
            {stages.map((stage) => (
              <SortableStage
                key={stage.stage_id}
                stage={stage}
                onEdit={() => handleEdit(stage)}
                onDelete={() => setConfirmDeleteId(stage.stage_id)}
                onToggleActive={() => toggleActive(stage)}
                onView={() => router.push(`./${gameLevelId}/${stage.stage_id}`)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 🔹 Modal thêm/sửa Stage */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl w-[1000px] ">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingStage ? "Edit Stage" : "Add New Stage"}
            </h3>

            {/* Stage Name */}
            <input
              type="text"
              placeholder="Stage name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6"
            />
            {/* 3 Columns */}
            <div className="grid grid-cols-3 gap-4">
              {/* ========== COLUMN 1: WORDS ========== */}
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                  Words
                </h4>

                {/* Search bar */}
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                />

                {/* Scrollable list */}
                <div className="overflow-y-auto space-y-1 h-64">
                  {words.length > 0 ? (
                    words.map((word) => (
                      <div
                        key={word.word_id}
                        onClick={() => handleSelectWord(word)}
                        className={`px-3 py-2 rounded-lg cursor-pointer text-sm truncate border ${
                          selectedWord?.word_id === word.word_id
                            ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                            : "hover:bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {word.word}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      {searchTerm.trim()
                        ? "No words found"
                        : "Enter to find word"}
                    </p>
                  )}
                </div>
              </div>

              {/* ========== COLUMN 2: WORD_POS ========== */}
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                  Word Part Of Speech
                </h4>

                {selectedWord ? (
                  selectedWord.word_pos.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto h-64">
                      {selectedWord.word_pos.map((pos: WordPos) => (
                        <div
                          key={pos.word_pos_id}
                          onClick={() =>
                            handleSelectWordPos(selectedWord.word, pos)
                          }
                          className={`px-3 py-2 rounded-lg cursor-pointer text-sm border flex justify-between items-center ${
                            selectedWordPos.some(
                              (p: WordPos) => p.word_pos_id === pos.word_pos_id
                            )
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "hover:bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <div className="flex-1">{selectedWord.word}</div>
                          <div className="w-16 text-center">
                            {pos.pos_tags.pos_tag}
                          </div>
                          <div className="w-20 text-center">
                            {pos.levels.level_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No POS available
                    </p>
                  )
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    Select a word to view POS
                  </p>
                )}
              </div>

              {/* ========== COLUMN 3: SELECTED ========== */}
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                  Added to Stage
                </h4>

                <div className="space-y-2 overflow-y-auto h-78">
                  {selectedWordPos.length > 0 ? (
                    selectedWordPos.map((pos) => (
                      <div
                        key={pos.word_pos_id}
                        className="flex justify-between items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex-1">{pos.word}</div>
                        <div className="w-16 text-center">
                          {pos.pos_tags.pos_tag}
                        </div>
                        <div className="w-20 text-center">
                          {pos.levels.level_name}
                        </div>
                        <button
                          onClick={() => handleRemoveWordPos(pos)}
                          className="text-red-500 text-xs ml-2 hover:font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No POS selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="primary" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
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
              Are you sure you want to delete this stage? This action cannot be
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
                onClick={handleDeleteStage}
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
    </div>
  );
}

function SortableStage({
  stage,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: {
  stage: Stage;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onView: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stage.stage_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab select-none shadow-sm hover:shadow-md transition-all rounded-xl p-4 flex flex-col bg-white"
    >
      <div className="flex justify-between items-center">
        {/* Stage name */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          className="text-gray-800 mb-2 truncate"
        >
          {stage.stage_name}
        </Typography>

        {/* Switch */}
        <Switch
          checked={stage.is_active}
          onChange={onToggleActive}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "#4f46e5", // indigo-600
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#4f46e5",
            },
          }}
        />
      </div>
      {/* Action buttons */}
      <Box display="flex" justifyContent="end" alignItems="center" gap={1.5}>
        <ViewIconButton onClick={onView} />
        <EditIconButton onClick={onEdit} />
        <DeleteIconButton onClick={onDelete} />
      </Box>
    </Card>
  );
}
