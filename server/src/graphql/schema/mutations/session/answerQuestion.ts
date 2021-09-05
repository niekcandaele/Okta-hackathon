import { UserInputError } from 'apollo-server';
import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

import { IContext } from '../../..';
import { Session } from '../../../../orm/entity/Session';
import { answerType } from '../../types/session';

const answerQuestionType = new GraphQLInputObjectType({
  name: 'answerQuestion',
  fields: () => ({
    answer: { type: new GraphQLNonNull(GraphQLInt) },
    questionId: { type: new GraphQLNonNull(GraphQLString) },
    sessionId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const answerQuestion = {
  type: answerType,
  args: {
    input: { type: answerQuestionType },
  },
  resolve: async (
    parent: Record<string, never>,
    args: {
      input: { questionId: string; answer: number; sessionId: string };
    },
    context: IContext
  ) => {
    const session = await Session.findOne(args.input.sessionId);
    if (!session) throw new UserInputError('Invalid session ID');
    const res = await session.answerQuestion(
      args.input.questionId,
      context.user.id,
      args.input.answer
    );
    return res;
  },
};
