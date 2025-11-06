"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  DeleteIconButton,
  EditIconButton,
  ViewIconButton,
} from "@/components/Button";
import { gameService } from "@/services/game.service";
import toast from "react-hot-toast";

interface GameLevel {
  game_level_id: string;
  game_level_name: string;
  game_level_description: string;
  level_order: number;
}

export default function LessonsPage() {
  const [gameLevels, setGameLevels] = useState<GameLevel[]>([]);
  const [open, setOpen] = useState(false);
  const [editingGameLevel, setEditingGameLevel] = useState<GameLevel | null>(
    null
  );
  const [gameLevelName, setGameLevelName] = useState("");
  const [gameLevelDescription, setGameLevelDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // 🔹 Kéo thả sắp xếp
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = gameLevels.findIndex(
      (item) => item.game_level_id === active.id
    );
    const newIndex = gameLevels.findIndex(
      (item) => item.game_level_id === over.id
    );
    const newGameLevels = arrayMove(gameLevels, oldIndex, newIndex).map(
      (item, index) => ({ ...item, level_order: index + 1 })
    );

    setGameLevels(newGameLevels);
    gameService
      .updateGameLevelOrder(
        newGameLevels.map((gameLevel) => gameLevel.game_level_id)
      )
      .then(() => fetchData())
      .catch((err) => console.log(err));
  };

  // 🔹 Mở modal thêm
  const handleOpenAdd = () => {
    setEditingGameLevel(null);
    setGameLevelName("");
    setGameLevelDescription("");
    setOpen(true);
  };

  // 🔹 Sửa
  const handleEdit = (gameLevel: GameLevel) => {
    setEditingGameLevel(gameLevel);
    setGameLevelName(gameLevel.game_level_name);
    setGameLevelDescription(gameLevel.game_level_description);
    setOpen(true);
  };

  const handleSave = () => {
    if (!gameLevelName || !gameLevelDescription) {
      toast.error(
        "Please fill in both the name and description of the game level.",
        { position: "top-right" }
      );
      return;
    }

    if (editingGameLevel) {
      gameService
        .updateGameLevel(editingGameLevel.game_level_id, {
          gameLevelName: gameLevelName,
          gameLevelDescription: gameLevelDescription,
        })
        .then((res) => fetchData())
        .catch((res) => console.log(err));
    } else {
      gameService
        .addGameLevel({
          gameLevelName: gameLevelName,
          gameLevelDescription: gameLevelDescription,
        })
        .then((res) => fetchData())
        .catch((err) => console.log(err));
    }
    setOpen(false);
  };

  const handleDeleteGameLevel = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    gameService
      .deleteGameLevel(confirmDeleteId)
      .then((res) => {
        setConfirmDeleteId(null);
        setDeleting(false);
        fetchData();
      })
      .catch((err) => console.log(err));
  };
  const fetchData = () => {
    gameService
      .getGameLevels()
      .then((res) => setGameLevels(res.data))
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(confirmDeleteId);
  }, [confirmDeleteId]);
  return (
    <div className="p-8 relative">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h5" fontWeight="bold">
          Game Level Management
        </Typography>
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          Add Level
        </Button>
      </Box>

      {/* 🔹 Danh sách GameLevel có thể kéo thả */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={gameLevels.map((gl) => gl.game_level_id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameLevels.map((gameLevel) => (
              <SortableItem
                key={gameLevel.game_level_id}
                gameLevel={gameLevel}
                onEdit={() => handleEdit(gameLevel)}
                onDelete={() => setConfirmDeleteId(gameLevel.game_level_id)}
                onView={() =>
                  router.push(`./learning/${gameLevel.game_level_id}`)
                } // 👁 chuyển trang
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 🔹 Modal thêm/sửa GameLevel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl w-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingGameLevel ? "Edit Level" : "Add New Level"}
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Level name"
                value={gameLevelName}
                onChange={(e) => setGameLevelName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={gameLevelDescription}
                onChange={(e) => setGameLevelDescription(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="filled" size="sm" onClick={handleSave}>
                Save
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
              Are you sure you want to delete this level? This action cannot be
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
                onClick={handleDeleteGameLevel}
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

function SortableItem({
  gameLevel,
  onEdit,
  onDelete,
  onView,
}: {
  gameLevel: GameLevel;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: gameLevel.game_level_id });

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
      className="cursor-grab select-none shadow-sm hover:shadow-md transition-shadow rounded-md"
    >
      <CardContent className="h-full">
        <Box display="flex" flexDirection="column" height="100%">
          {/* 🔹 Nội dung chính */}
          <div className="flex flex-col grow">
            <Typography variant="subtitle1" fontWeight="bold">
              {gameLevel.game_level_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {gameLevel.game_level_description}
            </Typography>
          </div>

          {/* 🔹 Hàng nút action luôn dưới cùng */}
          <Box mt="auto" className="flex gap-2 justify-end">
            <ViewIconButton onClick={onView} />
            <EditIconButton onClick={onEdit} />
            <DeleteIconButton onClick={onDelete} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
