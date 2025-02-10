import { Test, TestingModule } from '@nestjs/testing';
import { AvalancheController } from './avalanche.controller';

describe('AvalancheController', () => {
  let controller: AvalancheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvalancheController],
    }).compile();

    controller = module.get<AvalancheController>(AvalancheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
