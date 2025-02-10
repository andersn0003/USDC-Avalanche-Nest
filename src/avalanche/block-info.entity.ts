import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('block_info')
export class BlockInfo {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int', unique: true })
  lastBlockNumber: number
}
