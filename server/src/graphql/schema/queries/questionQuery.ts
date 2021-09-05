import { UserInputError } from 'apollo-server';
import { GraphQLNonNull, GraphQLString } from 'graphql';

import { IContext } from '../..';
import { Person } from '../../../orm/entity/Person';
import { Session } from '../../../orm/entity/Session';
import { questionType } from '../types/session';

export const questionQuery = {
  type: questionType,
  args: {
    questionId: { type: new GraphQLNonNull(GraphQLString) },
    sessionId: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    parent: Record<string, never>,
    args: { questionId: string; sessionId: string },
    context: IContext
  ) => {
    const session = await Session.findOne(args.sessionId);
    if (!session) throw new UserInputError('Invalid session ID');

    const question = session.questions.find((q) => q.id === args.questionId);

    if (!question) throw new UserInputError('Invalid question ID');

    return question;
  },
};
