import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartidaJogadorScore } from '../partidas/entities/partida-jogador-score.entity';
import { PartidaJogador } from '../partidas/entities/partida-jogador.entity';
import { Partidas } from '../partidas/entities/partidas.entity';
import { ModalidadeTorneio } from './entities/modalidade-torneio.entity';
import { Torneio } from './entities/torneio.entity';
import { TorneiosController } from './torneios.controller';
import { TorneiosService } from './torneios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Torneio,
      Partidas,
      PartidaJogador,
      PartidaJogadorScore,
      ModalidadeTorneio,
    ]),
  ],
  controllers: [TorneiosController],
  providers: [TorneiosService],
})
export class TorneiosModule {}
