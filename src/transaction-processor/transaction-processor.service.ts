import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Transaction } from './transaction.entity'
import { AvalancheService } from '../avalanche/avalanche.service'
import { ethers } from 'ethers'

@Injectable()
export class TransactionProcessorService {
  constructor(
    private readonly avalancheService: AvalancheService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // Method to fetch and process transfer data, and save it to DB
  async processTransfers(fromBlock: number, toBlock: number) {
    const transfers = await this.avalancheService.getUSDCTransfers(
      fromBlock,
      toBlock,
    )
    const aggregatedData = this.aggregateData(transfers)
    return aggregatedData
  }

  // Method to aggregate data from the transfer events
  private aggregateData(transfers: any[]) {
    return transfers.map((transfer) => {
      console.log(transfer)
      return {
        transactionHash: transfer.transactionHash,
        from: transfer.from,
        to: transfer.to,
        value: parseFloat(ethers.formatUnits(transfer.value, 6)),
        timestamp: transfer.timestamp,
      }
    })
  }

  // Method to get total transferred USDC amount between start and end timestamps
  async getTotalTransferred(start: number = 0, end: number = 2639688470) {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where(
        'transaction.timestamp >= :start AND transaction.timestamp <= :end',
        { start, end },
      )
      // .groupBy('transaction.transactionHash')

      // .andWhere(
      //   'transaction.fromAddress = (SELECT fromAddress FROM transactions WHERE transactionHash = transaction.transactionHash LIMIT 1)',
      // )
      .getRawOne()

    return parseFloat(result.total)
  }

  // Method to get top limit accounts between start and end timestamps
  async getTopAccountsByVolume(start: number, end: number, limit: number = 10) {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.fromAddress', 'account')
      .addSelect('SUM(transaction.amount)', 'volume')
      .where(
        'transaction.timestamp >= :start AND transaction.timestamp <= :end',
        { start, end },
      )
      // .andWhere(
      //   'transaction.fromAddress = (SELECT transaction.fromAddress FROM transaction WHERE transaction.transactionHash = transaction.transactionHash LIMIT 1)',
      // )
      .groupBy('transaction.fromAddress')
      .orderBy('volume', 'DESC')
      .limit(limit)
      .getRawMany()

    return result.map((row) => ({
      account: row.account,
      volume: parseFloat(row.volume),
    }))
  }

  // Method to get total amount for each month in a specific year
  async getMonthlyTotal(year: number) {
    const timestamps = this.getUnixTimestampsForMonths(year)
    const monthlyTotal = await Promise.all(
      timestamps
        .map(async (t, i) => {
          if (i >= 12) return 0
          return {
            month: i + 1,
            amount: await this.getTotalTransferred(t, timestamps[i + 1] - 1),
          }
        })
        .filter((_t, i) => i < 12),
    )
    return monthlyTotal
  }

  getUnixTimestampsForMonths(year: number) {
    let timestamps: number[] = []

    for (let month = 0; month < 12; month++) {
      // Create a date for the first day of the month at 00:00:00
      const date = new Date(year, month, 1, 0, 0, 0, 0)

      // Push the Unix timestamp (in seconds) into the array
      timestamps.push(Math.floor(date.getTime() / 1000))
    }
    const date = new Date(Number(year) + 1, 0, 1, 0, 0, 0, 0)
    timestamps.push(Math.floor(date.getTime() / 1000))
    // console.log(timestamps)
    return timestamps
  }
}
