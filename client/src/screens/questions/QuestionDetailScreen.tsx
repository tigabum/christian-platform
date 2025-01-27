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
      <View style={styles.questionContainer}>
        <Text style={styles.title}>{question.title}</Text>
        <Text style={styles.content}>{question.content}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.asker}>
            Asked by: {question.isAnonymous ? 'Anonymous' : question.asker.name}
          </Text>
          <Text style={styles.date}>
            {new Date(question.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusContainer, styles[question.status]]}>
          <Text style={styles.statusText}>{question.status}</Text>
        </View>
      </View>

      {question.answer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerTitle}>Answer</Text>
          <Text style={styles.answerContent}>{question.answer.content}</Text>
          <Text style={styles.answerMeta}>
            Answered by: {question.responder?.name}
          </Text>
          <Text style={styles.answerDate}>
            {new Date(question.answer.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
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
  questionContainer: {
    backgroundColor: 'white',
    margin: 15,
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
    color: '#333',
  },
  content: {
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  asker: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  pending: {
    backgroundColor: '#FFA500',
  },
  accepted: {
    backgroundColor: '#32CD32',
  },
  answered: {
    backgroundColor: '#007AFF',
  },
  forwarded: {
    backgroundColor: '#8A2BE2',
  },
  answerContainer: {
    backgroundColor: '#E8F4FF',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  answerContent: {
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
    lineHeight: 24,
  },
  answerMeta: {
    fontSize: 14,
    color: '#666',
  },
  answerDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default QuestionDetailScreen;
