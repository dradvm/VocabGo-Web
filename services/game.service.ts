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
  getStages: (gameLevelId: string) =>
    axiosInstance.get(`/game/gameLevels/${gameLevelId}/stages`),
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

  deleteStage: (gameLevelId: string, stageId: string) =>
    axiosInstance.delete(`/game/gameLevels/${gameLevelId}/stages/${stageId}`),

  updateStageOrder: (gameLevelId: string, stageIds: string[]) =>
    axiosInstance.patch(`/game/gameLevels/${gameLevelId}/stages/order`, {
      stageIds: stageIds ?? [],
    }),
};
