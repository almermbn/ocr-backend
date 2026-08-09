import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partidas } from './entities/partidas.entity';

@Injectable()
export class PartidasService {
  constructor(
    @InjectRepository(Partidas)
    private readonly partidasRepository: Repository<Partidas>,
  ) {}

  async listarPartidasTorneio(idTorneio: number): Promise<Partidas[]> {
    return await this.partidasRepository.find({
      where: { torneio: { idTorneio } },
      order: { idPartida: 'ASC' },
      relations: {
        jogadores: {
          jogador: true,
          scores: true,
        },
      },
    });
  }
}
