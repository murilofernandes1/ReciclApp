import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Home: undefined;
  Reciclar: undefined;
  Ranking: undefined;
  Info: undefined;
};

export type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;
export type ReciclarScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Reciclar'>;
export type RankingScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Ranking'>;