import React, { useEffect, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { version as APP_VERSION } from '../../package.json';

import {
  Button,
  ErrorBox,
  Field,
  colors,
} from '../components/ui';

import { validarLogin, LIMITES } from '../utils/validation';
import { mensajeLogin } from '../utils/errors';

export default function Login() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ===== VALORES ANIMADOS ===== */
  const headerAnim = useRef(new Animated.Value(0)).current;  // header (fade + slide down)
  const logoAnim = useRef(new Animated.Value(0)).current;    // logo (scale + fade)
  const cardAnim = useRef(new Animated.Value(0)).current;    // card (fade + slide up)
  const footerAnim = useRef(new Animated.Value(0)).current;  // footer (fade)
  const errorAnim = useRef(new Animated.Value(0)).current;   // error (fade + slide)

  /* ===== ANIMACIÓN DE ENTRADA ===== */
  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, logoAnim, cardAnim, footerAnim]);

  /* ===== ANIMACIÓN DEL ERROR (aparece cuando cambia) ===== */
  useEffect(() => {
    if (error) {
      errorAnim.setValue(0);
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [error, errorAnim]);

  /* ===== ESTILOS ANIMADOS ===== */
  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 0],
        }),
      },
    ],
  };

  const logoStyle = {
    opacity: logoAnim,
    transform: [
      {
        scale: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        }),
      },
    ],
  };

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  const footerStyle = {
    opacity: footerAnim,
  };

  const errorStyle = {
    opacity: errorAnim,
    transform: [
      {
        translateY: errorAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 0],
        }),
      },
    ],
  };

  /* ===== SUBMIT ===== */
  const submit = async () => {
    if (loading) return; // evita enviar dos veces la misma petición

    // 1) Validación de entradas: nada se envía al servicio si los datos no son válidos
    const check = validarLogin({ email, password });
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(check.valores.email, check.valores.password);
    } catch (e) {
      // 2) Manejo seguro de errores: mensaje controlado, nunca el texto crudo del servidor
      setError(mensajeLogin(e));
      setPassword(''); // la contraseña no se conserva en pantalla tras un intento fallido
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HEADER ===== */}
        <Animated.View style={[s.header, headerStyle, { paddingTop: insets.top + 28 }]}>
          <View style={s.decorCircle1} />
          <View style={s.decorCircle2} />

          <Animated.View style={[s.logoRing, logoStyle]}>
            <View style={s.logoContainer}>
              <Image
                source={require('../img/logo-healthnexus.png')}
                style={s.logo}
                resizeMode="contain"
                accessibilityLabel="Logo de HealthNexus"
              />
            </View>
          </Animated.View>

          <Text style={s.brand}>HealthNexus</Text>

          <View style={s.headerDivider} />

          <Text style={s.welcome}>Bienvenido de nuevo</Text>

          <Text style={s.subtitle}>
            Accede a tu plataforma de gestión hospitalaria
          </Text>
        </Animated.View>

        {/* ===== CARD ===== */}
        <View style={s.content}>
          <Animated.View style={[s.card, cardStyle]}>
            <View style={s.cardHeader}>
              <Text style={s.title}>Iniciar sesión</Text>
              <Text style={s.description}>
                Ingresa tus credenciales para continuar
              </Text>
            </View>

            <View style={s.form}>
              <Field
                label="Correo electrónico"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@hospital.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                maxLength={LIMITES.emailMax}
              />

              <Field
                label="Contraseña"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                autoComplete="password"
                maxLength={LIMITES.passwordMax}
              />
            </View>

            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.7}
              style={s.forgotWrap}
            >
              <Text style={s.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {error ? (
              <Animated.View style={[s.errorContainer, errorStyle]}>
                <ErrorBox message={error} />
              </Animated.View>
            ) : null}

            <Button
              title="Iniciar sesión"
              icon="log-in-outline"
              onPress={submit}
              loading={loading}
            />

            {/* Badge de seguridad */}
            <View style={s.securityBadge}>
              <View style={s.securityDot} />
              <Text style={s.securityText}>
                Conexión segura · Datos cifrados
              </Text>
            </View>
          </Animated.View>

          {/* ===== FOOTER ===== */}
          <Animated.View style={[s.footerWrap, footerStyle]}>
            <Text style={s.footer}>HealthNexus</Text>
            <Text style={s.version}>
              Sistema de gestión hospitalaria · v{APP_VERSION}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scroll: {
    flexGrow: 1,
  },

  /* ===== HEADER ===== */
  header: {
    backgroundColor: colors.tealDeep,
    paddingTop: Platform.OS === 'ios' ? 70 : 54,
    paddingBottom: 68,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    overflow: 'hidden',
  },

  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  decorCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  logoRing: {
    padding: 6,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 22,
  },

  logoContainer: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  logo: {
    width: 82,
    height: 82,
  },

  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },

  headerDivider: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: 16,
    marginBottom: 18,
  },

  welcome: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },

  /* ===== CONTENT ===== */
  content: {
    paddingHorizontal: 22,
    marginTop: -32,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,

    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },

  cardHeader: {
    marginBottom: 22,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },

  description: {
    fontSize: 13,
    color: colors.sub,
    marginTop: 6,
  },

  form: {
    gap: 6,
  },

  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 18,
  },

  forgot: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },

  errorContainer: {
    marginBottom: 14,
  },

  /* ===== SECURITY BADGE ===== */
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },

  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
    marginRight: 8,
  },

  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.sub,
    letterSpacing: 0.2,
  },

  /* ===== FOOTER ===== */
  footerWrap: {
    alignItems: 'center',
    marginTop: 34,
    marginBottom: 28,
  },

  footer: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.tealDeep,
    letterSpacing: 0.6,
  },

  version: {
    fontSize: 10,
    color: colors.faint,
    marginTop: 6,
    letterSpacing: 0.3,
  },
});