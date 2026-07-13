import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OcrPlayerResultDto } from 'src/ocr/dto/ocr-read-response.dto';
import { DataSource, Repository } from 'typeorm';
import { PartidaJogadorScore } from '../partidas/entities/partida-jogador-score.entity';
import { PartidaJogador } from '../partidas/entities/partida-jogador.entity';
import { Partidas } from '../partidas/entities/partidas.entity';
import { CriarTorneioDto } from './dto/criar-torneio.dto';
import { Torneio } from './entities/torneio.entity';

@Injectable()
export class TorneiosService {
  constructor(
    @InjectRepository(Torneio)
    private torneioRepository: Repository<Torneio>,
    private readonly dataSource: DataSource,
  ) {}

  async criarTorneio(dto: CriarTorneioDto): Promise<Torneio[]> {
    const novoTorneio = this.torneioRepository.create(dto);
    await this.torneioRepository.save(novoTorneio);
    return await this.torneioRepository.find();
  }

  async buscarTorneios(): Promise<Torneio[]> {
    return await this.torneioRepository.find();
  }

  async lancarPartida(
    idTorneio: number,
    payload: OcrPlayerResultDto[],
  ): Promise<void> {
    const torneio = await this.torneioRepository.findOne({
      where: { idTorneio },
    });

    if (!torneio) {
      throw new NotFoundException('Torneio não encontrado.');
    }

    if (!payload.length) {
      throw new BadRequestException(
        'Nenhum jogador foi informado para a partida.',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const partida = manager.create(Partidas, {
        torneio: { idTorneio: idTorneio },
      });

      const partidaSalva = await manager.save(Partidas, partida);

      for (const player of payload) {
        if (!player.scores?.length) {
          throw new BadRequestException(
            `Nenhum placar foi informado para o jogador ${player.playerName}.`,
          );
        }

        if (player.scores.length !== 6) {
          throw new BadRequestException(
            `O jogador ${player.playerName} deve possuir exatamente 6 jogos.`,
          );
        }

        const possuiJogoInvalido = player.scores.some(
          (score) =>
            score.game < 1 ||
            score.game > 6 ||
            score.value < 0 ||
            score.value > 300,
        );

        if (possuiJogoInvalido) {
          throw new BadRequestException(
            `O jogador ${player.playerId} possui um score inválido.`,
          );
        }

        const total = player.scores.reduce(
          (acumulado, score) => acumulado + score.value,
          0,
        );

        const partidaJogador = manager.create(PartidaJogador, {
          idPartida: partidaSalva.idPartida,
          idJogador: player.playerId,
          total,
        });

        const partidaJogadorSalvo = await manager.save(
          PartidaJogador,
          partidaJogador,
        );

        const scores = player.scores.map((score) =>
          manager.create(PartidaJogadorScore, {
            idPartidaJogador: partidaJogadorSalvo.idPartidaJogador,
            numeroJogo: score.game,
            valor: score.value,
          }),
        );

        await manager.save(PartidaJogadorScore, scores);
      }
    });
  }
}
