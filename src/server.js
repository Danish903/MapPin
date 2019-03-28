import "@babel/polyfill/noConflict";
import { ApolloServer } from "apollo-server";
import mongoose from "mongoose";

import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { findOrCreateUser } from "./controllers/UserController";

mongoose.set("useFindAndModify", false);

mongoose
   .connect(process.env.MONGO_URI, { useNewUrlParser: true })
   .then(() => console.log("DB connected"))
   .catch(error => console.log("error"));

const server = new ApolloServer({
   typeDefs,
   resolvers,
   context: async ({ req, connection }) => {
      let authToken = null;
      let currentUser = null;
      if (connection) {
         return {
            ...connection.context
         };
      }

      try {
         authToken = req.headers.authorization;

         if (authToken) {
            currentUser = await findOrCreateUser(authToken);
         }
      } catch (error) {
         console.error(
            `Unable to authenticate user with the token ${authToken} `
         );
      }
      return { currentUser };
   }
});

server
   .listen({ port: process.env.PORT || 4000 })
   .then(({ url, subscriptionsUrl }) => {
      console.log(`🚀  Server ready at ${url}`);
      console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
   });
