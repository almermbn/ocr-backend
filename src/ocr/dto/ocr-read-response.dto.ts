export class OcrScoreDto {
  game!: number;
  value!: number;
  candidates!: number[];
  needsReview!: boolean;
  reason!: string;
}

export class OcrPlayerResultDto {
  letter!: string;
  playerId!: number;
  playerName!: string;
  scores!: OcrScoreDto[];
  total!: number;
}

export class OcrReadResponseDto {
  players!: OcrPlayerResultDto[];
}
