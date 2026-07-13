import { Torneio } from 'src/modules/torneios/entities/torneio.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PartidaJogador } from './partida-jogador.entity';

@Entity('partidas')
export class Partidas {
  @PrimaryGeneratedColumn({ name: 'id_partida' })
  idPartida: number;

  @ManyToOne(() => Torneio, (torneio) => torneio.partidas)
  @JoinColumn([{ name: 'id_torneio', referencedColumnName: 'idTorneio' }])
  torneio: Torneio;

  @Column('date', { name: 'data_partida' })
  dataPartida: Date;

  @OneToMany(() => PartidaJogador, (partidaJogador) => partidaJogador.partida)
  jogadores: PartidaJogador[];
}
