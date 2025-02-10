import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity('transactions')
@Index('transaction_hash_idx', ['transactionHash']) // Ensure transaction hash is unique
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  transactionHash: string

  @Column({ type: 'varchar', length: 42 })
  fromAddress: string

  @Column({ type: 'varchar', length: 42 })
  toAddress: string

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  amount: number

  @Column({ type: 'bigint' })
  timestamp: number // Store as Unix timestamp (in milliseconds)
}
