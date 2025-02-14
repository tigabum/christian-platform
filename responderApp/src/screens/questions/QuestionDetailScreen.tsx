import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {useAuth} from '../../contexts/AuthContext';
import api from '../../api/axios';
import {formatDate} from '../../utils/dateFormatter';

type QuestionDetailRouteProp = RouteProp<RootStackParamList, 'QuestionDetail'>;

type QuestionDetail = {
  _id: string;
  title: string;
  content: string;
  status: 'pending' | 'assigned' | 'answered' | 'closed';
  answer?: string;
  createdAt: string;
  asker: {
    name: string;
    isAnonymous: boolean;
  };
};

const QuestionDetailScreen = () => {
  const route = useRoute<QuestionDetailRouteProp>();
  const navigation = useNavigation();
  const {user} = useAuth();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestionDetail();
  }, []);

  const fetchQuestionDetail = async () => {
    try {
      const response = await api.get(`/questions/${route.params.id}`);
      setQuestion(response.data);
      if (response.data.answer) {
        setAnswer(response.data.answer);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnswering = async () => {
    try {
      await api.patch(`/responder/questions/${question?._id}/start`);
      setQuestion(prev => (prev ? {...prev, status: 'assigned'} : null));
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please provide an answer');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/responder/questions/${question?._id}/answer`, {
        answer,
      });
      Alert.alert('Success', 'Answer submitted successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question Detail</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView style={styles.container} bounces={false}>
          <View style={styles.content}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color="#007AFF"
                  style={styles.icon}
                />
                <Text style={styles.title}>{question?.title}</Text>
              </View>

              <View
                style={[styles.statusBadge, getStatusStyle(question?.status)]}>
                <Text style={styles.statusText}>
                  {question?.status === 'assigned'
                    ? 'In Progress'
                    : question?.status}
                </Text>
              </View>

              <Text style={styles.questionContent}>{question?.content}</Text>

              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {question?.asker?.isAnonymous
                      ? 'Anonymous'
                      : question?.asker?.name}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {question?.createdAt ? formatDate(question.createdAt) : ''}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.answerSection}>
              <Text style={styles.answerHeader}>Your Answer</Text>
              <TextInput
                style={styles.answerInput}
                multiline
                placeholder="Type your answer here..."
                value={answer}
                onChangeText={setAnswer}
                editable={question?.status !== 'answered'}
              />

              {question?.status === 'pending' && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartAnswering}>
                  <Ionicons
                    name="play"
                    size={20}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Start Answering</Text>
                </TouchableOpacity>
              )}

              {question?.status === 'assigned' && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitAnswer}
                  disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="white"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Submit Answer</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const getStatusStyle = (status?: QuestionDetail['status']) => {
  switch (status) {
    case 'pending':
      return styles.pendingBadge;
    case 'assigned':
      return styles.inProgressBadge;
    case 'answered':
      return styles.answeredBadge;
    default:
      return styles.pendingBadge;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 32, // Balance the header
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
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
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  answerSection: {
    marginTop: 24,
  },
  answerHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestionDetailScreen;
