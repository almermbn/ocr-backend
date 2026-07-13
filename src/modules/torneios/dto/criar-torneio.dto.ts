import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class CriarTorneioDto {
  @IsString()
  nome: string;

  @IsDateString()
  dataInicio: string;

  @IsDateString()
  dataFim: string;

  @IsNumber()
  @Min(0)
  precoInscricao: number;

  @IsDateString()
  dataLimiteInscricao: string;
}
