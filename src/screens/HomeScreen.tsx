import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, DeviceEventEmitter } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Material {
  nome: string;
  quantidade: number;
  icone: string;
  cor: string;
}

interface DadosReciclagem {
  totalItens: number;
  totalPontos: number;
  materiais: Material[];
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [dados, setDados] = useState<DadosReciclagem>({
    totalItens: 0,
    totalPontos: 0,
    materiais: [
      { nome: 'plástico', quantidade: 0, icone: 'bottle-soda', cor: '#2e7d32' },
      { nome: 'vidro', quantidade: 0, icone: 'glass-fragile', cor: '#2e7d32' },
      { nome: 'papel', quantidade: 0, icone: 'file-document', cor: '#2e7d32' },
      { nome: 'metal', quantidade: 0, icone: 'weight', cor: '#2e7d32' },
      { nome: 'eletrônico', quantidade: 0, icone: 'chip', cor: '#2e7d32' }
    ]
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  const carregarDados = useCallback(async () => {
    let isMounted = true;

    try {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      
      const [historicoJSON, updateTime] = await Promise.all([
        AsyncStorage.getItem('historicoReciclagem'),
        AsyncStorage.getItem('lastUpdate')
      ]);

      if (isMounted) {
        setLastUpdate(updateTime ? parseInt(updateTime) : 0);
      }

      if (!historicoJSON) {
        if (isMounted) {
          setDados(prev => ({
            ...prev,
            totalItens: 0,
            totalPontos: 0,
            materiais: prev.materiais.map(mat => ({ ...mat, quantidade: 0 }))
          }));
        }
        return;
      }
      
      const historico = JSON.parse(historicoJSON);
      
      let totalItens = 0;
      let totalPontos = 0;
      const materiaisAtualizados = dados.materiais.map(mat => {
        const itensMaterial = historico.filter((item: any) => 
          item.material.toLowerCase() === mat.nome.toLowerCase()
        );
        
        const quantidade = itensMaterial.length;
        const pontosMaterial = itensMaterial.reduce((sum: number, item: any) => sum + item.pontos, 0);
        
        totalItens += quantidade;
        totalPontos += pontosMaterial;
        
        return { ...mat, quantidade };
      });
      
      if (isMounted) {
        setDados({
          totalItens,
          totalPontos,
          materiais: materiaisAtualizados
        });
      }
      
    } catch (error) {
      if (isMounted) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Tente novamente.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [dados.materiais]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let updateListener: any = null;

      const loadData = async () => {
        try {
          await carregarDados();
        } catch (error) {
          if (isActive) {
            console.error('Error loading data:', error);
          }
        }
      };

      loadData();

      
      if (isActive) {
        updateListener = DeviceEventEmitter.addListener('updateHome', () => {
          carregarDados();
        });
      }

      return () => {
        isActive = false;
        if (updateListener) {
          updateListener.remove();
        }
      };
    }, [carregarDados])
  );

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        await carregarDados();
      } catch (error) {
        if (mounted) {
          console.error('Error in useEffect:', error);
        }
      }
    };

    if (isFocused) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [isFocused, lastUpdate, carregarDados]);

  const calcularBeneficios = useCallback(() => {
    return [
      { 
        icone: 'tree',
        titulo: 'Árvores preservadas', 
        valor: Math.round(dados.totalItens * 0.02),
        cor: '#2e7d32'
      },
      { 
        icone: 'water',
        titulo: 'Água economizada', 
        valor: Math.round(dados.totalItens * 100),
        unidade: 'litros',
        cor: '#2e7d32'
      },
      { 
        icone: 'cloud',
        titulo: 'CO2 evitado', 
        valor: Math.round(dados.totalItens * 3.5),
        unidade: 'kg',
        cor: '#2e7d32'
      }
    ];
  }, [dados.totalItens]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color="#2e7d32" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={carregarDados}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={carregarDados}
          colors={['#2e7d32']}
          tintColor="#2e7d32"
        />
      }
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/reciclalogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>Bem vindo(a) ao ReciclApp!</Text>
        <Text style={styles.subtitulo}>Contribuição total para o planeta Terra:</Text>
      </View>

      <View style={styles.resumoContainer}>
        <View style={styles.resumoItem}>
          <Icon name="recycle" size={32} color="#2e7d32" />
          <Text style={styles.resumoNumero}>{dados.totalItens}</Text>
          <Text style={styles.resumoTexto}>Itens reciclados</Text>
        </View>
        
        <View style={styles.resumoItem}>
          <Icon name="star" size={32} color="#2e7d32" />
          <Text style={styles.resumoNumero}>{dados.totalPontos}</Text>
          <Text style={styles.resumoTexto}>Pontos conquistados</Text>
        </View>
      </View>

      <Text style={styles.tituloSecao}>Impacto ambiental</Text>
      <View style={styles.beneficiosContainer}>
        {calcularBeneficios().map((item, index) => (
          <View key={index} style={styles.beneficioItem}>
            <Icon name={item.icone} size={28} color={item.cor} />
            <Text style={styles.beneficioTitulo}>{item.titulo}</Text>
            <Text style={styles.beneficioValor}>
              {item.valor} {item.unidade && <Text style={styles.beneficioUnidade}>{item.unidade}</Text>}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.tituloSecao}>Materiais reciclados</Text>
      <View style={styles.materiaisContainer}>
        {dados.materiais.map((item) => (
          <View key={item.nome} style={styles.materialItem}>
            <Icon name={item.icone} size={24} color={item.cor} />
            <Text style={styles.materialNome}>{item.nome}</Text>
            <Text style={styles.materialQuantidade}>{item.quantidade}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#95FF93',
    padding: 50,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#95FF93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#95FF93',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 15,
  },
  slogan: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 22,
  },
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 5,
  },
  resumoTexto: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 15,
    textAlign: 'center',
  },
  beneficiosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  beneficioItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  beneficioTitulo: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    marginTop: 5,
  },
  beneficioValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 3,
  },
  beneficioUnidade: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  materiaisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  materialNome: {
    fontSize: 16,
    color: '#2e7d32',
    marginLeft: 10,
    flex: 1,
  },
  materialQuantidade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});

export default HomeScreen;
