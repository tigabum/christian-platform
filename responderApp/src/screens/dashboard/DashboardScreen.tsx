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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Question = {
  _id: string;
  title: string;
  content: string;
  status: 'pending' | 'inProgress' | 'answered';
  createdAt: string;
  asker: {
    name: string;
    isAnonymous: boolean;
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

  const renderQuestion = ({item}: {item: Question}) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => navigation.navigate('QuestionDetail', {id: item._id})}>
      <View style={styles.questionHeader}>
        <View style={styles.titleContainer}>
          <MaterialIcons
            name="help-outline"
            size={24}
            color="#007AFF"
            style={styles.icon}
          />
          <Text style={styles.questionTitle}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>
            {item.status === 'inProgress' ? 'In Progress' : item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.questionContent} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.questionMeta}>
        <View style={styles.askerInfo}>
          <MaterialIcons name="person-outline" size={16} color="#666" />
          <Text style={styles.askedBy}>
            {item.asker?.isAnonymous
              ? 'Anonymous'
              : item.asker?.name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.dateInfo}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status: Question['status']) => {
    switch (status) {
      case 'pending':
        return styles.pendingBadge;
      case 'inProgress':
        return styles.inProgressBadge;
      case 'answered':
        return styles.answeredBadge;
      default:
        return styles.pendingBadge;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Questions Dashboard</Text>
          <TouchableOpacity
            onPress={() => {
              /* Add profile navigation */
            }}>
            <MaterialIcons
              name="person-circle-outline"
              size={28}
              color="#007AFF"
            />
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
            renderItem={renderQuestion}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    marginRight: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  inProgressBadge: {
    backgroundColor: '#E3F2FD',
  },
  answeredBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  askerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  askedBy: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
