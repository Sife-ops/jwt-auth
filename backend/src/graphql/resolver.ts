import * as t from "../utility/token";
import argon2 from "argon2";
import { AuthContext } from "./auth";
import { Car } from "../entity/car";
import { User } from "../entity/user";

export const resolvers = {
  Query: {
    // todo: delete
    authTest: (_: any, __: any, context: AuthContext) => {
      console.log("authTest");
      console.log(context.payload);
      return `Hello "world"!`;
    },

    cars: async (): Promise<Car[]> => {
      return await Car.find({ relations: ["user"] });
    },

    // todo: delete
    hello: () => "hello",

    user: async (_: any, __: any, context: AuthContext): Promise<User> => {
      return await User.findOneOrFail(context.payload!.id);
    },

    // todo: delete
    users: async (): Promise<User[]> => {
      return await User.find({ relations: ["cars"] });
    },
  },

  Mutation: {
    login: async (
      _: any,
      { email, password, remember }: LoginInput,
      { res }: AuthContext
    ): Promise<User> => {
      if (!email || !password || remember === undefined) {
        throw new Error("invalid arguments");
      }

      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("user not found");

      const verified = await argon2.verify(user.password, password);
      if (!verified) throw new Error("wrong password");

      t.sendRefreshToken(res, { id: user.id, remember });

      return user;
    },

    register: async (
      _: any,
      { email, username, password }: RegisterInput
    ): Promise<{ email: string; username: string }> => {
      if (!email || !username || !password) {
        throw new Error("invalid arguments");
      }

      const hashed = await argon2.hash(password);

      const user = await User.create({
        email,
        username,
        password: hashed,
      }).save();

      return { email: user.email, username: user.username };
    },

    userExists: async (
      _: any,
      { email, username }: UserExistsInput
    ): Promise<boolean> => {
      if (!email && !username) throw new Error("invalid arguments");

      const user = await User.findOne({
        where: email ? { email } : { username },
      });

      if (!user) return false;

      return true;
    },
  },
};

interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface UserExistsInput {
  email?: string;
  username?: string;
}
