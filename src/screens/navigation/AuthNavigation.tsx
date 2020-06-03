import { createStackNavigator } from 'react-navigation-stack'
import Login from '../LoginScreen'

const AuthNavigation = createStackNavigator(
  {
    Login: { screen: Login },
  },
  {
    initialRouteName: 'Login'
  }
)

export default AuthNavigation