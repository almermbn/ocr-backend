import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OcrPlayerResultDto } from 'src/ocr/dto/ocr-read-response.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UsuarioPayload } from '../auth/dto/usuario-payload.dto';
import { ParticipantesTorneio } from '../participantes-torneio/entities/participantes-torneio.entity';
import { PartidaJogadorScore } from '../partidas/entities/partida-jogador-score.entity';
import { PartidaJogador } from '../partidas/entities/partida-jogador.entity';
import { Partidas } from '../partidas/entities/partidas.entity';
import { CriarTorneioDto } from './dto/criar-torneio.dto';
import { ModalidadeTorneio } from './entities/modalidade-torneio.entity';
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
    novoTorneio.modalidade = {
      idModalidadeTorneio: dto.idModalidadeTorneio,
    } as ModalidadeTorneio;
    await this.torneioRepository.save(novoTorneio);
    return await this.torneioRepository.find();
  }

  async buscarTorneios(): Promise<Torneio[]> {
    return await this.torneioRepository.find({
      relations: {
        participantes: { jogador: true },
        modalidade: true,
      },
    });
  }

  async lancarPartida(
    idTorneio: number,
    numeroRodada: number,
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
        dataPartida: new Date(),
      });

      const partidaSalva = await manager.save(Partidas, partida);

      await this.validarJogadoresJaLancados(
        manager,
        idTorneio,
        numeroRodada,
        payload,
      );

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
          numeroRodada: numeroRodada,
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

  private async validarJogadoresJaLancados(
    manager: EntityManager,
    idTorneio: number,
    numeroRodada: number,
    payload: OcrPlayerResultDto[],
  ): Promise<void> {
    const idsJogadores = payload.map((player) => player.playerId);

    const registrosExistentes = await manager
      .getRepository(PartidaJogador)
      .createQueryBuilder('pj')
      .innerJoin('pj.partida', 'partida')
      .where('partida.id_torneio = :idTorneio', { idTorneio })
      .andWhere('pj.numero_rodada = :numeroRodada', { numeroRodada })
      .andWhere('pj.id_jogador IN (:...idsJogadores)', { idsJogadores })
      .getMany();

    if (!registrosExistentes.length) return;

    console.log('Registros existentes encontrados:', registrosExistentes);

    const idsExistentes = new Set(
      registrosExistentes.map((registro) => registro.idJogador),
    );

    const jogadoresDuplicados = payload
      .filter((player) => idsExistentes.has(player.playerId))
      .map((player) => player.playerName);

    throw new BadRequestException(
      `Os seguintes jogadores já possuem resultados lançados na rodada ${numeroRodada}: ${jogadoresDuplicados.join(', ')}.`,
    );
  }

  async removerSorteio(id: number): Promise<void> {
    const torneio = await this.torneioRepository.findOne({
      where: { idTorneio: id },
    });

    if (!torneio) {
      throw new NotFoundException('Torneio não encontrado.');
    }

    await this.torneioRepository.remove(torneio);
  }

  async inscreverJogador(
    idTorneio: number,
    jogador: UsuarioPayload,
    idsJogadores?: number[],
  ): Promise<void> {
    const torneio = await this.torneioRepository.findOne({
      where: { idTorneio },
      relations: { modalidade: true },
    });

    if (!torneio || !jogador) {
      throw new NotFoundException('Torneio ou jogador não encontrado.');
    }

    // Quantidade esperada de jogadores por modalidade
    const jogadoresPorModalidade: Record<string, number> = {
      INDIVIDUAL: 1,
      DUPLAS: 2,
      TERCETOS: 3,
      EQUIPES: 4,
    };

    const modalidade = torneio.modalidade?.modalidade?.toUpperCase() ?? '';
    const quantidadeEsperada = jogadoresPorModalidade[modalidade] ?? 1;

    // Se não vier lista (fluxo individual), usa o próprio usuário logado
    const jogadores =
      idsJogadores && idsJogadores.length > 0
        ? idsJogadores
        : [jogador.idJogador];

    if (jogadores.length !== quantidadeEsperada) {
      throw new BadRequestException(
        `A modalidade ${torneio.modalidade?.modalidade ?? 'INDIVIDUAL'} exige exatamente ${quantidadeEsperada} jogador(es).`,
      );
    }

    const idsUnicos = new Set(jogadores);
    if (idsUnicos.size !== jogadores.length) {
      throw new BadRequestException(
        'Não é possível inscrever o mesmo jogador mais de uma vez.',
      );
    }

    // Verificar se algum jogador já está inscrito
    const jaInscritos = await this.dataSource.manager.find(
      ParticipantesTorneio,
      {
        where: jogadores.map((idJogador) => ({
          torneio: { idTorneio },
          jogador: { idJogador },
        })),
        relations: { jogador: true },
      },
    );

    if (jaInscritos.length > 0) {
      const nomes = jaInscritos
        .map((participante) => participante.jogador?.nome)
        .filter(Boolean)
        .join(', ');
      throw new BadRequestException(
        `Jogador(es) já inscrito(s) no torneio: ${nomes}.`,
      );
    }

    // Inscrever todos os jogadores em uma transação
    await this.dataSource.transaction(async (manager) => {
      const participantes = jogadores.map((idJogador) =>
        manager.create(ParticipantesTorneio, {
          torneio: { idTorneio },
          jogador: { idJogador },
        }),
      );
      await manager.save(ParticipantesTorneio, participantes);
    });
  }
}
