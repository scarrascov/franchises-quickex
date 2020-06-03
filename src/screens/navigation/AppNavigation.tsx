import { createStackNavigator } from 'react-navigation-stack'
import Inicio from '../Main'

const AppNavigation = createStackNavigator(
  {
    Inicio: { screen: Inicio }
  },
  {
    initialRouteName: 'Inicio'
  }
)

export default AppNavigation