import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {useAuth} from '../../contexts/AuthContext';
import api from '../../api/axios';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {formatDate} from '../../utils/dateFormatter';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Question = {
  _id: string;
  title: string;
  content: string;
  status: 'pending' | 'inProgress' | 'answered';
  createdAt: string;
  isAnonymous: boolean;
  asker: {
    name: string;
  };
};

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {user} = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'pending' | 'assigned' | 'answered'
  >('pending');

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(
        `/responder/questions?status=${activeTab.toLowerCase()}`,
      );
      setQuestions(response.data);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      if (error.response?.status === 400) {
        Alert.alert(
          'Error',
          'Please set your expertise in profile before answering questions',
        );
      } else {
        Alert.alert('Error', 'Failed to fetch questions');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderQuestionCard = ({item}: {item: Question}) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => navigation.navigate('QuestionDetail', {id: item._id})}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="help-circle" size={24} color="#007AFF" />
        </View>
        <Text style={styles.questionTitle}>{item.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.questionContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.askerName}>
          {item.isAnonymous ? 'Anonymous' : item.asker?.name || 'Unknown'}
        </Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Questions Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {(['pending', 'assigned', 'answered'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab === 'assigned'
                  ? 'In Progress'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#007AFF"
          />
        ) : (
          <FlatList
            data={questions}
            renderItem={renderQuestionCard}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchQuestions();
                }}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="description" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No questions found</Text>
                <Text style={styles.emptySubtext}>Pull down to refresh</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const getStatusColor = (status: Question['status']) => {
  switch (status) {
    case 'pending':
      return {bg: '#FFF3E0', text: '#F57C00'};
    case 'inProgress': // Changed from 'assigned' to match Question type
      return {bg: '#E3F2FD', text: '#1976D2'};
    case 'answered':
      return {bg: '#E8F5E9', text: '#388E3C'};
    default:
      return {bg: '#FFF3E0', text: '#F57C00'};
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  questionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '500',
  },
  questionContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  askerName: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default DashboardScreen;
