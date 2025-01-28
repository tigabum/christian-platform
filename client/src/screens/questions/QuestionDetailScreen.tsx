import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/AppNavigator';
import api from '../../api/axios';
import {Question} from '../../types/question';

type QuestionDetailRouteProp = RouteProp<RootStackParamList, 'QuestionDetail'>;

const QuestionDetailScreen = () => {
  const route = useRoute<QuestionDetailRouteProp>();
  const navigation = useNavigation();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionDetails();
  }, []);

  const fetchQuestionDetails = async () => {
    try {
      const response = await api.get(`/questions/${route.params.id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question details:', error);
      Alert.alert('Error', 'Failed to load question details');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Question not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{question.title}</Text>
        <Text style={styles.content}>{question.content}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.askerText}>
            Asked by:{' '}
            {question.isAnonymous
              ? 'Anonymous'
              : question.asker?.name || 'Unknown'}
          </Text>
          <Text style={styles.date}>
            {new Date(question.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(question.status)},
          ]}>
          <Text style={styles.statusText}>{question.status}</Text>
        </View>

        {question.responder && (
          <View style={styles.responderInfo}>
            <Text style={styles.responderLabel}>Assigned to:</Text>
            <Text style={styles.responderName}>{question.responder.name}</Text>
            {question.assignedAt && (
              <Text style={styles.assignedDate}>
                Assigned on:{' '}
                {new Date(question.assignedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {question.answer && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Answer:</Text>
            <Text style={styles.answerContent}>{question.answer.content}</Text>
            <Text style={styles.answerDate}>
              Answered on:{' '}
              {question.answeredAt
                ? new Date(question.answeredAt).toLocaleDateString()
                : 'Not answered yet'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  askerText: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  responderInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  responderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  responderName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  assignedDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  answerContainer: {
    backgroundColor: '#e8f4ff',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  answerContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  answerDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default QuestionDetailScreen;
