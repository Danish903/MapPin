import { AuthenticationError, PubSub } from "apollo-server";
import Pin from "./models/Pin";

const pubsub = new PubSub();
const PIN_ADDED = "PIN_ADDED";
const PIN_DELETED = "PIN_DELETED";
const PIN_UPDATED = "PIN_UPDATED";
const authenticated = next => (_, args, ctx, info) => {
   if (!ctx.currentUser) {
      throw new AuthenticationError("You must be logged in");
   }
   return next(_, args, ctx, info);
};

const resolvers = {
   Query: {
      me: authenticated((_, args, ctx) => ctx.currentUser),
      getPins: async (root, args, ctx, info) => {
         return Pin.find({})
            .populate("author")
            .populate("comments.author");
      }
   },
   Mutation: {
      createPin: authenticated(async (_, { input }, ctx, info) => {
         const newPin = await new Pin({
            ...input,
            author: ctx.currentUser._id
         }).save();

         const pinAdded = await Pin.populate(newPin, "author");

         console.log("Pin added: ", pinAdded);

         pubsub.publish(PIN_ADDED, { pinAdded });
         return pinAdded;
      }),
      deletePin: authenticated(async (_, { pinId }, ctx, info) => {
         const pin = await Pin.findById({ _id: pinId }).populate("author");

         if (!ctx.currentUser._id.equals(pin.author._id)) {
            throw new AuthenticationError("You can't delete this pin");
         }
         const deletedPin = await Pin.findByIdAndDelete({ _id: pinId }).exec();

         pubsub.publish(PIN_DELETED, { pinDeleted: deletedPin });
         return deletedPin;
      }),
      createComment: authenticated(async (_, { pinId, text }, ctx, info) => {
         const userId = ctx.currentUser._id;
         const newComment = { text, author: userId };

         const pinUpdated = await Pin.findByIdAndUpdate(
            { _id: pinId },
            { $push: { comments: newComment } },
            { new: true }
         )
            .populate("author")
            .populate("comments.author");
         pubsub.publish(PIN_UPDATED, { pinUpdated });
         return pinUpdated;
      })
   },
   Subscription: {
      pinAdded: {
         // Additional event labels can be passed to asyncIterator creation
         subscribe: () => {
            return pubsub.asyncIterator(PIN_ADDED);
         }
      },

      pinDeleted: {
         subscribe: () => pubsub.asyncIterator(PIN_DELETED)
      },
      pinUpdated: {
         subscribe: () => pubsub.asyncIterator(PIN_UPDATED)
      }
   }
};

export { resolvers };
