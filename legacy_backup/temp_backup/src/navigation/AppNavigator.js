import NewHomeScreen from '../screens/NewHomeScreen';

// Then in your Tab.Navigator or Stack.Navigator:
<Tab.Screen 
  name="NewHome" 
  component={NewHomeScreen}
  options={{
    tabBarLabel: 'New Home',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="home" size={size} color={color} />
    ),
  }}
/>
