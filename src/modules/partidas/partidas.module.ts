import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jogadores } from '../jogadores/entities/jogadores.entity';
import { PartidaJogadorScore } from './entities/partida-jogador-score.entity';
import { PartidaJogador } from './entities/partida-jogador.entity';
import { Partidas } from './entities/partidas.entity';
import { PartidasController } from './partidas.controller';
import { PartidasService } from './partidas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partidas,
      PartidaJogador,
      PartidaJogadorScore,
      Jogadores,
      Partidas,
    ]),
  ],
  controllers: [PartidasController],
  providers: [PartidasService],
})
export class PartidasModule {}
