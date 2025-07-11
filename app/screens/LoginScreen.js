import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmail, signUpWithEmail, resetPasswordForEmail } from '../utils/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    console.log('Attempting to', isSignUp ? 'sign up' : 'sign in', 'with:', email);
    setLoading(true);

    const { error } = isSignUp
      ? await signUpWithEmail(email, password, username)
      : await signInWithEmail(email, password);

    setLoading(false);

    if (error) {
      console.error('Authentication error:', error.message);
      return Alert.alert('Authentication Error', error.message);
    } else if (isSignUp) {
      console.log('Sign up successful, pending confirmation.');
      return Alert.alert('Success', 'Sign up successful! Please check your email to confirm your account.');
    }
    // On successful sign-in, the AuthContext listener will handle navigation automatically.
    console.log('Sign in successful. Waiting for AuthContext to redirect.');
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address to reset your password.');
      return;
    }
    const { error } = await resetPasswordForEmail(email);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password reset link sent! Please check your email.');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-3xl font-bold text-primary mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      <Text className="mb-6 text-base text-gray-600 dark:text-gray-300">
        {isSignUp ? 'Sign up to get started' : 'Sign in to your VAI account'}
      </Text>
      {isSignUp && (
        <TextInput
          className="w-80 h-12 border border-gray-300 rounded-md px-4 text-base"
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
      )}
      <TextInput
        className="mt-4 w-80 h-12 border border-gray-300 rounded-md px-4 text-base"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="mt-3 w-80 h-12 border border-gray-300 rounded-md px-4 text-base"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View className="mt-6 w-80">
        <Button
          title={loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
          onPress={handleAuth}
          color="#007AFF"
          disabled={loading || !email || !password}
        />
      </View>
      <View className="flex-row justify-between w-80 mt-4">
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text className="text-blue-500 underline">
            {isSignUp ? 'Back to Login' : "Don't have an account?"}
          </Text>
        </TouchableOpacity>
        {!isSignUp && (
          <TouchableOpacity onPress={handlePasswordReset}>
            <Text className="text-blue-500 underline">Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LoginScreen;
