import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { DeviceEventEmitter } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  Reciclar: undefined;
  Ranking: undefined;
};

type ReciclarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reciclar'>;

interface ReciclarScreenProps {
  navigation: ReciclarScreenNavigationProp;
}

type Time = {
  id: string;
  nome: string;
  pontos: number;
};

type MaterialItem = {
  nome: string;
  pontos: number;
  icone: string;
};

const MATERIAIS: MaterialItem[] = [
  { nome: 'Metal', pontos: 10, icone: 'weight' },
  { nome: 'Plástico', pontos: 8, icone: 'bottle-soda' },
  { nome: 'Vidro', pontos: 6, icone: 'glass-fragile' },
  { nome: 'Papel', pontos: 4, icone: 'file-document' },
];

const ReciclarScreen: React.FC<ReciclarScreenProps> = ({ navigation }) => {
  const [times, setTimes] = useState<Time[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Time | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    team: '',
    material: '',
    points: 0
  });
  const isFocused = useIsFocused();

  useEffect(() => {
    const carregarTimes = async () => {
      try {
        const timesSalvos = await AsyncStorage.getItem('times');
        if (timesSalvos) {
          const timesParseados = JSON.parse(timesSalvos);
          setTimes(timesParseados);
          
          if (selectedTeam) {
            const teamExists = timesParseados.some((t: Time) => t.id === selectedTeam.id);
            if (!teamExists) {
              setSelectedTeam(null);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar times:', error);
        setLoading(false);
      }
    };

    if (isFocused) {
      carregarTimes();
    }
  }, [isFocused]);

  const handleRegister = async () => {
    if (!selectedTeam || !selectedMaterial) return;

    try {
      DeviceEventEmitter.emit('updateHome');
      
      const updatedTeams = times.map(team => 
        team.id === selectedTeam.id 
          ? { ...team, pontos: team.pontos + selectedMaterial.pontos } 
          : team
      );

      const historicoItem = {
        timeId: selectedTeam.id,
        material: selectedMaterial.nome,
        pontos: selectedMaterial.pontos,
        data: new Date().toISOString()
      };

      const [historicoSalvo, ultimaReciclagem] = await Promise.all([
        AsyncStorage.getItem('historico'),
        AsyncStorage.getItem('historicoReciclagem')
      ]);

      const historicoAtualizado = historicoSalvo 
        ? [historicoItem, ...JSON.parse(historicoSalvo)] 
        : [historicoItem];

      const historicoReciclagemAtualizado = ultimaReciclagem
        ? [historicoItem, ...JSON.parse(ultimaReciclagem)]
        : [historicoItem];

      await Promise.all([
        AsyncStorage.setItem('times', JSON.stringify(updatedTeams)),
        AsyncStorage.setItem('historico', JSON.stringify(historicoAtualizado)),
        AsyncStorage.setItem('historicoReciclagem', JSON.stringify(historicoReciclagemAtualizado)),
        AsyncStorage.setItem('lastUpdate', Date.now().toString())
      ]);

      setSuccessData({
        team: selectedTeam.nome,
        material: selectedMaterial.nome,
        points: selectedMaterial.pontos
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao registrar reciclagem:', error);
      Alert.alert('Erro', 'Não foi possível registrar a reciclagem');
    }
  };

  const renderMaterialModal = () => (
    <Modal
      visible={showMaterialModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMaterialModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.materialModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione o Material</Text>
            <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
              <Icon name="close" size={24} color="#2e7d32" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMaterial?.nome || ''}
              onValueChange={(itemValue) => {
                const material = MATERIAIS.find(m => m.nome === itemValue);
                setSelectedMaterial(material || null);
                setShowMaterialModal(false);
              }}
              style={styles.picker}
              dropdownIconColor="#2e7d32"
            >
              <Picker.Item 
                label="Selecione um material" 
                value="" 
                style={styles.pickerPlaceholder}
              />
              {MATERIAIS.map((material) => (
                <Picker.Item
                  key={material.nome}
                  label={`${material.nome} (${material.pontos} pts)`}
                  value={material.nome}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          {selectedMaterial && (
            <View style={styles.selectedMaterialContainer}>
              <Icon name={selectedMaterial.icone} size={20} color="#2e7d32" />
              <Text style={styles.selectedMaterialText}>
                {selectedMaterial.nome}
              </Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  {selectedMaterial.pontos}
                </Text>
                <Icon name="star" size={16} color="#FFC107" />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/reciclalogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>Registrar Reciclagem</Text>
        <Text style={styles.subtitulo}>Contribua para o meio ambiente e ganhe pontos</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Seletor de Equipe com Ícone */}
        <TouchableOpacity 
          style={styles.teamSelector}
          onPress={() => setShowTeamModal(true)}
        >
          <Icon name="account-group" size={20} color="#2e7d32" style={styles.inputIcon} />
          <Text style={selectedTeam ? styles.teamSelectedText : styles.teamPlaceholder}>
            {selectedTeam ? selectedTeam.nome : 'Selecione a equipe'}
          </Text>
          <Icon name="chevron-down" size={24} color="#2e7d32" />
        </TouchableOpacity>

        {/* Seletor de Material com Ícone */}
        <TouchableOpacity 
          style={styles.materialSelector}
          onPress={() => setShowMaterialModal(true)}
        >
          <Icon name="trash-can" size={20} color="#2e7d32" style={styles.inputIcon} />
          <Text style={selectedMaterial ? styles.materialSelectedText : styles.materialPlaceholder}>
            {selectedMaterial ? `${selectedMaterial.nome} (${selectedMaterial.pontos} pts)` : 'Selecione o material'}
          </Text>
          <Icon name="chevron-down" size={24} color="#2e7d32" />
        </TouchableOpacity>

        {selectedMaterial && (
          <View style={styles.pointsDisplay}>
            <Text style={styles.pointsLabel}>Pontos a serem adicionados:</Text>
            <View style={styles.pointsValueContainer}>
              <Text style={styles.pointsValue}>{selectedMaterial.pontos}</Text>
              <Icon name="star" size={20} color="#2e7d32" />
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.registerButton,
            (!selectedTeam || !selectedMaterial) && styles.disabledButton
          ]}
          onPress={handleRegister}
          disabled={!selectedTeam || !selectedMaterial}
        >
          <Text style={styles.registerButtonText}>Registrar Reciclagem</Text>
          <Icon name="check-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Equipe */}
      <Modal
        visible={showTeamModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Equipe</Text>
              <TouchableOpacity onPress={() => setShowTeamModal(false)}>
                <Icon name="close" size={24} color="#2e7d32" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.teamsList}>
              {times.length > 0 ? (
                times.map(team => (
                  <TouchableOpacity
                    key={team.id}
                    style={styles.teamItem}
                    onPress={() => {
                      setSelectedTeam(team);
                      setShowTeamModal(false);
                    }}
                  >
                    <Icon name="account-group" size={20} color="#2e7d32" />
                    <Text style={styles.teamName}>{team.nome}</Text>
                    <View style={styles.teamPoints}>
                      <Text style={styles.pointsText}>{team.pontos}</Text>
                      <Icon name="star" size={16} color="#2e7d32" />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyTeamsText}>
                  Nenhuma equipe cadastrada. Crie equipes no Ranking primeiro.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderMaterialModal()}


      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          setSelectedMaterial(null);
          setSelectedTeam(null);
          navigation.navigate('Home');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successHeader}>
              <Icon name="check-circle" size={50} color="#2e7d32" />
              <Text style={styles.successTitle}>Reciclagem Registrada!</Text>
            </View>
            
            <View style={styles.successBody}>
              <Text style={styles.successText}>
                <Text style={styles.successHighlight}>{successData.team}</Text> ganhou
              </Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.successPoints}>{successData.points}</Text>
                <Icon name="star" size={24} color="#2e7d32" />
              </View>
              <Text style={styles.successText}>
                pontos por reciclar <Text style={styles.successHighlight}>{successData.material}</Text>!
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                setSelectedMaterial(null);
                setSelectedTeam(null);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.successButtonText}>Ótimo!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 20,
  },
  teamSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  materialSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  inputIcon: {
    marginRight: 10,
  },
  teamPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#95a5a6',
  },
  teamSelectedText: {
    flex: 1,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  materialPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#95a5a6',
  },
  materialSelectedText: {
    flex: 1,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  pointsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#2e7d32',
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 4,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#95FF93',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  materialModalContainer: {
    width: '90%',
    backgroundColor: '#95FF93',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 125, 50, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  teamsList: {
    marginBottom: 16,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 10,
  },
  teamPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 4,
  },
  emptyTeamsText: {
    textAlign: 'center',
    color: '#2e7d32',
    padding: 16,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerPlaceholder: {
    color: '#95a5a6',
  },
  pickerItem: {
    color: '#2e7d32',
    fontSize: 16,
  },
  selectedMaterialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  selectedMaterialText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  successModal: {
    width: '80%',
    backgroundColor: '#95FF93',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 10,
    textAlign: 'center',
  },
  successBody: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    marginVertical: 5,
  },
  successHighlight: {
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  successPoints: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginRight: 5,
  },
  successButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReciclarScreen;