import { ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';
import { User, Category, Question, Game } from '../../../model';
import { user, authInitialized, userInfo, userDict } from './user.reducer';
import { categories } from './categories.reducer';
import { tags } from './tags.reducer';
import { questionOfTheDay, questionSaveStatus } from './questions.reducer';
import { loginRedirectUrl } from './ui-state.reducer';
import { activeGames } from './game.reducer';
import { Observable } from 'rxjs/Observable';

export * from './user.reducer';
export * from './categories.reducer';
export * from './tags.reducer';
export * from './questions.reducer';
export * from './ui-state.reducer';
export * from './game.reducer';


export interface CoreState {
  user: User;
  userInfo: User;
  userDict: { [key: string]: User };
  authInitialized: boolean;
  categories: Category[];
  tags: string[];
  questionOfTheDay: Question;
  loginRedirectUrl: string;
  questionSaveStatus: string;
  activeGames: Game[];
}

export const reducer: ActionReducerMap<CoreState> = {
  user: user,
  userInfo: userInfo,
  userDict: userDict,
  authInitialized: authInitialized,
  categories: categories,
  tags: tags,
  questionOfTheDay: questionOfTheDay,
  questionSaveStatus: questionSaveStatus,
  loginRedirectUrl: loginRedirectUrl,
  activeGames: activeGames
};

//Features
export const coreState = createFeatureSelector<CoreState>('core');
