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
import {useAuth} from '../../context/AuthContext';

type QuestionDetailRouteProp = RouteProp<RootStackParamList, 'QuestionDetail'>;

const QuestionDetailScreen = () => {
  const route = useRoute<QuestionDetailRouteProp>();
  const navigation = useNavigation();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

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

  const renderQuestionMeta = () => {
    if (!question) return null;

    return (
      <View style={styles.metaContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Asked on</Text>
          <Text style={styles.date}>
            {new Date(question.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Only show if it's user's own question */}
        {question.asker?._id === user?._id && (
          <View style={styles.askerContainer}>
            <Text style={styles.metaLabel}>Asked by</Text>
            <Text style={styles.metaValue}>{question.asker?.name}</Text>
          </View>
        )}
      </View>
    );
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
        {/* Title Section */}
        <Text style={styles.title}>{question.title}</Text>

        {/* Content Section */}
        <Text style={styles.content}>{question.content}</Text>

        {/* Meta Information */}
        {renderQuestionMeta()}

        {/* Assignment Section */}
        {question.responder && (
          <View style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>Assignment Details</Text>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusColor(question.status)},
                ]}>
                <Text style={styles.statusText}>{question.status}</Text>
              </View>
            </View>
            <View style={styles.assignmentDetails}>
              <Text style={styles.responderLabel}>Assigned to</Text>
              <Text style={styles.responderName}>
                {question.responder.name}
              </Text>
              <Text style={styles.assignmentDate}>
                {question.assignedAt &&
                  `Assigned on ${new Date(
                    question.assignedAt,
                  ).toLocaleDateString()}`}
              </Text>
            </View>
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
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#333',
  },
  askerContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
  },
  assignmentCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  assignmentDetails: {
    gap: 4,
  },
  responderLabel: {
    fontSize: 12,
    color: '#666',
  },
  responderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  assignmentDate: {
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
