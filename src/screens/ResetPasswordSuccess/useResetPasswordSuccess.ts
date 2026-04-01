import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

export function useResetPasswordSuccess() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const onPressContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN }],
    });
  };

  return {
    onPressContinue,
  };
}
