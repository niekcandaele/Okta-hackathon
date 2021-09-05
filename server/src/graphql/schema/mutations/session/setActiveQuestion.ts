import { UserInputError } from 'apollo-server';
import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

import { IContext } from '../../..';
import { Question } from '../../../../orm/entity/Question';
import { Session } from '../../../../orm/entity/Session';
import { sessionType } from '../../types/session';

const setActiveQuestionInput = new GraphQLInputObjectType({
  name: 'setActiveQuestionInput',
  fields: () => ({
    sessionId: { type: new GraphQLNonNull(GraphQLString) },
    questionId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const setActiveQuestionMutation = {
  type: sessionType,
  args: {
    input: {
      type: new GraphQLNonNull(setActiveQuestionInput),
    },
  },
  resolve: async (
    parent: Record<string, never>,
    args: {
      input: {
        sessionId: string;
        questionId: string;
      };
    },
    context: IContext
  ) => {
    const session = await Session.findOne(args.input.sessionId);
    if (!session) throw new UserInputError('Invalid session ID');

    const question = session.questions.find(
      (_: Question) => _.id === args.input.questionId
    );
    if (!question) throw new UserInputError('Invalid question id');

    const newSession = await session.setActiveQuestion(question);
    return newSession;
  },
};
