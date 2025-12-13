"use client";

import React, { JSX, useCallback, useEffect, useMemo, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Typography, Box, Switch } from "@mui/material";
import {
  Button,
  DeleteIconButton,
  EditIconButton,
  ViewIconButton,
} from "@/components/Button";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { gameService } from "@/services/game.service";
import {
  BookOpen,
  Ear,
  FileText,
  Gamepad2,
  Gift,
  Headphones,
  HelpCircle,
  Link2,
  MessageCircle,
  Mic,
  Puzzle,
  Trophy,
  Type,
} from "lucide-react";
import { Lesson, LessonQuestion, LessonType, Question } from "@/types/game";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const typeStyles: Record<string, string> = {
  Flashcard: "bg-indigo-500",
  Reward: "bg-yellow-500",
  Game: "bg-rose-500",
};

const typeIcons: Record<string, JSX.Element> = {
  Flashcard: <BookOpen className="w-5 h-5 text-white" />,
  Reward: <Gift className="w-5 h-5 text-white" />,
  Game: <Gamepad2 className="w-5 h-5 text-white" />,
};

const questionIcons: Record<string, JSX.Element> = {
  Matching: <Puzzle className="w-4 h-4 text-white" />,
  "Multiple Choice": <HelpCircle className="w-4 h-4 text-white" />,
  "Fill in blank": <Type className="w-4 h-4 text-white" />,
  Speech: <MessageCircle className="w-4 h-4 text-white" />,
  Listening: <Ear className="w-4 h-4 text-white" />,
};

const questionColors: Record<string, string> = {
  Matching: "bg-sky-500", // xanh lam sáng
  "Multiple Choice": "bg-indigo-500", // xanh tím nhẹ
  "Fill in blank": "bg-violet-500", // tím trung tính
  Speech: "bg-fuchsia-500", // hồng tím
  Listening: "bg-orange-500", // cam sáng thay cho rose
};

