import { Test, TestingModule } from '@nestjs/testing'
import { TransactionProcessorService } from './transaction-processor.service'
import { AvalancheService } from '../avalanche/avalanche.service'

describe('TransactionProcessorService', () => {
  let service: TransactionProcessorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionProcessorService, AvalancheService],
    }).compile()

    service = module.get<TransactionProcessorService>(
      TransactionProcessorService,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
