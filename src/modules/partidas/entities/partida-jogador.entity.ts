import { Jogadores } from 'src/modules/jogadores/entities/jogadores.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PartidaJogadorScore } from './partida-jogador-score.entity';
import { Partidas } from './partidas.entity';

@Entity({ name: 'partida_jogadores' })
@Unique('uq_partida_jogador', ['idPartida', 'idJogador'])
export class PartidaJogador {
  @PrimaryGeneratedColumn({ name: 'id_partida_jogador', type: 'integer' })
  idPartidaJogador: number;

  @Column({ name: 'id_partida', type: 'integer' })
  idPartida: number;

  @Column({ name: 'id_jogador', type: 'integer' })
  idJogador: number;

  @Column({
    name: 'total',
    type: 'integer',
    default: 0,
  })
  total: number;

  @ManyToOne(() => Partidas, (partida) => partida.jogadores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_partida' })
  partida: Partidas;

  @ManyToOne(() => Jogadores, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_jogador' })
  jogador: Jogadores;

  @OneToMany(() => PartidaJogadorScore, (score) => score.partidaJogador, {
    cascade: true,
  })
  scores: PartidaJogadorScore[];
}
