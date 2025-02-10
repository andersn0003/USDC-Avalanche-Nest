import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TransactionProcessorService } from './transaction-processor/transaction-processor.service'
import { Transaction } from './transaction-processor/transaction.entity'
import { BlockInfo } from './avalanche/block-info.entity'
import { AvalancheService } from './avalanche/avalanche.service'
import { AvalancheController } from './avalanche/avalanche.controller'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5433,
      username: 'postgres',
      password: '123123',
      database: 'usdc_aggregator',
      entities: [Transaction, BlockInfo],
      synchronize: true,
      // ssl: {
      //   rejectUnauthorized: false,
      // },
    }),
    TypeOrmModule.forFeature([Transaction, BlockInfo]),
  ],
  controllers: [AppController, AvalancheController],
  providers: [AppService, TransactionProcessorService, AvalancheService],
})
export class AppModule {}
