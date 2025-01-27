import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useContext} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/questions/HomeScreen';
import AskQuestionScreen from '../screens/questions/AskQuestionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import QuestionDetailScreen from '../screens/questions/QuestionDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  AskQuestion: undefined;
  QuestionDetail: {id: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const {isSignedIn} = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      {!isSignedIn ? (
        // Auth Stack
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{headerShown: false}}
          />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({navigation}) => ({
              title: 'Questions',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={{marginRight: 15}}>
                  <Text style={{color: '#007AFF', fontSize: 16}}>Profile</Text>
                </TouchableOpacity>
              ),
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#007AFF',
            })}
          />
          <Stack.Screen
            name="AskQuestion"
            component={AskQuestionScreen}
            options={{
              title: 'Ask a Question',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#007AFF',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'My Profile',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#007AFF',
            }}
          />
          <Stack.Screen
            name="QuestionDetail"
            component={QuestionDetailScreen}
            options={{title: 'Question'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
