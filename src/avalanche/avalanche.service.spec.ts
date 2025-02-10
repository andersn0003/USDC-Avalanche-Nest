import { Test, TestingModule } from '@nestjs/testing'
import { AvalancheService } from './avalanche.service'
import { TransactionProcessorService } from '../transaction-processor/transaction-processor.service'

describe('AvalancheService', () => {
  let service: AvalancheService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvalancheService, TransactionProcessorService],
    }).compile()

    service = module.get<AvalancheService>(AvalancheService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
