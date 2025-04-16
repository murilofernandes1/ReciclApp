import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DeviceEventEmitter } from 'react-native';

interface Time {
  id: string;
  nome: string;
  pontos: number;
}

interface HistoricoItem {
  timeId: string;
  material: string;
  pontos: number;
  data: string;
}

const RankingScreen = () => {
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        const [timesSalvos, historicoSalvo] = await Promise.all([
          AsyncStorage.getItem('times'),
          AsyncStorage.getItem('historico')
        ]);
        
        if (timesSalvos) {
          const timesOrdenados: Time[] = JSON.parse(timesSalvos)
            .sort((a: Time, b: Time) => b.pontos - a.pontos);
          setTimes(timesOrdenados);
        }
        
        if (historicoSalvo) {
          setHistorico(JSON.parse(historicoSalvo).slice(0, 5));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    if (isFocused) {
      carregarDados();
    }
  }, [isFocused]);

  const renderItem = ({ item, index }: { item: Time; index: number }) => (
    <View style={[
      styles.timeItem,
      index === 0 && styles.firstPlace,
      index === 1 && styles.secondPlace,
      index === 2 && styles.thirdPlace
    ]}>
      <View style={styles.positionContainer}>
        {index < 3 ? (
          <Icon 
            name={index === 0 ? "trophy" : index === 1 ? "medal" : "medal"} 
            size={24} 
            color={index === 0 ? "#2e7d32" : index === 1 ? "#2e7d32" : "#2e7d32"} 
          />
        ) : (
          <Text style={styles.positionText}>{index + 1}º</Text>
        )}
      </View>
      
      <Text style={styles.timeName} numberOfLines={1}>{item.nome}</Text>
      
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>{item.pontos}</Text>
        <Icon name="star" size={16} color="#2e7d32" />
      </View>
    </View>
  );

  const renderHistoricoItem = ({ item }: { item: HistoricoItem }) => {
    const time = times.find(t => t.id === item.timeId) || { nome: 'Equipe' };
    
    return (
      <View style={styles.historicoItem}>
        <View style={styles.historicoIcon}>
          <Icon name="recycle" size={20} color="#2e7d32" />
        </View>
        <View style={styles.historicoInfo}>
          <Text style={styles.historicoText}>
            <Text style={styles.timeNameText}>{time.nome}</Text> reciclou {item.material}
          </Text>
          <View style={styles.historicoMeta}>
            <Text style={styles.historicoPoints}>+{item.pontos} pontos</Text>
            <Text style={styles.historicoDate}>
              {new Date(item.data).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a equipe');
      return;
    }

    try {
      const newTeam: Time = {
        id: Date.now().toString(),
        nome: newTeamName.trim(),
        pontos: 0
      };

      const updatedTeams = [...times, newTeam];
      await AsyncStorage.setItem('times', JSON.stringify(updatedTeams));
      await AsyncStorage.setItem('lastUpdate', Date.now().toString());
      
      setTimes(updatedTeams.sort((a, b) => b.pontos - a.pontos));
      setNewTeamName('');
      setShowAddTeamModal(false);
    } catch (error) {
      console.error('Erro ao adicionar equipe:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a equipe');
    }
  };

  const handleResetPoints = async () => {
    try {
      const updatedTeams = times.map(team => ({
        ...team,
        pontos: 0
      }));

      await Promise.all([
        AsyncStorage.setItem('times', JSON.stringify(updatedTeams)),
        AsyncStorage.removeItem('historico'),
        AsyncStorage.removeItem('historicoReciclagem'),
        AsyncStorage.setItem('lastUpdate', Date.now().toString())
      ]);

      setTimes(updatedTeams);
      setHistorico([]);
      setShowResetModal(false);
      
      DeviceEventEmitter.emit('updateHome');
      Alert.alert('Sucesso!', 'Todos os pontos foram resetados!');
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      Alert.alert('Erro', 'Não foi possível resetar os dados');
    }
  };

  const handleDeleteAllTeams = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('times'),
        AsyncStorage.removeItem('historico'),
        AsyncStorage.removeItem('historicoReciclagem'),
        AsyncStorage.setItem('lastUpdate', Date.now().toString())
      ]);
      
      setTimes([]);
      setHistorico([]);
      setShowDeleteModal(false);
      
      DeviceEventEmitter.emit('updateHome');
      Alert.alert('Sucesso!', 'Todas as equipes foram removidas!');
    } catch (error) {
      console.error('Erro ao remover equipes:', error);
      Alert.alert('Erro', 'Não foi possível remover as equipes');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

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
        <Text style={styles.slogan}>Ranking de Equipes</Text>
      </View>

      <FlatList
        data={times}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma equipe cadastrada ainda</Text>
        }
      />

      <TouchableOpacity 
        style={styles.manageHeader}
        onPress={() => setShowManageOptions(!showManageOptions)}
      >
        <View style={styles.sectionHeader}>
          <Icon name="cog" size={20} color="#2e7d32" />
          <Text style={styles.sectionTitle}>Gerenciar Equipes</Text>
        </View>
        <Icon 
          name={showManageOptions ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#2e7d32" 
        />
      </TouchableOpacity>
      
      {showManageOptions && (
        <View style={styles.managementOptions}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setShowAddTeamModal(true)}
          >
            <Icon name="account-plus" size={24} color="#2e7d32" />
            <Text style={styles.optionText}>Adicionar Equipe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setShowResetModal(true)}
          >
            <Icon name="refresh" size={24} color="#2e7d32" />
            <Text style={styles.optionText}>Zerar Pontuações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionButton, styles.deleteButton]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Icon name="delete" size={24} color="#2e7d32" />
            <Text style={[styles.optionText, styles.deleteText]}>Remover Todas</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showAddTeamModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Nova Equipe</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da equipe"
              value={newTeamName}
              onChangeText={setNewTeamName}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddTeamModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddTeam}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Zerar Pontuações</Text>
            <Text style={styles.modalMessage}>Isso resetará TODOS os pontos e históricos. Tem certeza?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleResetPoints}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remover Todas as Equipes</Text>
            <Text style={styles.modalMessage}>Isso removerá TODAS as equipes permanentemente. Tem certeza?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={handleDeleteAllTeams}
              >
                <Text style={styles.modalButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.historicoHeader} 
        onPress={() => setShowHistorico(!showHistorico)}
      >
        <View style={styles.sectionHeader}>
          <Icon name="clock-outline" size={20} color="#2e7d32" />
          <Text style={styles.sectionTitle}>Últimas Reciclagens</Text>
        </View>
        <Icon 
          name={showHistorico ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#2e7d32" 
        />
      </TouchableOpacity>
      
      {showHistorico && (
        <View style={styles.historicoContainer}>
          {historico.length > 0 ? (
            <FlatList
              data={historico}
              renderItem={renderHistoricoItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyHistorico}>Nenhuma reciclagem recente</Text>
          )}
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#95FF93',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  slogan: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    fontFamily: 'arimo'
  },
  listContainer: {
    paddingBottom: 10,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
  },
  firstPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  secondPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
  },
  thirdPlace: {
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
  },
  positionContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  positionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  timeName: {
    flex: 1,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#2e7d32',
    marginTop: 20,
    fontSize: 16,
  },
  manageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 8,
  },
  managementOptions: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  optionText: {
    fontSize: 16,
    color: '#2e7d32',
    marginLeft: 10,
  },
  deleteText: {
    color: '#2e7d32',
  },
  historicoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  historicoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 125, 50, 0.2)',
  },
  historicoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historicoInfo: {
    flex: 1,
  },
  historicoText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  timeNameText: {
    fontWeight: 'bold',
  },
  historicoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  historicoPoints: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  historicoDate: {
    fontSize: 12,
    color: 'rgba(46, 125, 50, 0.7)',
  },
  emptyHistorico: {
    textAlign: 'center',
    color: '#2e7d32',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#95FF93',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#2e7d32',
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
  },
  deleteConfirmButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RankingScreen;