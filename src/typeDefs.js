import { gql } from "apollo-server";

const typeDefs = gql`
   type User {
      _id: ID!
      name: String
      email: String
      picture: String
   }

   type Pin {
      _id: ID!
      createdAt: String
      title: String
      content: String
      image: String
      latitude: Float
      longitude: Float
      author: User
      comments: [Comment]
   }
   input CreatePinInput {
      title: String
      image: String
      content: String
      latitude: Float
      longitude: Float
   }
   type Comment {
      text: String
      createdAt: String
      author: User
   }
   type Query {
      me: User!
      getPins: [Pin!]!
   }
   type Mutation {
      createPin(input: CreatePinInput!): Pin
      deletePin(pinId: ID!): Pin
      createComment(pinId: ID!, text: String!): Pin
   }

   type Subscription {
      pinAdded: Pin
      pinDeleted: Pin
      pinUpdated: Pin
   }
`;

export { typeDefs };
