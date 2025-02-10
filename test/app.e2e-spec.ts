import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/avalanche/usdc-transfers?fromBlock=0&toBlock=0')
      .expect(200)
      .expect('[]')
  })
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/avalanche/total-usdc-transferred?start=1639414962&end=1639414962')
      .expect(200)
      .expect('{"total":2}')
  })
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/avalanche/top-accounts?start=0&end=0&limit=1')
      .expect(200)
      .expect('{"topAccounts":[]}')
  })
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/avalanche/get-monthly-total?year=2000')
      .expect(200)
      .expect(
        JSON.stringify({
          total: [
            {
              month: 1,
              amount: null,
            },
            {
              month: 2,
              amount: null,
            },
            {
              month: 3,
              amount: null,
            },
            {
              month: 4,
              amount: null,
            },
            {
              month: 5,
              amount: null,
            },
            {
              month: 6,
              amount: null,
            },
            {
              month: 7,
              amount: null,
            },
            {
              month: 8,
              amount: null,
            },
            {
              month: 9,
              amount: null,
            },
            {
              month: 10,
              amount: null,
            },
            {
              month: 11,
              amount: null,
            },
            {
              month: 12,
              amount: null,
            },
          ],
        }),
      )
  })
})
