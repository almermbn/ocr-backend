import { IsEnum, IsInt, IsString, Min } from 'class-validator';

export enum PlayerLetter {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
}

export class PlayerBindingDto {
  @IsEnum(PlayerLetter)
  letter!: PlayerLetter;

  @IsInt()
  @Min(1)
  playerId!: number;

  @IsString()
  playerName!: string;
}
