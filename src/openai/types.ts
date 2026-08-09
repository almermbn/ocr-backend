import { Jogadores } from 'src/modules/jogadores/entities/jogadores.entity';

export type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export interface LoginRespostaDto {
  token: string;
  usuario: Jogadores;
}
