import { OAuth2Client } from "google-auth-library";
import User from "../models/User";

const client = new OAuth2Client(process.env.O_AUTH_CLIENT_ID);

export const findOrCreateUser = async token => {
   const googleUser = await verifyAuthToken(token);
   const user = await checkIfUserExists(googleUser.email);
   return user ? user : createNewUser(googleUser);
};

const verifyAuthToken = async token => {
   try {
      const ticket = await client.verifyIdToken({
         idToken: token,
         audience: process.env.O_AUTH_CLIENT_ID
      });
      return ticket.getPayload();
   } catch (error) {
      console.error("Error verifying auth token");
   }
};

const checkIfUserExists = async email =>
   await User.findOne({
      email
   }).exec();

const createNewUser = googleUser => {
   const { name, email, picture } = googleUser;
   const user = { name, email, picture };

   return new User(user).save();
};
