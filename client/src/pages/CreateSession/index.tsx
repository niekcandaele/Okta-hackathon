import { useLazyQuery, useMutation } from '@apollo/client';
import { ADD_QUESTION, CREATE_SESSION, SEARCH } from './queries';
import { Button, SearchField, TextField, SubPage } from 'components';
import { ButtonContainer, Container } from './style';
import { AddQuestion, CreateSessionInput, Question, Session } from 'generated';
import { useDebounce, useValidationSchema } from 'hooks';
import { FC, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { QuestionSuggestions } from './QuestionSuggestions';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';

type FormFields = {
  search: string;
}

type QuestionInput = {
  question: string;
  descriptionBad: string;
  descriptionGood: string
}

export const CreateSession: FC = () => {
  const navigate = useNavigate();
  const { squadId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = useMemo(
    () =>
      yup.object({
        question: yup.string().required('This field is required.'),
        descriptionGood: yup.string().required('This field is required.'),
        descriptionBad: yup.string().required('This field is required.')
      }), []
  );

  const { control: searchControl } = useForm<FormFields>();

  const { control, handleSubmit, formState: { errors } } = useForm<QuestionInput>({
    resolver: useValidationSchema(validationSchema),
    defaultValues: { descriptionBad: '', descriptionGood: '', question: '' }
  });

  const [createSession, { data: sessionMutation }] = useMutation<{ createSession: Session }, { input: CreateSessionInput }>(CREATE_SESSION);
  const [addQuestion, { loading, called, data: createQuestionData }] = useMutation<{ questionResponse: Question }, { input: AddQuestion }>(ADD_QUESTION);

  const [searchQuery, { data: searchData, loading: searchLoading }] = useLazyQuery(
    SEARCH,
    { variables: { input: 'english' } }
  );

  useEffect(() => {
    if (called) {
      enqueueSnackbar('Question successfully created!', { variant: 'success' });
    }
  }, [createQuestionData]);

  const searchTerm = useWatch({ control: searchControl, name: 'search' });
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const onSessionSubmit = () => {
    navigate(`/session/${sessionMutation?.createSession.id}/${squadId}`);
  };

  const onInputSubmit: SubmitHandler<QuestionInput> = ({ descriptionBad, descriptionGood, question }) => {
    if (!sessionMutation || !sessionMutation.createSession.id) return;
    addQuestion({ variables: { input: { sessionId: sessionMutation.createSession.id, question: { question, descriptionBad, descriptionGood } } } });
  };

  useEffect(() => {
    createSession({ variables: { input: { squadId } } });
  }, []);

  // Execute search query
  useEffect(() => {
    if (searchTerm) {
      searchQuery({ variables: { input: searchTerm } });
    }
  }, [debouncedSearchTerm]);

  return (
    <SubPage title="Create new session">
      <Container>
        <h2>Search for an existing question</h2>
        <SearchField
          control={searchControl}
          name="search"
          placeholder="Release"
        />
        <Container>
          <QuestionSuggestions loading={searchLoading} searchData={searchData} session={sessionMutation!}></QuestionSuggestions>
        </Container>
        <Container>
          <h2>Add a new question</h2>
          <form onSubmit={handleSubmit(onInputSubmit)}>
            <TextField
              control={control}
              error={errors.question}
              labelText="Question"
              loading={loading}
              name="question"
              placeholder="What do you think about ..."
            />
            <TextField
              control={control}
              error={errors.descriptionGood}
              labelText="Good answer"
              loading={loading}
              name="descriptionGood"
              placeholder="Its awesome!"
            />
            <TextField
              control={control}
              error={errors.descriptionBad}
              labelText="Bad answer"
              loading={loading}
              name="descriptionBad"
              placeholder="It sucks :("
            />
            <Button
              isLoading={loading}
              onClick={() => { /* dummy */ }}
              size="large"
              text="Create question"
              type="submit"
            />
          </form>
        </Container>
        <ButtonContainer>
          <Button
            onClick={() => onSessionSubmit()}
            size="large"
            text="Start session"
          />
        </ButtonContainer>
      </Container>
    </SubPage>
  );
};
