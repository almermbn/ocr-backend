import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { PartidaJogador } from './partida-jogador.entity';

@Entity({ name: 'partida_jogador_scores' })
@Unique('uq_partida_jogador_numero_jogo', ['idPartidaJogador', 'numeroJogo'])
@Check('ck_numero_jogo', '"numero_jogo" BETWEEN 1 AND 6')
@Check('ck_valor_score', '"valor" BETWEEN 0 AND 300')
export class PartidaJogadorScore {
  @PrimaryGeneratedColumn({ name: 'id_score', type: 'integer' })
  idScore: number;

  @Column({ name: 'id_partida_jogador', type: 'integer' })
  idPartidaJogador: number;

  @Column({ name: 'numero_jogo', type: 'smallint' })
  numeroJogo: number;

  @Column({ name: 'valor', type: 'smallint' })
  valor: number;

  @ManyToOne(() => PartidaJogador, (partidaJogador) => partidaJogador.scores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_partida_jogador' })
  partidaJogador: PartidaJogador;
}
