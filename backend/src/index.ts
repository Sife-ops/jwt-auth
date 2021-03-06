import 'reflect-metadata';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { Bookmark } from './entity/bookmark';
import { Category } from './entity/category';
import { User } from './entity/user';
import { applyMiddleware } from 'graphql-middleware';
import { auth } from './graphql/auth';
import { createConnection } from 'typeorm';
import { env } from './utility/constant';
import { login, logout } from './rest/login';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { refresh } from './rest/refresh';
import { register } from './rest/register';
import { resolvers } from './graphql/resolver';
import { seed } from './utility/mock';
import { typeDefs } from './graphql/typedef';

(async () => {
  console.log(env);

  // database
  try {
    await createConnection({
      type: 'sqlite',
      database: './database/db.sqlite3',
      dropSchema: env.seed,
      entities: [User, Bookmark, Category],
      synchronize: true,
      logging: false,
    });
  } catch (e) {
    console.log(e);
    throw new Error("couldn't connect to database");
  }

  if (env.seed) await seed();

  // rest
  const app = express();

  const origin = (): string[] => {
    const nonprod = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://studio.apollographql.com',
    ];
    if (env.prod_url) return [env.prod_url];
    if (env.ngrok_url) return nonprod.concat(env.ngrok_url);
    return nonprod;
  };

  app.use(cors({ origin: origin(), credentials: true }));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(login);
  app.use(logout);
  app.use(refresh);
  app.use(register);

  // grpahql
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const schemaWithMiddleware = applyMiddleware(schema, auth);

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context: ({ req, res }) => ({ req, res }),
  });

  // start
  await server.start();

  server.applyMiddleware({ app, cors: false });

  const port = (): number => {
    if (env.prod_url || env.ngrok_url) return 80;
    return 4000;
  };

  app.listen(port(), () => {
    console.log(`port: ${port()}`);
    console.log(`origins: ${origin()}`);
  });
})();
