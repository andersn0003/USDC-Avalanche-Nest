import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { InjectRepository } from '@nestjs/typeorm'
import { Transaction } from '../transaction-processor/transaction.entity'
import { Repository } from 'typeorm'
import { BlockInfo } from './block-info.entity'

@Injectable()
export class AvalancheService {
  private provider: ethers.JsonRpcProvider
  private contract: ethers.Contract
  private filter: ethers.DeferredTopicFilter
  private USDC_ADDRESS: string
  constructor(
    private configService: ConfigService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(BlockInfo)
    private blockInfoRepository: Repository<BlockInfo>,
  ) {
    const rpcUrl =
      this.configService.get<string>('AVALANCHE_RPC_URL') ||
      'https://api.avax.network/ext/bc/C/rpc'
    this.provider = new ethers.JsonRpcProvider(rpcUrl)

    this.USDC_ADDRESS =
      this.configService.get<string>('USDC_CONTRACT_ADDRESS') ||
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
    const USDC_ABI = [
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]

    this.contract = new ethers.Contract(
      this.USDC_ADDRESS,
      USDC_ABI,
      this.provider,
    )
    this.filter = this.contract.filters.Transfer(null, null)

    setTimeout(async () => {
      await this.saveUSDCTransfersInChunks()
    }, 0)
  }

  // async onApplicationBootstrap() {
  //   console.log('Application has started. Initiating USDC transfer saving...')
  //   // await this.saveUSDCTransfersInChunks()
  //   setTimeout(async () => {
  //     await this.saveUSDCTransfersInChunks()
  //   }, 0)
  // }

  // Method to get the latest block number
  async getLatestBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber()
  }

  async saveUSDCTransfersInChunks() {
    // Get the latest block number from the RPC node
    let latestBlock = await this.getLatestBlockNumber()
    // const latestBlock = 18431999

    // Get the last saved block number from the database (if exists)
    const blockInfo = await this.blockInfoRepository.findOne({
      where: {},
      order: { lastBlockNumber: 'DESC' },
    })
    const lastQueriedBlock = blockInfo ? blockInfo.lastBlockNumber + 1 : 0

    // Query in chunks of 2048 blocks, starting from the last queried block
    let currentBlock = lastQueriedBlock
    const chunkSize = 2048
    console.log('Latest block number: ', latestBlock)
    while (currentBlock < latestBlock) {
      const endBlock = Math.min(currentBlock + chunkSize - 1, latestBlock)

      // Fetch the transfers for the block range (currentBlock to endBlock)
      const transfers = await this.getUSDCTransfers(currentBlock, endBlock)
      if (transfers.length > 0) {
        // Save the transfers to the database
        await this.saveTransfersToDatabase(transfers)
      }

      // Update the last queried block number in the database
      await this.updateLastQueriedBlock(endBlock)

      // Move to the next chunk
      currentBlock = endBlock + 1
      latestBlock = await this.getLatestBlockNumber()
    }
  }

  // Method to get USDC transfers for a specific block
  async getUSDCTransfers(fromBlock: number, toBlock: number) {
    try {
      const logs = await this.provider.getLogs({
        // ...filter,
        fromBlock: fromBlock,
        toBlock: toBlock,
        address: this.USDC_ADDRESS,
        topics: await this.filter.getTopicFilter(),
      })
      // console.log(filter)

      // Retrieve block timestamp and process the transfers
      const transfers = await Promise.all(
        logs.map(async (log) => {
          const parsedLog = this.contract.interface.parseLog(log)
          // console.log('parse log: ', log, parsedLog)
          if (!parsedLog) return null
          const block = await this.provider.getBlock(log.blockNumber)

          return {
            transactionHash: log.transactionHash,
            from: parsedLog?.args.from,
            to: parsedLog?.args.to,
            value: parsedLog?.args.value,
            timestamp: block?.timestamp,
          }
        }),
      )
      return transfers.filter((log) => log !== null)
    } catch (e) {
      const size = toBlock - fromBlock + 1
      const half = Math.floor(size / 2)
      // if (size < 2) {
      //   return []
      // }
      const transfers1 = await this.getUSDCTransfers(
        fromBlock,
        fromBlock + half - 1,
      )
      const transfers2 = await this.getUSDCTransfers(
        fromBlock + half,
        fromBlock + size - 1,
      )
      return [...transfers1, ...transfers2]
    }

    // console.log(transfers)
  }

  async saveTransfersToDatabase(transfers: any[]) {
    const transactions = transfers.map((transfer) => {
      return this.transactionRepository.create({
        transactionHash: transfer.transactionHash,
        fromAddress: transfer.from,
        toAddress: transfer.to,
        amount: parseFloat(ethers.formatUnits(transfer.value, 6)),
        timestamp: transfer.timestamp,
      })
    })

    await this.transactionRepository.save(transactions)
  }

  // Update the last queried block number in the database
  async updateLastQueriedBlock(blockNumber: number) {
    let blockInfo = await this.blockInfoRepository.findOne({
      where: {},
      order: { lastBlockNumber: 'DESC' },
    })
    if (!blockInfo) {
      blockInfo = this.blockInfoRepository.create({
        lastBlockNumber: blockNumber,
      })
    } else {
      blockInfo.lastBlockNumber = blockNumber
    }
    await this.blockInfoRepository.save(blockInfo)
  }
}
