import type { Context } from '../TypeDefinitions';
import { Match, MatchResult } from './MatchTypes';
import MatchModel from './MatchModel';
import { getRating } from '../tournament/helpers/ratingHelper';

type GetMatchArgs = {
  matchId: string
};

type UpdateMatchArgs = {
  matchId: string;
  payload: {
    result: MatchResult
  }
}

const resolvers = {
  // Query
  getMyMatch: async (_: void, args: void, context: Context): Promise<Match | null> => {
    const user = context.user;

    return MatchModel.findOne({
      $and: [{
        completed: false
      }, {
        $or: [
          { white: user._id },
          { black: user._id }
        ]
      }]
    });
  },

  getMatch: async (_: void, { matchId }: GetMatchArgs): Promise<Match | null> => {
    return MatchModel.findOne({ _id: matchId });
  },

  // Mutation
  updateMatch: async (_: void, { matchId, payload }: UpdateMatchArgs): Promise<boolean> => {
    const match = await MatchModel.findOne({ _id: matchId });

    if (!match) {
      throw new Error('Match not found!');
    }

    if (payload.result !== MatchResult.didNotStart) {
      const newWhiteRating = getRating(match.whiteRating, match.blackRating, payload.result, match.whiteMatchesPlayed, true);
      const newBlackRating = getRating(match.blackRating, match.whiteRating, payload.result, match.blackMatchesPlayed, false);

      await MatchModel.updateOne({ _id: matchId }, { ...payload, newWhiteRating, newBlackRating });
    } else {
      await MatchModel.updateOne({ _id: matchId }, {
        $set: { ...payload },
        $unset: { newWhiteRating: '', newBlackRating: '' }
      });
    }

    return true;
  }
};

export default resolvers;
