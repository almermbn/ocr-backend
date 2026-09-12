import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('modalidade_torneio')
export class ModalidadeTorneio {
  @PrimaryGeneratedColumn({ name: 'id_modalidade_torneio' })
  idModalidadeTorneio: number;

  @Column('varchar', { name: 'modalidade', unique: true })
  modalidade: string;
}
