import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import api from '../../api/axios';
import {Question} from '../../types/question';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {debounce} from '../../utils/debounce';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filterOptions = [
    {id: 'all', label: 'All'},
    {id: 'assigned', label: 'Assigned'},
    {id: 'answered', label: 'Answered'},
  ];

  useEffect(() => {
    fetchQuestions();
  }, [filter, searchQuery]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let endpoint =
        filter === 'all'
          ? '/questions/public' // Use public endpoint for 'all'
          : `/questions/my?status=${filter}`; // Use existing for others

      const response = await api.get(endpoint);
      console.log('Fetched questions:', response.data.length);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = React.useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 500),
    [],
  );
  const handleSearch = (text: string) => {
    setInputValue(text);
    debouncedSearch(text);
  };

  const getStatusColor = (
    status: 'pending' | 'assigned' | 'answered' | 'closed' | string,
  ): string => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'assigned':
        return '#32CD32';
      case 'answered':
        return '#007AFF';
      case 'closed':
        return '#666666';
      default:
        return '#999999';
    }
  };

  const renderQuestion = ({item}: {item: Question}) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => navigation.navigate('QuestionDetail', {id: item._id})}>
      <Text style={styles.questionTitle}>{item.title}</Text>
      <Text style={styles.questionContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.questionMeta}>
        <Text style={styles.questionDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.responder && (
          <Text style={styles.assignedTo}>
            Assigned to: {item.responder.name}
          </Text>
        )}
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          value={inputValue}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterButton,
                filter === option.id && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(option.id)}>
              <Text
                style={[
                  styles.filterText,
                  filter === option.id && styles.filterTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={fetchQuestions}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No questions found'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AskQuestion')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  questionContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionDate: {
    fontSize: 14,
    color: '#999',
  },
  assignedTo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen;
