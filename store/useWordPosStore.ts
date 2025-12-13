import { Stage } from "@/app/manager/learning/[gameLevelId]/page";
import { WordPos } from "@/types/word";
import { create } from "zustand";

interface WordPosState {
  isFromStage: boolean;
  isEdit: Stage | null;
  setIsEdit: (state: Stage | null) => void;
  selectedWordPos: WordPos[];
  setSelectedWordPos: (list: WordPos[]) => void;
  setIsFromStage: (state: boolean) => void;
  addWordPos: (item: WordPos) => void;
  removeWordPos: (id: string | number) => void; // tùy bạn dùng id gì
  clearWordPos: () => void;
}

export const useWordPosStore = create<WordPosState>((set) => ({
  isFromStage: false,
  isEdit: null,
  selectedWordPos: [],

  setSelectedWordPos: (list) => set({ selectedWordPos: list }),

  addWordPos: (item) =>
    set((state) => ({
      selectedWordPos: [...state.selectedWordPos, item],
    })),

  removeWordPos: (id) =>
    set((state) => ({
      selectedWordPos: state.selectedWordPos.filter(
        (w) => w.word_pos_id !== id
      ),
    })),

  clearWordPos: () => set({ selectedWordPos: [] }),

  setIsFromStage: (state: boolean) => set({ isFromStage: state }),
  setIsEdit: (state) => set({ isEdit: state }),
}));
