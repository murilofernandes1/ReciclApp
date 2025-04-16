import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const InfoScreen = () => {
  const informacoes = [
    {
      titulo: 'Como Usar o App',
      icone: 'cellphone-information',
      itens: [
        '1. Usando o celular do responsável pela atividade, na tela "Ranking", crie as equipes que participarão da reciclagem',
        '2. Registre as coletas na tela "Reciclar" e indique a equipe responsável pela coleta',
        '3. Quanto mais poluente for o material reciclado, mais pontos serão adicionados a equipe',
        '4. Acompanhe a pontuação de cada equipe pela tela "Ranking" e a pontuação geral dos times na tela "Home"',
        '5. Ao final da atividade, recompense os alunos pela contribuição com o Planeta!'
      ] 
    },
    {
      titulo: 'Objetivo Educacional',
      icone: 'school',
      itens: [
        '• O app foi criado para uso em sala de aula',
        '• Transforma a reciclagem em uma atividade lúdica',
        '• Incentiva a competição saudável entre alunos',
        '• Mostra o impacto ambiental em tempo real',
        '• Educação ambiental prática e divertida'
      ]
    },
    {
      titulo: 'Como Reciclar Corretamente',
      icone: 'recycle',
      itens: [
        'Separe os materiais por tipo (plástico, vidro, papel, metal)',
        'Limpe os resíduos antes de descartar',
        'Compacte as embalagens para economizar espaço',
        'Utilize os pontos de coleta da escola'
      ]
    },
    {
      titulo: 'Benefícios da Reciclagem',
      icone: 'leaf',
      itens: [
        'Preserva recursos naturais e reduz o desmatamento',
        'Diminui a poluição do ar, água e solo',
        'Economiza energia na produção de novos materiais',
        'Reduz o acúmulo de lixo em aterros sanitários'
      ]
    }
  ];

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/reciclalogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {informacoes.map((secao, index) => (
        <View key={index} style={styles.secaoContainer}>
          <View style={styles.secaoTituloContainer}>
            <Icon name={secao.icone} size={28} color="#2e7d32" />
            <Text style={styles.secaoTitulo}>{secao.titulo}</Text>
          </View>
          
          {secao.itens.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.itemContainer}>
              <Icon name="checkbox-marked-circle" size={20} color="#2e7d32" style={styles.itemIcon} />
              <Text style={styles.itemTexto}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.creditosContainer}>
        <Text style={styles.creditosTitulo}>Desenvolvido por</Text>
        <View style={styles.creditoItem}>
          <Icon name="account" size={20} color="#2e7d32" />
          <Text style={styles.creditoTexto}>Murilo Fernandes</Text>
        </View>
        <View style={styles.creditoItem}>
          <Icon name="account" size={20} color="#2e7d32" />
          <Text style={styles.creditoTexto}>Heloisa Porto</Text>
        </View>
        <Text style={styles.creditoAno}>2025 - Versão 1.0</Text>
      </View>

      <View style={styles.rodape}>
        <Icon name="earth" size={30} color="#2e7d32" />
        <Text style={styles.rodapeTexto}>Juntos podemos transformar a educação ambiental!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#95FF93',
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  slogan: {
    fontSize: 22,
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
    marginBottom: 20,
  },
  secaoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  secaoTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  itemIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  itemTexto: {
    fontSize: 15,
    color: '#2e7d32',
    flex: 1,
    lineHeight: 22,
  },
  creditosContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  creditosTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  creditoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  creditoTexto: {
    fontSize: 15,
    color: '#2e7d32',
    marginLeft: 10,
  },
  creditoAno: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  rodape: {
    alignItems: 'center',
    marginTop: 10,
  },
  rodapeTexto: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default InfoScreen;