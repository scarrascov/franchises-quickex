
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, YellowBox } from 'react-native';

import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer} from 'react-navigation';
import LoginScreen from "./src/screens/LoginScreen";
import MainScreen from "./src/screens/Main";
import DetailedScreen from "./src/screens/Detailed";
import PictureScreen from "./src/screens/Picture";

const RootStack = createStackNavigator(
    {
        Login: { screen: LoginScreen, },
        Inicio: { screen: MainScreen },
        Detalle: {screen: DetailedScreen},
        CapturaImagen : {screen: PictureScreen}
    },
    {
        initialRouteName: 'Login',
        defaultNavigationOptions: {
            headerShown: false
        },
    }
    

);
const App = createAppContainer(RootStack);

export default App;