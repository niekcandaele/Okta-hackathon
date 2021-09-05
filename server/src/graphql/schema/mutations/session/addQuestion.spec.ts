import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { Session } from '../../../../orm/entity/Session';
import { Squad } from '../../../../orm/entity/Squad';
import { getDb } from '../../../../rejson/db';
import { testClient } from '../../../../test/testClient.spec';

chai.use(sinonChai);
const expect = chai.expect;
describe('MUTATION addQuestion', () => {
  it('Adds the question to the search index', async () => {
    const db = await getDb();
    const spy = sinon.spy(db, 'hset');
    const squad = await Squad.create({ name: 'aaa' }).save();
    const session = await Session.create({ squad }).save();

    const addQuestion = `
        mutation addQuestion {
          addQuestion(
            input: {
              question: {question: "How you doin"}
              sessionId: "${session.id}"
            }
          ) {
            id
            question
            answers {
              answer
            }
          }
        }`;
    const addQuestionRes = await testClient.mutate({ mutation: addQuestion });
    console.log(JSON.stringify(addQuestionRes, null, 4));

    const lastCall = spy.lastCall;
    expect(lastCall.args[2]).to.be.equal('How you doin');
  });
});
