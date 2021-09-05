import { datatype } from 'faker';

import { Person } from '../orm/entity/Person';
import { Session } from '../orm/entity/Session';
import { Squad } from '../orm/entity/Squad';
import { defaultQuestions } from '../redisearch/client';

/**
 * Utility to faster create an actor in tests.
 */
export async function createPerson(
  name: 'harry' | 'ron' | 'draco'
): Promise<Person> {
  switch (name) {
    case 'harry':
      return Person.create({
        firstName: 'Harry',
        lastName: 'Potter',
        email: 'harry.potter@wizard.net',
      }).save();
    case 'ron':
      return Person.create({
        firstName: 'Ron',
        lastName: 'Weasley',
        email: 'ron.weasley@wizard.net',
      }).save();
    case 'draco':
      return Person.create({
        firstName: 'Draco',
        lastName: 'Malfoy',
        email: 'draco.malfoy@wizard.net',
      }).save();
  }
}

export async function setUpTestData(
  amountOfSessions = 10,
  endSessions = false
) {
  const squad = await Squad.create({ name: 'testers' }).save();
  const harry = await createPerson('harry');
  const ron = await createPerson('ron');
  const draco = await createPerson('draco');

  const sessions: Session[] = [];

  for (let i = 0; i < amountOfSessions; i++) {
    const session = await Session.create({ squad }).save();
    for (const q of defaultQuestions) {
      const question = await session.addQuestion(q);
      for (const person of [harry, ron, draco]) {
        await session.answerQuestion(
          question.id,
          person.id,
          datatype.number({ min: 0, max: 2 })
        );
      }
    }

    if (endSessions) {
      await session.end();
    }
    sessions.push(session);
  }

  return { sessions, squad, persons: { harry, ron, draco } };
}

export async function wait(seconds = 0.5) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
