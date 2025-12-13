import { LessonQuestion } from "@/types/game";
import axiosInstance, { createAxios } from "./http";
export const gameService = {
  getGameLevels: () => axiosInstance.get("/game/gameLevels"),
  addGameLevel: (gameLevel: {
    gameLevelName: string;
    gameLevelDescription: string;
  }) => axiosInstance.post("/game/gameLevels", gameLevel),
  updateGameLevel: (
    gameLevelId: string,
    gameLevel: { gameLevelName: string; gameLevelDescription: string }
  ) => axiosInstance.patch(`/game/gameLevels/${gameLevelId}`, gameLevel),
  deleteGameLevel: (gameLevelId: string) =>
    axiosInstance.delete(`/game/gameLevels/${gameLevelId}`),
  updateGameLevelOrder: (gameLevelIds: string[]) =>
    axiosInstance.patch("/game/gameLevels/order", {
      gameLevelIds: gameLevelIds ?? [],
    }),
  getAllStages: (gameLevelId: string) =>
    axiosInstance.get(`/game/gameLevels/${gameLevelId}/stages/all`),
  addStage: (
    gameLevelId: string,
    stage: { stageName: string },
    wordPosIds: string[] = []
  ) =>
    axiosInstance.post(`/game/gameLevels/${gameLevelId}/stages`, {
      ...stage,
      wordPosIds,
    }),

  updateStage: (
    gameLevelId: string,
    stageId: string,
    stage: { stageName: string },
    wordPosIds: string[] = []
  ) =>
    axiosInstance.patch(`/game/gameLevels/${gameLevelId}/stages/${stageId}`, {
      ...stage,
      wordPosIds,
    }),
  updateStageActive: (
    gameLevelId: string,
    stageId: string,
    isActive: boolean
  ) =>
    axiosInstance.patch(
      `/game/gameLevels/${gameLevelId}/stages/${stageId}/active`,
      {
        isActive,
      }
    ),
  deleteStage: (gameLevelId: string, stageId: string) =>
    axiosInstance.delete(`/game/gameLevels/${gameLevelId}/stages/${stageId}`),

  updateStageOrder: (gameLevelId: string, stageIds: string[]) =>
    axiosInstance.patch(`/game/gameLevels/${gameLevelId}/stages/order`, {
      stageIds: stageIds ?? [],
    }),

  getLessonTypes: () => axiosInstance.get(`/game/lessons/type`),
  getAllLessons: (stageId: string) =>
    axiosInstance.get(`/game/lessons/${stageId}`),
  addLesson: (
    stageId: string,
    lessonName: string,
    lessonTypeId: string,
    lessonReward: number,
    lessonQuestions: LessonQuestion[]
  ) =>
    axiosInstance.post(`/game/lessons/${stageId}`, {
      lessonName,
      lessonTypeId,
      lessonReward,
      questions: lessonQuestions.map((lessonQuestion) => ({
        questionId: lessonQuestion.question_id,
        questionCount: lessonQuestion.question_count,
      })),
    }),
  updateLesson: (
    lessonId: string,
    lessonName: string,
    lessonTypeId: string,
    lessonReward: number,
    lessonQuestions: LessonQuestion[]
  ) =>
    axiosInstance.patch(`/game/lessons/${lessonId}`, {
      lessonName,
      lessonTypeId,
      lessonReward,
      questions: lessonQuestions.map((lessonQuestion) => ({
        questionId: lessonQuestion.question_id,
        questionCount: lessonQuestion.question_count,
      })),
    }),
  deleteLesson: (lessonId: string) =>
    axiosInstance.delete(`/game/lessons/${lessonId}`),
  updateLessonOrder: (stageId: string, lessonIds: string[]) =>
    axiosInstance.patch(`/game/lessons/${stageId}/order`, { lessonIds }),
  getAllQuestions: () => axiosInstance.get("/game/questions"),
};
