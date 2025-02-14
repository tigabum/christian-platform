import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import api from '../../api/axios';
import {Question} from '../../types/question';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {debounce} from '../../utils/debounce';
import Icon from 'react-native-vector-icons/Ionicons';
import {formatDate} from '../../utils/dateFormatter';

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
          ? '/questions/public'
          : `/questions/my?status=${filter}`;

      if (searchQuery) {
        endpoint += `${
          endpoint.includes('?') ? '&' : '?'
        }search=${searchQuery}`;
      }

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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterTab,
              filter === option.id && styles.filterTabActive,
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

      {/* Questions List */}
      <FlatList
        data={questions}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.questionCard}
            onPress={() =>
              navigation.navigate('QuestionDetail', {id: item._id})
            }>
            <Text style={styles.questionTitle}>{item.title}</Text>
            <Text style={styles.questionContent} numberOfLines={2}>
              {item.content}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'assigned' ? '#4CAF50' : '#007AFF',
                  },
                ]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchQuestions} />
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Question FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AskQuestion')}>
        <Text style={styles.fabIcon}>+</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  filterText: {
    fontSize: 16,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
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
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '400',
  },
});

export default HomeScreen;