export default function LessonPage() {
  const { gameLevelId } = useParams();
  const { stageId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [lessonReward, setLessonReward] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lessonQuestions, setLessonQuestions] = useState<LessonQuestion[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const gameType = useMemo(() => {
    return lessonTypes.find(
      (lessonType) => lessonType.lesson_type_name === "Game"
    );
  }, [lessonTypes]);

  // ---------- FETCH ----------
  const fetchData = useCallback(() => {
    if (stageId) {
      gameService
        .getAllLessons(stageId.toString())
        .then((res) => {
          setLessons(res.data);
        })
        .catch((err) => console.log(err));
      gameService
        .getAllQuestions()
        .then((res) => setQuestions(res.data))
        .catch((err) => console.log(err));
      gameService
        .getLessonTypes()
        .then((res) => setLessonTypes(res.data))
        .catch((err) => console.log(err));
    }
  }, [stageId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- HANDLERS ----------
  const handleOpenAdd = () => {
    setLesson(null);
    setLessonName("");
    setLessonQuestions([]);
    setOpen(true);
  };
  const handleOpenUpdate = (lesson: Lesson) => {
    setLessonName(lesson.lesson_name);
    setLessonQuestions(lesson.lesson_question);
    setLesson(lesson);
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
    setLesson(null);
  };

  const handleAddQuestion = () => {
    setLessonQuestions((prev) => [
      ...prev,
      {
        question_id: questions.filter(
          (question) =>
            !lessonQuestions.some(
              (lessonQuestion) =>
                question.question_id === lessonQuestion.question_id
            )
        )[0].question_id,
        question_count: 1,
      },
    ]);
  };

  const handleChangeQuestion = (
    index: number,
    field: keyof LessonQuestion,
    value: any
  ) => {
    const updated = [...lessonQuestions];
    (updated[index] as any)[field] = value;
    setLessonQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    setLessonQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveGameLesson = useCallback(() => {
    if (!lessonName.trim()) {
      toast.error("Please enter the game lesson name.");
      return;
    }
    if (!lessonReward) {
      toast.error("Please enter the game lesson reward (ruby).");
      return;
    }

    if (lessonQuestions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }
    setIsSaving(true);
    if (lesson != null) {
      gameService
        .updateLesson(
          lesson.lesson_id,
          lessonName,
          gameType?.lesson_type_id ?? "",
          lessonReward,
          lessonQuestions
        )
        .then(() => {
          fetchData();
          setOpen(false);
          setIsSaving(false);
        })
        .catch((err) => console.log(err));
    } else {
      gameService
        .addLesson(
          stageId?.toString() ?? "",
          lessonName,
          gameType?.lesson_type_id ?? "",
          lessonReward,
          lessonQuestions
        )
        .then(() => {
          fetchData();
          setOpen(false);
          setIsSaving(false);
        })
        .catch((err) => console.log(err));
    }
  }, [
    gameType,
    lessonName,
    lessonQuestions,
    lessonReward,
    fetchData,
    stageId,
    lesson,
  ]);
  const handleDeleteLesson = () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    gameService
      .deleteLesson(confirmDeleteId)
      .then(() => {
        setConfirmDeleteId(null);
        setDeleting(false);
        fetchData();
      })
      .catch((err) => console.log(err));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.lesson_id === active.id);
    const newIndex = lessons.findIndex((l) => l.lesson_id === over.id);
    if (newIndex === 0 || newIndex === lessons.length - 1) {
      return;
    }
    const newLessons = arrayMove(lessons, oldIndex, newIndex).map(
      (l, index) => ({
        ...l,
        lesson_order: index + 1,
      })
    );

    setLessons(newLessons);

    gameService
      .updateLessonOrder(
        stageId?.toString() ?? "",
        newLessons.map((l) => l.lesson_id)
      )
      .catch((err) => console.log(err));
  };

  return (
    <div className="p-8 relative">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h5" fontWeight="bold">
          Lesson Management
        </Typography>
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          Add Game Lesson
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map((l) => l.lesson_id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-4 gap-3">
            {lessons.map((lesson, index) => (
              <SortableLesson
                key={lesson.lesson_id}
                lesson={lesson}
                isFirst={index === 0}
                isLast={index === lessons.length - 1}
                onUpdate={() => handleOpenUpdate(lesson)}
                onDelete={() => setConfirmDeleteId(lesson.lesson_id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* MODAL ADD GAME LESSON */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add Game Lesson
            </h3>
            <div className="flex gap-5 mb-4">
              <div className="grow">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Game Lesson Name
                </label>
                <input
                  type="text"
                  placeholder="Lesson 1"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Game Reward
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="5"
                  value={lessonReward}
                  onChange={(e) => setLessonReward(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Lesson Questions
                </label>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={lessonQuestions.length === questions.length}
                  onClick={handleAddQuestion}
                >
                  Add Question
                </Button>
              </div>

              {lessonQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Select
                    value={q.question_id}
                    onValueChange={(value) =>
                      handleChangeQuestion(i, "question_id", value)
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Select POS" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions
                        .filter(
                          (question) =>
                            !lessonQuestions.some(
                              (lessonQuestion, j) =>
                                lessonQuestion.question_id ===
                                  question.question_id && j !== i
                            )
                        )
                        .map((question) => (
                          <SelectItem
                            key={question.question_id}
                            value={question.question_id}
                          >
                            {question.question_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <input
                    type="number"
                    min={1}
                    value={q.question_count}
                    onChange={(e) =>
                      handleChangeQuestion(
                        i,
                        "question_count",
                        Number(e.target.value)
                      )
                    }
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  <DeleteIconButton onClick={() => handleRemoveQuestion(i)} />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="primary" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                disabled={isSaving}
                onClick={handleSaveGameLesson}
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
                onClick={handleDeleteLesson}
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

function SortableLesson({
  lesson,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
}: {
  lesson: Lesson;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: lesson.lesson_id,
      disabled: isFirst || isLast,
    });

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
      className="h-32 cursor-grab select-none shadow-sm hover:shadow-md transition-all rounded-xl p-4 flex flex-col bg-white border border-gray-100"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Icon tròn hiển thị loại lesson */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    typeStyles[lesson.lesson_type.lesson_type_name] ||
                    "bg-gray-300"
                  }`}
                >
                  {typeIcons[lesson.lesson_type.lesson_type_name] || (
                    <BookOpen className="w-5 h-5 text-white" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {lesson.lesson_type.lesson_type_name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Typography
            variant="subtitle1"
            fontWeight="bold"
            className="text-gray-800"
          >
            {lesson.lesson_name}
          </Typography>
        </div>

        {/* Action buttons */}
        {lesson.lesson_type.lesson_type_name === "Game" && (
          <Box display="flex" alignItems="center" gap={1}>
            <EditIconButton onClick={onUpdate} />
            <DeleteIconButton onClick={onDelete} />
          </Box>
        )}
      </div>

      {/* Hiển thị danh sách câu hỏi nếu là Game */}
      {lesson.lesson_type.lesson_type_name === "Game" &&
        lesson.lesson_question &&
        lesson.lesson_question.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <TooltipProvider>
              {lesson.lesson_question.map((q, i) => {
                const name = q.question?.question_name ?? "";
                const bgColor = questionColors[name] || "bg-gray-400";
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor}`}
                      >
                        {questionIcons[name] || (
                          <HelpCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        )}
    </Card>
  );
}
