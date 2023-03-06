import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from 'aws-serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import { Server } from 'http';

let lambdaProxy: Server;

async function bootstrap() {
  const expressServer = express();
  const expressAdapter = new ExpressAdapter(expressServer);
  const nestApp = await NestFactory.create(AppModule, expressAdapter, {
    logger: ['debug', 'error', 'log', 'verbose', 'warn'],
  });
  await nestApp.init();
  return expressServer;
}

export function handler(event: APIGatewayProxyEvent, context: Context) {
  if (!lambdaProxy) {
    bootstrap().then((server) => {
      lambdaProxy = serverlessExpress.createServer(server);
      serverlessExpress.proxy(lambdaProxy, event, context);
    });
  } else {
    serverlessExpress.proxy(lambdaProxy, event, context);
  }
}
