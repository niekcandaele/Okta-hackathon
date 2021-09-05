import { UserInputError } from 'apollo-server';
import { GraphQLEnumType, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import { IContext } from '../..';
import { Person } from '../../../orm/entity/Person';
import { Squad } from '../../../orm/entity/Squad';
import { squadType } from '../types/squad';

const getSquadType = new GraphQLInputObjectType({
  name: 'GetSquadInput',
  fields: () => ({
    filter: {
      type: new GraphQLEnumType({
        name: 'SquadFilterType',
        values: {
          MEMBEROF: { value: 'memberof' },
          ALL: { value: 'all' },
        },
      }),
    },
  }),
});

export const squadsQuery = {
  type: new GraphQLList(squadType),
  args: {
    filter: { type: getSquadType },
  },
  resolve: async (
    parent: Record<string, never>,
    args: any,
    context: IContext
  ) => {
    let filterMode = 'memberof';
    if (args && args.filter) {
      filterMode = args.filter.filter;
    }
    let res: Squad[] = [];
    switch (filterMode) {
      case 'memberof':
        const squadsMemberOf = await Promise.all(
          context.user.squads.map((id) => Squad.findOne(id))
        );
        for (const squad of squadsMemberOf) {
          if (!squad) continue;
          res.push(squad);
        }
        break;
      case 'all':
        const allSquads = await Squad.find();
        res = res.concat(allSquads);
        break;
      default:
        throw new UserInputError('Invalid filtermode');
    }

    const squadsWithPersons = await Promise.all(
      res.map(async (s) => {
        const members: (Person | undefined)[] = await Promise.all(
          s.members.map((p) => Person.findOne(p))
        );
        return {
          ...s,
          members,
        };
      })
    );

    return squadsWithPersons;
  },
};

export const squadQuery = {
  type: squadType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    parent: Record<string, never>,
    args: any,
    context: IContext
  ) => {
    const squad = await Squad.findOne(args.id, { relations: ['members'] });
    if (!squad) throw new UserInputError('Invalid squad ID');
    return squad;
  },
};
