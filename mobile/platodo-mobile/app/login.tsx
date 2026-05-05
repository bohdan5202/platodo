import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, CheckSquare } from 'lucide-react-native';
import axios from 'axios';
import { setToken } from '../utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

  const handleResendVerification = async () => {
    setResendStatus('loading');
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setResendStatus('success');
    } catch (err: any) {
      setResendStatus('error');
      RNAlert.alert('Error', err.response?.data?.message || 'Failed to resend.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.access_token || response.data.token;
      if (token) {
        await setToken(token);
        router.replace('/(tabs)/dashboard');
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      if (err.response?.data?.error === 'unverified_email') {
        setIsUnverified(true);
        setError(err.response?.data?.message);
      } else {
        setIsUnverified(false);
        setError(err.response?.data?.error || err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <CheckSquare size={32} color="#6B5CE7" />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Please enter your details to sign in.</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {isUnverified && resendStatus !== 'success' && (
              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendVerification}
                disabled={resendStatus === 'loading'}
              >
                {resendStatus === 'loading' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.resendButtonText}>Resend Verification Email</Text>
                )}
              </TouchableOpacity>
            )}
            {isUnverified && resendStatus === 'success' && (
              <Text style={styles.successText}>Verification email sent!</Text>
            )}
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#8888AA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="student@university.edu"
                placeholderTextColor="#8888AA"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#8888AA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#8888AA"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Sign in</Text>
                <ArrowRight size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: '#14142B',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#8888AA',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'DMSans_500Medium',
    color: '#EF4444',
    fontSize: 14,
  },
  resendButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  resendButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    fontSize: 12,
  },
  successText: {
    fontFamily: 'DMSans_700Bold',
    color: '#10B981',
    fontSize: 12,
    marginTop: 8,
  },
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#4A4A6A',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#14142B',
    paddingVertical: 14,
  },
  loginButton: {
    backgroundColor: '#6B5CE7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontFamily: 'DMSans_500Medium',
    color: '#8888AA',
    fontSize: 14,
  },
  footerLink: {
    fontFamily: 'DMSans_700Bold',
    color: '#6B5CE7',
    fontSize: 14,
  },
});
