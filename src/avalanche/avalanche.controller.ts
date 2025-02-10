import { Controller, Get, Query } from '@nestjs/common'
import { TransactionProcessorService } from '../transaction-processor/transaction-processor.service'

import { IsInt, Min } from 'class-validator'

class GetTopAccountsQuery {
  @IsInt()
  @Min(1)
  limit: number
}
@Controller('avalanche')
export class AvalancheController {
  constructor(
    private readonly transactionProcessorService: TransactionProcessorService,
  ) {}

  @Get('usdc-transfers')
  async getUSDCTransfers(
    @Query('fromBlock') fromBlock: string,
    @Query('toBlock') toBlock: string,
  ) {
    // console.log(fromBlock, ' aaa ', toBlock)
    try {
      if (!fromBlock || !toBlock) {
        throw new Error('Both fromBlock and toBlock are required')
      }
      return await this.transactionProcessorService.processTransfers(
        Number(fromBlock),
        Number(toBlock),
      )
    } catch (error) {
      return { error: error.message }
    }
  }

  @Get('total-usdc-transferred')
  async getTotalTransferred(
    @Query('start') start: number,
    @Query('end') end: number,
  ) {
    try {
      return {
        total: await this.transactionProcessorService.getTotalTransferred(
          start,
          end,
        ),
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  @Get('top-accounts')
  async getTopAccounts(
    @Query('start') start: number,
    @Query('end') end: number,
    @Query('limit') limit: number,
  ) {
    try {
      if (limit <= 0) {
        throw new Error('Limit must be a positive number')
      }
      return {
        topAccounts:
          await this.transactionProcessorService.getTopAccountsByVolume(
            start,
            end,
            limit,
          ),
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  @Get('get-monthly-total')
  async getMonthlyTotal(@Query('year') year: number) {
    if (year <= 1970) {
      throw new Error('Input valid year')
    }
    try {
      return {
        total: await this.transactionProcessorService.getMonthlyTotal(year),
      }
    } catch (error) {
      return { error: error.message }
    }
  }
}
