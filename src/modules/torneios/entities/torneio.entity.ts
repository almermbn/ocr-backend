import { Partidas } from 'src/modules/partidas/entities/partidas.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('torneios')
export class Torneio {
  @PrimaryGeneratedColumn({ name: 'id_torneio' })
  idTorneio: number;

  @Column('varchar', { name: 'nome' })
  nome: string;

  @Column('timestamptz', { name: 'data_inicio' })
  dataInicio: Date;

  @Column('timestamptz', { name: 'data_fim' })
  dataFim: Date;

  @Column('numeric', { name: 'preco_inscricao' })
  precoInscricao: number;

  @Column('timestamptz', { name: 'data_limite_inscricao' })
  dataLimiteInscricao: Date;

  @OneToMany(() => Partidas, (partida) => partida.torneio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'id_torneio', referencedColumnName: 'idTorneio' }])
  partidas: Partidas[];
}
