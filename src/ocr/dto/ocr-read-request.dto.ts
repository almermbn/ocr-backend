import { IsString } from 'class-validator';

export class OcrReadRequestDto {
  @IsString()
  players!: string;
}
